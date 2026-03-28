export const ALLOWED_DOMAIN = "@margoconseil.com";

export const MODEL = "claude-sonnet-4-20250514";

export const LINKEDIN_RULES = `Tu es un expert copywriting LinkedIn. Règles absolues :
- 800 à 1500 caractères, jamais de blocs denses
- Hook fort sur les 2 premières lignes (court, clivant, zéro jargon)
- 1 idée par ligne, sauts de ligne fréquents
- Ton direct, conversationnel, position assumée
- Pas de hashtags dans le corps, max 3 à la toute fin
Réponds uniquement avec le texte du post, sans commentaire.`;

export const TONES = ["Inspirant", "Éducatif", "Provocateur", "Authentique", "Expert"];

export const STYLES = [
  "Storytelling",
  "Liste / Tips",
  "Opinion tranchée",
  "Étude de cas",
  "Question ouverte",
];

export const DURATIONS = [3, 6, 9, 12, 15, 18];

export const OPTIM_AXES = [
  { id: "hook",  label: "Hook",        desc: "Rendre les 2 premières lignes irrésistibles" },
  { id: "lisib", label: "Lisibilité",  desc: "Aérer, 1 idée par ligne" },
  { id: "ton",   label: "Ton direct",  desc: "Plus conversationnel" },
  { id: "cta",   label: "CTA",         desc: "Punchline finale plus forte" },
  { id: "short", label: "Raccourcir",  desc: "Réduire à l'essentiel" },
  { id: "long",  label: "Développer",  desc: "Enrichir avec un insight" },
  { id: "punch", label: "Percutant",   desc: "Ton plus clivant" },
  { id: "story", label: "Storytelling",desc: "Transformer en récit" },
];

export const NAV_ITEMS = [
  { id: "profil",   label: "Profil" },
  { id: "axes",     label: "Axes" },
  { id: "roadmap",  label: "Roadmap" },
  { id: "creer",    label: "Créer" },
  { id: "mesposts", label: "Mes posts" },
  { id: "insights", label: "Insights" },
];

export const CREER_TABS = [
  { id: "generer",   label: "Générer" },
  { id: "interview", label: "Interview" },
  { id: "analyser",  label: "Analyser" },
  { id: "optimiser", label: "Optimiser" },
];

export const STORAGE_KEYS = {
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
