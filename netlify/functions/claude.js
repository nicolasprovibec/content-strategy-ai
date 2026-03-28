const ALLOWED_DOMAIN = "@margoconseil.com";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS_LIMIT = 2000;

// ─── Helpers ───────────────────────────────────────────────────────

function createErrorResponse(statusCode, message) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: { message } }),
  };
}

function createSuccessResponse(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

function validateUserEmail(token) {
  if (!token) return null;
  try {
    // Netlify Identity JWT : le payload est la 2e partie base64
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return decoded.email || null;
  } catch {
    return null;
  }
}

function isAllowedDomain(email) {
  return typeof email === "string" && email.endsWith(ALLOWED_DOMAIN);
}

function validateRequestBody(body) {
  const { system, messages, max_tokens } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return "Le champ messages est requis et doit être un tableau non vide.";
  }

  if (max_tokens && (typeof max_tokens !== "number" || max_tokens > MAX_TOKENS_LIMIT)) {
    return `max_tokens doit être un nombre inférieur ou égal à ${MAX_TOKENS_LIMIT}.`;
  }

  return null;
}

// ─── Handler ───────────────────────────────────────────────────────

exports.handler = async (event) => {
  // Méthode HTTP
  if (event.httpMethod !== "POST") {
    return createErrorResponse(405, "Méthode non autorisée.");
  }

  // Vérification du token Netlify Identity
  const authHeader = event.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const email = validateUserEmail(token);

  if (!email || !isAllowedDomain(email)) {
    return createErrorResponse(403, "Accès refusé. Domaine non autorisé.");
  }

  // Parsing du body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return createErrorResponse(400, "Corps de la requête invalide (JSON attendu).");
  }

  // Validation des champs
  const validationError = validateRequestBody(body);
  if (validationError) {
    return createErrorResponse(400, validationError);
  }

  const { system, messages, max_tokens = 1200 } = body;

  // Appel Anthropic
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens,
        system: system || "",
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || `Erreur Anthropic ${response.status}`;
      return createErrorResponse(response.status, message);
    }

    const data = await response.json();
    return createSuccessResponse(data);

  } catch (err) {
    console.error("[claude.js] Erreur réseau :", err.message);
    return createErrorResponse(500, "Erreur interne du serveur.");
  }
};
