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
            description: "A concise action-oriented task title.",
          },
          category: {
            type: "string",
            description: "Short category like School, Work, Gym, Personal, Social, or blank if unclear.",
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
            description: "Extra context from the brain dump that should not be lost.",
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
              content:
                "You convert messy brain dumps into task rows for EasyList. Preserve intent, split separate actions into separate tasks, infer dates and durations only when the text supports them, and return only schema-valid JSON.",
            },
            {
              role: "user",
              content: `Today is ${currentDate}. Turn this brain dump into editable task rows:\n\n${brainDump}`,
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
