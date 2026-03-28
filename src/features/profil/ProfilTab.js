const { useState, useEffect } = React;

const VALUE_STEPS = [
  { num: "1", title: "Remplissez votre profil",  desc: "Nom, vision, contexte. 2 minutes chrono." },
  { num: "2", title: "Vos axes sont générés",    desc: "6 thèmes LinkedIn calibrés sur votre marque." },
  { num: "3", title: "Créez et planifiez",        desc: "Roadmap, posts, analyse, optimisation." },
];

export function ProfilTab({ profile, onSave, onGenAxes, showToast, onAxesGenerated }) {
  const [name,    setName]    = useState(profile?.name    || "");
  const [vision,  setVision]  = useState(profile?.vision  || "");
  const [context, setContext] = useState(profile?.context || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(profile?.name    || "");
    setVision(profile?.vision  || "");
    setContext(profile?.context || "");
  }, [profile]);

  const isValid = name.trim() && vision.trim() && context.trim();

  async function handleGenAxes() {
    if (!isValid) return;
    const p = { name, vision, context };
    onSave(p);
    setLoading(true);
    try {
      const txt = await callClaude(
        `Nom : ${name}\nVision : ${vision}\nContexte : ${context}\nGénère 6 axes de contenu LinkedIn stratégiques en français.`,
        `Tu es un stratège LinkedIn. Réponds UNIQUEMENT en JSON valide. Format : {"axes":[{"title":"...","description":"...","emoji":"..."}]} avec exactement 6 items.`,
        900
      );
      const parsed = parseJSON(txt);
      if (parsed?.axes?.length) {
        const withIds = parsed.axes.map(a => ({ ...a, id: uid() }));
        const session = {
          id: uid(),
          label: `Génération — ${toDay()}`,
          createdAt: toDay(),
          axes: withIds,
        };
        onAxesGenerated(session);
      } else {
        showToast("⚠️ Format inattendu, réessayez");
      }
    } catch (e) {
      showToast("⚠️ " + e.message);
    }
    setLoading(false);
  }

  // ── Styles ──────────────────────────────────────────────────────

  const S = {
    wrap: {
      height: "calc(100vh - 56px)",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
    },
    left: {
      padding: "2rem 2rem",
      background: "#fff",
      borderRight: `0.5px solid ${C.gray200}`,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    },
    right: {
      padding: "2rem 2rem",
      background: C.gray50,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      overflowY: "auto",
    },
    stepCard: {
      background: "#fff",
      border: `0.5px solid ${C.gray200}`,
      borderRadius: 10,
      padding: "10px 12px",
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
    },
    stepNum: {
      width: 22, height: 22, borderRadius: "50%",
      background: C.navyLight,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    },
    badge: {
      marginTop: "auto",
      background: C.navy,
      borderRadius: 10,
      padding: "10px 14px",
    },
  };

  return (
    <div style={S.wrap}>

      {/* ── Gauche : formulaire ── */}
      <div style={S.left}>
        <p style={{ fontSize: 11, color: C.gray400, marginBottom: 4 }}>Étape 1 sur 1</p>
        <p style={{ fontSize: 18, fontWeight: 500, color: C.gray900, marginBottom: 4 }}>
          Votre profil
        </p>
        <p style={{ fontSize: 12, color: C.gray400, marginBottom: 24, lineHeight: 1.5 }}>
          Ces informations personnalisent tous les contenus générés.
        </p>

        <Field
          label="Nom ou marque"
          value={name}
          onChange={setName}
          placeholder="Ex : Nicolas Dupont"
        />
        <Field
          label="Vision"
          value={vision}
          onChange={setVision}
          placeholder="Ex : Transformer les ESN en acteurs de l'IA"
          rows={3}
        />
        <Field
          label="Contexte"
          value={context}
          onChange={setContext}
          placeholder="Ex : CEO d'une ESN de 80 consultants, 10 ans d'expérience"
          rows={3}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
          <Btn
            onClick={() => { if (isValid) onSave({ name, vision, context }); }}
            disabled={!isValid}
          >
            Sauvegarder
          </Btn>
          <Btn
            variant="secondary"
            onClick={handleGenAxes}
            disabled={!isValid || loading}
          >
            {loading ? "Génération…" : "Générer mes axes →"}
          </Btn>
        </div>
      </div>

      {/* ── Droite : explication ── */}
      <div style={S.right}>
        <p style={{
          fontSize: 11, fontWeight: 500, color: C.gray400,
          textTransform: "uppercase", letterSpacing: "0.06em",
          marginBottom: 2,
        }}>
          Comment ça marche
        </p>

        {VALUE_STEPS.map((step) => (
          <div key={step.num} style={S.stepCard}>
            <div style={S.stepNum}>
              <span style={{ fontSize: 10, fontWeight: 500, color: C.navy }}>{step.num}</span>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: C.gray900, marginBottom: 2 }}>
                {step.title}
              </p>
              <p style={{ fontSize: 11, color: C.gray400, lineHeight: 1.4 }}>
                {step.desc}
              </p>
            </div>
          </div>
        ))}

        <div style={S.badge}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>
            Données stockées localement
          </p>
          <p style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>
            Aucun envoi sans action de votre part
          </p>
        </div>
      </div>
    </div>
  );
}
