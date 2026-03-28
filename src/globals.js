// ─── Utilitaires globaux ─────────────────────────────────────────────
// Ce fichier expose sur window toutes les fonctions et constantes
// partagées entre les features, évitant les imports croisés avec Babel CDN.

// ── Identifiant unique ───────────────────────────────────────────────
window.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Date formatée ────────────────────────────────────────────────────
window.toDay = () => new Date().toLocaleDateString("fr-FR", {
  day: "numeric", month: "short", year: "numeric",
});

// ── Parse JSON robuste ───────────────────────────────────────────────
window.parseJSON = (text) => {
  if (!text) return null;
  try { return JSON.parse(text); } catch { /* continue */ }
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { /* continue */ }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) try { return JSON.parse(match[0]); } catch { /* continue */ }
  return null;
};

// ── Appel Claude via proxy Netlify ───────────────────────────────────
window.callClaude = async (userMsg, system = "", maxTokens = 1200) => {
  const user  = netlifyIdentity.currentUser();
  const token = user?.token?.access_token || null;

  if (!token) throw new Error("Utilisateur non authentifié.");

  const response = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      system,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: userMsg }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Erreur ${response.status}`);
  }

  const data = await response.json();
  return data?.content?.[0]?.text || "";
};

// ── Constantes ────────────────────────────────────────────────────────
window.ALLOWED_DOMAIN = "@margoconseil.com";

window.LINKEDIN_RULES = `Tu es un expert copywriting LinkedIn. Règles absolues :
- 800 à 1500 caractères, jamais de blocs denses
- Hook fort sur les 2 premières lignes (court, clivant, zéro jargon)
- 1 idée par ligne, sauts de ligne fréquents
- Ton direct, conversationnel, position assumée
- Pas de hashtags dans le corps, max 3 à la toute fin
Réponds uniquement avec le texte du post, sans commentaire.`;

window.TONES    = ["Inspirant", "Éducatif", "Provocateur", "Authentique", "Expert"];
window.STYLES   = ["Storytelling", "Liste / Tips", "Opinion tranchée", "Étude de cas", "Question ouverte"];
window.DURATIONS = [3, 6, 9, 12, 15, 18];

window.OPTIM_AXES = [
  { id: "hook",  label: "Hook",         desc: "Rendre les 2 premières lignes irrésistibles" },
  { id: "lisib", label: "Lisibilité",   desc: "Aérer, 1 idée par ligne" },
  { id: "ton",   label: "Ton direct",   desc: "Plus conversationnel" },
  { id: "cta",   label: "CTA",          desc: "Punchline finale plus forte" },
  { id: "short", label: "Raccourcir",   desc: "Réduire à l'essentiel" },
  { id: "long",  label: "Développer",   desc: "Enrichir avec un insight" },
  { id: "punch", label: "Percutant",    desc: "Ton plus clivant" },
  { id: "story", label: "Storytelling", desc: "Transformer en récit" },
];

window.NAV_ITEMS = [
  { id: "profil",   label: "Profil" },
  { id: "axes",     label: "Axes" },
  { id: "roadmap",  label: "Roadmap" },
  { id: "creer",    label: "Créer" },
  { id: "mesposts", label: "Mes posts" },
  { id: "insights", label: "Insights" },
];

window.STORAGE_KEYS = {
  PROFILE:       "csa_profile",
  AXES_SESSIONS: "csa_axes_sessions",
  FAV_AXES:      "csa_fav_axes",
  SELECTED_AXES: "csa_selected_axes",
  ROADMAPS:      "csa_roadmaps",
  ACTIVE_RM_ID:  "csa_active_rm_id",
  PUB_WEEKS:     "csa_pub_weeks",
  POSTS:         "csa_posts",
  INSIGHTS:      "csa_insights",
};

// ── Design tokens ────────────────────────────────────────────────────
window.C = {
  navy:      "#1E3A5F",
  navyLight: "#E8F0FA",
  navyMid:   "#A8C0DC",
  green:     "#10B981",
  amber:     "#F59E0B",
  red:       "#EF4444",
  gray50:    "#F8FAFC",
  gray100:   "#F1F5F9",
  gray200:   "#E2E8F0",
  gray400:   "#94A3B8",
  gray600:   "#475569",
  gray900:   "#0F172A",
};

// ── Composants UI globaux ────────────────────────────────────────────
window.Btn = ({ onClick, disabled=false, children, variant="primary", sm=false, full=false, style:sx }) => {
  const V = {
    primary:   { background: disabled ? "#C7D2FE" : C.navy, color: "#fff", border: "none" },
    secondary: { background: C.gray100, color: C.gray600, border: `0.5px solid ${C.gray200}` },
    ghost:     { background: "transparent", color: C.navy, border: `0.5px solid ${C.navyMid}` },
    danger:    { background: "#FEF2F2", color: C.red, border: "0.5px solid #FCA5A5" },
  };
  return React.createElement("button", {
    onClick, disabled,
    style: {
      display: "inline-flex", alignItems: "center", justifyContent: full ? "center" : "flex-start",
      gap: 6, padding: sm ? "6px 12px" : "9px 18px",
      borderRadius: 8, fontWeight: 500, fontSize: sm ? 12 : 13,
      cursor: disabled ? "not-allowed" : "pointer",
      whiteSpace: "nowrap", fontFamily: "inherit",
      width: full ? "100%" : "auto", opacity: disabled ? 0.6 : 1,
      ...(V[variant] || V.primary), ...sx,
    },
  }, children);
};

window.Card = ({ children, style:sx }) =>
  React.createElement("div", {
    style: { background: "#fff", borderRadius: 10, border: `0.5px solid ${C.gray200}`, padding: "1rem", marginBottom: 10, ...sx },
  }, children);

window.Field = ({ label, value, onChange, placeholder, rows }) => {
  const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `0.5px solid ${C.gray200}`, fontSize: 13, outline: "none", color: C.gray900, fontFamily: "inherit", background: C.gray50, resize: rows ? "vertical" : undefined, lineHeight: rows ? 1.6 : undefined };
  return React.createElement("div", { style: { marginBottom: 12 } },
    label && React.createElement("div", { style: { fontSize: 12, fontWeight: 500, color: C.gray600, marginBottom: 4 } }, label),
    rows
      ? React.createElement("textarea", { value, onChange: e => onChange(e.target.value), placeholder, rows, style: inputStyle })
      : React.createElement("input",    { value, onChange: e => onChange(e.target.value), placeholder, style: inputStyle })
  );
};

window.Tag = ({ label, active, onClick }) =>
  React.createElement("span", {
    onClick,
    style: {
      display: "inline-block", padding: "5px 12px", borderRadius: 20,
      fontSize: 12, margin: "3px 3px 3px 0", cursor: "pointer",
      border: `1.5px solid ${active ? C.navy : C.gray200}`,
      background: active ? C.navyLight : "#fff",
      color:      active ? C.navy      : C.gray600,
      fontWeight: active ? 500         : 400,
    },
  }, label);

window.CharBadge = ({ n }) => {
  if (!n) return null;
  const color = n < 300 ? C.red : n <= 600 ? C.amber : n <= 1500 ? C.green : C.red;
  const label = n < 300 ? "Trop court" : n <= 600 ? "Court ✓" : n <= 1500 ? "Sweet spot ✓" : "Trop long";
  return React.createElement("span", {
    style: { fontSize: 11, fontWeight: 500, color, background: `${color}18`, padding: "2px 8px", borderRadius: 6 },
  }, `${n} — ${label}`);
};

window.Toast = ({ message }) => {
  if (!message) return null;
  return React.createElement("div", {
    style: { position: "fixed", top: 16, right: 16, zIndex: 9999, background: C.gray900, color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, maxWidth: 300, pointerEvents: "none" },
  }, message);
};

window.Empty = ({ icon, text, btnLabel, onBtn }) =>
  React.createElement("div", { style: { textAlign: "center", padding: "48px 24px" } },
    React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, icon),
    React.createElement("p",   { style: { color: C.gray400, fontSize: 14, marginBottom: 16 } }, text),
    onBtn && React.createElement(Btn, { onClick: onBtn }, btnLabel)
  );

window.ScoreBar = ({ label, note }) => {
  const color = (note || 0) >= 7 ? C.green : (note || 0) >= 5 ? C.amber : C.red;
  return React.createElement("div", { style: { marginBottom: 8 } },
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 3 } },
      React.createElement("span", { style: { fontSize: 12, fontWeight: 500 } }, label),
      React.createElement("span", { style: { fontSize: 12, fontWeight: 500, color } }, `${note}/10`)
    ),
    React.createElement("div", { style: { height: 4, background: C.gray100, borderRadius: 10 } },
      React.createElement("div", { style: { height: 4, borderRadius: 10, width: `${(note || 0) * 10}%`, background: color } })
    )
  );
};

// ── Storage helpers ──────────────────────────────────────────────────
window.storage = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  clear: () => Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k)),
};
