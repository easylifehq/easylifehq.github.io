const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const openAiApiKey = defineSecret("OPENAI_API_KEY");

const allowedCorsOrigins = [
  "https://easylifehq.github.io",
  "https://www.easylifehq.com",
  "https://easylifehq.com",
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

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
            enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            description: "1 is highest urgency and 10 is lowest urgency.",
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

const projectPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: {
      type: "string",
      description: "A short, practical 1-2 sentence summary of the project plan.",
    },
    risks: {
      type: "array",
      maxItems: 5,
      items: { type: "string" },
      description: "Short risk, constraint, or decision notes the user should know before starting.",
    },
    sections: {
      type: "array",
      minItems: 2,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: {
            type: "string",
            description: "A clear project phase or workstream title.",
          },
          goal: {
            type: "string",
            description: "A short explanation of what this section accomplishes.",
          },
          suggestedDueDate: {
            type: ["string", "null"],
            description: "Suggested section due date in YYYY-MM-DD format, or null if no target date is available.",
          },
          tasks: {
            type: "array",
            minItems: 2,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: {
                  type: "string",
                  description: "A concise action-oriented task title.",
                },
                notes: {
                  type: "string",
                  description: "Short context, acceptance detail, or suggestion for the task.",
                },
                dueDate: {
                  type: ["string", "null"],
                  description: "Suggested task due date in YYYY-MM-DD format, or null.",
                },
                estimatedLength: {
                  type: ["integer", "null"],
                  description: "Estimated minutes for the task, or null.",
                },
                priorityTier: {
                  type: "integer",
                  enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                  description: "1 is highest urgency and 10 is lowest urgency.",
                },
              },
              required: ["title", "notes", "dueDate", "estimatedLength", "priorityTier"],
            },
          },
        },
        required: ["title", "goal", "suggestedDueDate", "tasks"],
      },
    },
  },
  required: ["summary", "risks", "sections"],
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
    priorityTier: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(row.priorityTier))
      ? Number(row.priorityTier)
      : 5,
    notes: String(row.notes || "").trim(),
  };
}

function normalizeProjectTask(task) {
  return {
    title: String(task.title || "").trim(),
    notes: String(task.notes || "").trim(),
    dueDate: typeof task.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) ? task.dueDate : null,
    estimatedLength:
      Number.isInteger(task.estimatedLength) && task.estimatedLength > 0
        ? Math.min(task.estimatedLength, 1440)
        : null,
    priorityTier: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(task.priorityTier))
      ? Number(task.priorityTier)
      : 5,
  };
}

function normalizeProjectSection(section) {
  const tasks = Array.isArray(section.tasks)
    ? section.tasks.map(normalizeProjectTask).filter((task) => task.title).slice(0, 8)
    : [];

  return {
    title: String(section.title || "").trim(),
    goal: String(section.goal || "").trim(),
    suggestedDueDate:
      typeof section.suggestedDueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(section.suggestedDueDate)
        ? section.suggestedDueDate
        : null,
    tasks,
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
  "Use the EasyList 1-10 urgency scale: 1 should've been done yesterday/emergency, 2 hair-on-fire urgent, 3 do next, 4 very important, 5 important, 6 normal, 7 soon-ish, 8 when there's room, 9 low simmer, 10 nice to have one day.",
  "If the user mentions a clear date phrase, return the date in dueDate so the app can show it for review before anything is saved.",
  "Remove duplicates and combine repeated mentions into the clearest single row.",
  "Keep notes short. Notes should help the user remember context, not repeat the title.",
  "Return no more than 20 rows, prioritizing the most actionable or time-sensitive tasks.",
].join(" ");

const projectPlanningInstructions = [
  "You are the EasyProjects planning assistant.",
  "Create a practical, editable project plan from the user's goal, description, and optional target date.",
  "The output will be reviewed by the user before anything is created, so make it useful but not overbearing.",
  "Organize the plan into 2-6 sections or phases. Each section should have 2-8 concrete tasks.",
  "Task titles should be action-oriented and short enough to scan in a project board.",
  "Use notes for acceptance details, constraints, or helpful suggestions. Keep notes concise.",
  "If a target date is provided, spread due dates realistically between the current date and target date.",
  "If no target date is provided, use null for due dates unless the user provided a clear date.",
  "Use the EasyList 1-10 urgency scale for generated tasks: 1 emergency, 5 important, 6 normal, and 10 someday/nice-to-have.",
  "Prefer realistic sequencing: discovery, decisions, creation, review, polish, launch, and follow-up when they fit.",
  "Include risks only when they help the user start smarter. Do not manufacture scary warnings.",
  "Do not create vague filler tasks like 'work on project'. Make every task something the user can act on.",
].join(" ");

function getFirebaseBearerToken(request) {
  const authHeader = request.get("authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
}

async function verifySignedInRequest(request, response, actionName) {
  const token = getFirebaseBearerToken(request);

  if (!token) {
    response.status(401).json({ error: `Sign in before using ${actionName}.` });
    return null;
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    logger.warn(`Rejected unauthenticated ${actionName} request`, error);
    response.status(401).json({ error: "Your session could not be verified." });
    return null;
  }
}

function clampGmailMaxResults(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 15;
  return Math.max(1, Math.min(Math.floor(parsed), 25));
}

function getGmailHeader(payload, headerName) {
  const headers = Array.isArray(payload?.headers) ? payload.headers : [];
  const found = headers.find((header) => String(header.name || "").toLowerCase() === headerName.toLowerCase());
  return String(found?.value || "").trim();
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function foldEmailHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function buildGmailUrl(path, params = {}) {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, String(item)));
    } else if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

async function fetchGmailJson(accessToken, path, params, options = {}) {
  const gmailResponse = await fetch(buildGmailUrl(path, params), {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const body = await gmailResponse.json().catch(() => ({}));

  if (!gmailResponse.ok) {
    const error = new Error(body?.error?.message || "Gmail request failed.");
    error.status = gmailResponse.status;
    error.code = body?.error?.status || body?.error?.code || "gmail_error";
    throw error;
  }

  return body;
}

exports.analyzeTaskBrainDump = onRequest(
  {
    cors: allowedCorsOrigins,
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
        logger.error("OpenAI task analysis failed", {
          status: openAiResponse.status,
          code: responseBody?.error?.code || "unknown",
          type: responseBody?.error?.type || "unknown",
        });
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

exports.syncGmailTriage = onRequest(
  {
    cors: allowedCorsOrigins,
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

    const verifiedUser = await verifySignedInRequest(request, response, "Gmail sync");
    if (!verifiedUser) return;

    const accessToken = String(request.body?.accessToken || request.get("x-gmail-access-token") || "").trim();
    const query = String(request.body?.query || "in:inbox newer_than:30d -category:promotions").trim();
    const maxResults = clampGmailMaxResults(request.body?.maxResults);

    if (!accessToken) {
      response.status(400).json({ error: "Connect Gmail before syncing." });
      return;
    }

    if (query.length > 512) {
      response.status(413).json({ error: "Gmail query is too long." });
      return;
    }

    try {
      const searchResult = await fetchGmailJson(accessToken, "messages", {
        q: query,
        maxResults,
      });

      const messageIds = Array.isArray(searchResult.messages) ? searchResult.messages.slice(0, maxResults) : [];
      const messages = await Promise.all(
        messageIds.map(async (message) => {
          const gmailMessage = await fetchGmailJson(accessToken, `messages/${encodeURIComponent(message.id)}`, {
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });

          const receivedAtMs = Number(gmailMessage.internalDate);
          return {
            id: String(gmailMessage.id || message.id),
            threadId: String(gmailMessage.threadId || ""),
            from: getGmailHeader(gmailMessage.payload, "From") || "Unknown sender",
            subject: getGmailHeader(gmailMessage.payload, "Subject") || "No subject",
            receivedAt: Number.isFinite(receivedAtMs) ? new Date(receivedAtMs).toISOString() : getGmailHeader(gmailMessage.payload, "Date"),
            snippet: String(gmailMessage.snippet || "").replace(/\s+/g, " ").trim(),
            labels: Array.isArray(gmailMessage.labelIds) ? gmailMessage.labelIds.map(String) : [],
          };
        })
      );

      response.status(200).json({
        syncedAt: new Date().toISOString(),
        uid: verifiedUser.uid,
        query,
        messages,
      });
    } catch (error) {
      logger.error("Gmail sync failed", {
        status: error.status || 500,
        code: error.code || "unknown",
      });

      if (error.status === 401 || error.status === 403) {
        response.status(401).json({ error: "Reconnect Gmail and approve inbox access." });
        return;
      }

      response.status(502).json({ error: "Gmail sync failed. Try again in a moment." });
    }
  }
);

exports.createGmailDraft = onRequest(
  {
    cors: allowedCorsOrigins,
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

    const verifiedUser = await verifySignedInRequest(request, response, "Gmail draft creation");
    if (!verifiedUser) return;

    const accessToken = String(request.body?.accessToken || request.get("x-gmail-access-token") || "").trim();
    const to = foldEmailHeader(request.body?.to);
    const subject = foldEmailHeader(request.body?.subject);
    const body = String(request.body?.body || "").trim();
    const threadId = String(request.body?.threadId || "").trim();

    if (!accessToken) {
      response.status(400).json({ error: "Connect Gmail before creating a draft." });
      return;
    }

    if (!to || !subject || !body) {
      response.status(400).json({ error: "Draft recipient, subject, and body are required." });
      return;
    }

    if (to.length > 500 || subject.length > 300 || body.length > 12000) {
      response.status(413).json({ error: "Draft content is too long." });
      return;
    }

    const raw = base64UrlEncode(
      [
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: 8bit",
        "",
        body,
      ].join("\r\n")
    );

    try {
      const draft = await fetchGmailJson(accessToken, "drafts", undefined, {
        method: "POST",
        body: {
          message: {
            raw,
            ...(threadId ? { threadId } : {}),
          },
        },
      });

      response.status(200).json({
        draftId: String(draft.id || ""),
        messageId: String(draft.message?.id || ""),
        threadId: String(draft.message?.threadId || threadId || ""),
      });
    } catch (error) {
      logger.error("Gmail draft creation failed", {
        status: error.status || 500,
        code: error.code || "unknown",
      });

      if (error.status === 401 || error.status === 403) {
        response.status(401).json({ error: "Reconnect Gmail and approve draft access." });
        return;
      }

      response.status(502).json({ error: "Gmail draft creation failed. Try again in a moment." });
    }
  }
);

exports.planProjectWithAi = onRequest(
  {
    cors: allowedCorsOrigins,
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
      response.status(401).json({ error: "Sign in before using AI project planning." });
      return;
    }

    try {
      await admin.auth().verifyIdToken(token);
    } catch (error) {
      logger.warn("Rejected unauthenticated project planning request", error);
      response.status(401).json({ error: "Your session could not be verified." });
      return;
    }

    const title = String(request.body?.title || "").trim();
    const description = String(request.body?.description || "").trim();
    const targetDate = String(request.body?.targetDate || "").trim();
    const currentDate = String(request.body?.currentDate || new Date().toISOString().slice(0, 10));

    if (!title && !description) {
      response.status(400).json({ error: "Add a project title or description first." });
      return;
    }

    if (`${title}\n${description}`.length > 10000) {
      response.status(413).json({ error: "Project details are too long. Keep them under 10,000 characters." });
      return;
    }

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
              content: projectPlanningInstructions,
            },
            {
              role: "user",
              content: [
                `Current date: ${currentDate}.`,
                targetDate ? `Target date: ${targetDate}.` : "Target date: not provided.",
                "Create an EasyProjects plan with sections and editable task suggestions.",
                `Project title: ${title || "Untitled project"}`,
                "Project description:",
                description || "No extra description provided.",
              ].join("\n\n"),
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "easyprojects_project_plan",
              strict: true,
              schema: projectPlanSchema,
            },
          },
        }),
      });

      const responseBody = await openAiResponse.json();

      if (!openAiResponse.ok) {
        logger.error("OpenAI project planning failed", {
          status: openAiResponse.status,
          code: responseBody?.error?.code || "unknown",
          type: responseBody?.error?.type || "unknown",
        });
        response.status(502).json({ error: "OpenAI could not plan that project." });
        return;
      }

      const parsed = JSON.parse(readOutputText(responseBody));
      const sections = Array.isArray(parsed.sections)
        ? parsed.sections.map(normalizeProjectSection).filter((section) => section.title && section.tasks.length).slice(0, 6)
        : [];

      response.status(200).json({
        summary: String(parsed.summary || "").trim(),
        risks: Array.isArray(parsed.risks)
          ? parsed.risks.map((risk) => String(risk || "").trim()).filter(Boolean).slice(0, 5)
          : [],
        sections,
      });
    } catch (error) {
      logger.error("Project planning request failed", error);
      response.status(500).json({ error: "Project planning failed. Try again in a moment." });
    }
  }
);
