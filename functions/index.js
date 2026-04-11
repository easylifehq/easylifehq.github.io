const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const openAiApiKey = defineSecret("OPENAI_API_KEY");

const taskRowsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    rows: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description:
              "A concise action-oriented task title, ideally 3-9 words, starting with a verb when natural. Do not include due dates, priority words, or long backstory.",
          },
          category: {
            type: "string",
            description:
              "Short category like School, Work, Gym, Personal, Social, Finance, Home, Health, or blank if unclear.",
          },
          dueDate: {
            type: ["string", "null"],
            description: "Due date in YYYY-MM-DD format, or null if there is no clear date.",
          },
          estimatedLength: {
            type: ["integer", "null"],
            description: "Estimated minutes, or null if no duration is implied.",
          },
          priorityTier: {
            type: "integer",
            enum: [1, 2, 3, 4, 5],
            description: "1 is highest urgency and 5 is lowest urgency.",
          },
          notes: {
            type: "string",
            description:
              "Short extra context from the brain dump that should not be lost, especially names, constraints, or why the task matters.",
          },
        },
        required: ["title", "category", "dueDate", "estimatedLength", "priorityTier", "notes"],
      },
    },
  },
  required: ["rows"],
};

function readOutputText(responseBody) {
  if (typeof responseBody.output_text === "string") {
    return responseBody.output_text;
  }

  return (responseBody.output || [])
    .flatMap((outputItem) => outputItem.content || [])
    .map((contentItem) => contentItem.text || "")
    .filter(Boolean)
    .join("\n");
}

function normalizeRow(row) {
  return {
    title: String(row.title || "").trim(),
    category: String(row.category || "").trim(),
    dueDate: typeof row.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.dueDate) ? row.dueDate : null,
    estimatedLength:
      Number.isInteger(row.estimatedLength) && row.estimatedLength > 0 ? Math.min(row.estimatedLength, 1440) : null,
    priorityTier: [1, 2, 3, 4, 5].includes(Number(row.priorityTier)) ? Number(row.priorityTier) : 3,
    notes: String(row.notes || "").trim(),
  };
}

const taskExtractionInstructions = [
  "You are the EasyList task extraction editor.",
  "The user may ramble in one huge paragraph. Your job is to find the actionable tasks hiding inside it and turn them into clean editable rows.",
  "Create one row per real action the user can do. Split separate actions even if they are in the same sentence.",
  "Do not create tasks for feelings, background, explanations, or vague worries unless there is a clear action. Put useful context in notes instead.",
  "Do not over-split a single task into tiny fragments. For example, 'email Sam about the meeting' is one task, not separate email and meeting tasks.",
  "Rewrite messy phrasing into a clear task title while preserving the user's intent.",
  "If the user says they need to remember, figure out what the thing to do is and title that as the task.",
  "Infer categories from context, not just hashtags. School/work/gym/home/personal/social/finance/health are all acceptable.",
  "Infer due dates only when the text clearly implies them. Convert relative dates using the current date. If unclear, use null.",
  "Infer estimatedLength only from explicit or strongly implied durations. If unclear, use null.",
  "Use priorityTier 1 only for urgent/asap/critical/must-do-today items; 2 for important or soon; 3 for normal; 4 for backlog/nice-to-have; 5 for someday/low.",
  "Remove duplicates and combine repeated mentions into the clearest single row.",
  "Keep notes short. Notes should help the user remember context, not repeat the title.",
  "Return no more than 20 rows, prioritizing the most actionable or time-sensitive tasks.",
].join(" ");

exports.analyzeTaskBrainDump = onRequest(
  {
    cors: true,
    secrets: [openAiApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request, response) => {
    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({ error: "Use POST." });
      return;
    }

    const authHeader = request.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";

    if (!token) {
      response.status(401).json({ error: "Sign in before using AI task analysis." });
      return;
    }

    try {
      await admin.auth().verifyIdToken(token);
    } catch (error) {
      logger.warn("Rejected unauthenticated task analysis request", error);
      response.status(401).json({ error: "Your session could not be verified." });
      return;
    }

    const brainDump = String(request.body?.brainDump || "").trim();

    if (!brainDump) {
      response.status(400).json({ error: "Brain dump text is required." });
      return;
    }

    if (brainDump.length > 8000) {
      response.status(413).json({ error: "Brain dump is too long. Keep it under 8,000 characters." });
      return;
    }

    const currentDate = String(request.body?.currentDate || new Date().toISOString().slice(0, 10));
    const apiKey = openAiApiKey.value();
    const model = process.env.OPENAI_MODEL || "gpt-5-mini";

    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: taskExtractionInstructions,
            },
            {
              role: "user",
              content: [
                `Current date: ${currentDate}.`,
                "Turn this messy brain dump into EasyList task rows.",
                "Prefer useful task extraction over line-by-line parsing.",
                "Brain dump:",
                brainDump,
              ].join("\n\n"),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "easylist_task_rows",
              strict: true,
              schema: taskRowsSchema,
            },
          },
        }),
      });

      const responseBody = await openAiResponse.json();

      if (!openAiResponse.ok) {
        logger.error("OpenAI task analysis failed", responseBody);
        response.status(502).json({ error: "OpenAI could not analyze that brain dump." });
        return;
      }

      const parsed = JSON.parse(readOutputText(responseBody));
      const rows = Array.isArray(parsed.rows)
        ? parsed.rows.map(normalizeRow).filter((row) => row.title).slice(0, 20)
        : [];

      response.status(200).json({ rows });
    } catch (error) {
      logger.error("Task analysis request failed", error);
      response.status(500).json({ error: "Task analysis failed. Try again in a moment." });
    }
  }
);
