import netlifyIdentity from "netlify-identity-widget";

const PROXY_URL = "/.netlify/functions/claude";

// ─── Récupère le token JWT de l'utilisateur connecté ───────────────

function getAuthToken() {
  const user = netlifyIdentity.currentUser();
  return user?.token?.access_token || null;
}

// ─── Parse robuste du JSON (tolère les blocs ```json```) ────────────

export function parseJSON(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch { /* continue */ }
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { /* continue */ }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) try { return JSON.parse(match[0]); } catch { /* continue */ }
  return null;
}

// ─── Appel principal ────────────────────────────────────────────────

/**
 * @param {string} userMsg - Message utilisateur
 * @param {string} system  - Prompt système
 * @param {number} maxTokens - Limite de tokens (défaut 1200)
 * @returns {Promise<string>} - Texte de la réponse Claude
 */
export async function callClaude(userMsg, system = "", maxTokens = 1200) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Utilisateur non authentifié.");
  }

  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      system,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Erreur ${response.status}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text || "";
}
