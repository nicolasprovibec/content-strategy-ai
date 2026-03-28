// ─── App.jsx ─────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { NavBar }       from "./components/layout/NavBar";
import { Toast }        from "./components/ui";
import { useToast }     from "./hooks/useToast";
import { storage }      from "./services/storage";

import { ProfilTab }   from "./features/profil/ProfilTab";
import { AxesTab }     from "./features/axes/AxesTab";
import { RoadmapTab }  from "./features/roadmap/RoadmapTab";
import { CreerTab }    from "./features/creer/CreerTab";
import { MesPostsTab } from "./features/mesposts/MesPostsTab";
import { InsightsTab } from "./features/insights/InsightsTab";

// ─── Helpers ─────────────────────────────────────────────────────────

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const toDay = () => new Date().toLocaleDateString("fr-FR", {
  day: "numeric", month: "short", year: "numeric",
});

// ─── Shell principal ─────────────────────────────────────────────────

export function AppShell() {
  const { toastMessage, showToast } = useToast();

  // Navigation
  const [activeTab, setActiveTab] = useState("profil");

  // État global — initialisé depuis localStorage
  const [profile,       setProfile]       = useState(() => storage.getProfile());
  const [axesSessions,  setAxesSessions]  = useState(() => storage.getAxesSessions());
  const [favAxes,       setFavAxes]       = useState(() => storage.getFavAxes());
  const [selectedAxes,  setSelectedAxes]  = useState(() => storage.getSelectedAxes());
  const [roadmaps,      setRoadmaps]      = useState(() => storage.getRoadmaps());
  const [activeRmId,    setActiveRmId]    = useState(() => storage.getActiveRmId());
  const [pubWeeks,      setPubWeeks]      = useState(() => storage.getPubWeeks());
  const [posts,         setPosts]         = useState(() => storage.getPosts());
  const [insights,      setInsights]      = useState(() => storage.getInsights());
  const [creerPrefill,  setCreerPrefill]  = useState(null);

  // ── Persistance automatique ──────────────────────────────────────

  const persist = useCallback((key, setter) => (value) => {
    const v = value instanceof Function ? value(storage[`get${key}`]?.() ?? value) : value;
    setter(v);
    storage[`set${key}`]?.(v);
  }, []);

  const saveProfile      = persist("Profile",      setProfile);
  const saveAxesSessions = persist("AxesSessions", setAxesSessions);
  const saveFavAxes      = persist("FavAxes",      setFavAxes);
  const saveSelectedAxes = persist("SelectedAxes", setSelectedAxes);
  const saveRoadmaps     = persist("Roadmaps",     setRoadmaps);
  const saveActiveRmId   = persist("ActiveRmId",   setActiveRmId);
  const savePubWeeks     = persist("PubWeeks",     setPubWeeks);
  const savePosts        = persist("Posts",        setPosts);
  const saveInsights     = persist("Insights",     setInsights);

  // ── Actions posts ────────────────────────────────────────────────

  const addPost = useCallback((post) => {
    savePosts((prev) => [{ ...post, id: uid(), date: toDay() }, ...prev]);
  }, []);

  const deletePost = useCallback((id) => {
    savePosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Actions insights ─────────────────────────────────────────────

  const addInsight = useCallback((insight) => {
    saveInsights((prev) => [{ ...insight, id: uid(), date: toDay() }, ...prev]);
  }, []);

  const deleteInsight = useCallback((id) => {
    saveInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // ── Actions roadmap ──────────────────────────────────────────────

  const createRoadmap = useCallback(() => {
    const rm = { id: uid(), name: `Roadmap ${roadmaps.length + 1}`, createdAt: toDay(), weeks: [] };
    saveRoadmaps((prev) => [...prev, rm]);
    saveActiveRmId(rm.id);
    return rm;
  }, [roadmaps]);

  const goCreerFromRoadmap = useCallback((week) => {
    const axis = selectedAxes.find((a) => a.title === week.axis) || selectedAxes[0] || null;
    setCreerPrefill({ axis, tone: week.tone, style: week.style, roadmapSug: week });
    setActiveTab("creer");
  }, [selectedAxes]);

  // ─────────────────────────────────────────────────────────────────

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      overflow: "hidden",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      fontSize: 14, lineHeight: 1.5, color: "#0F172A",
      background: "#F8FAFC",
    }}>
      <Toast message={toastMessage} />

      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        postCount={posts.length}
        insightCount={insights.length}
      />

      <main style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "profil" && (
          <ProfilTab
            profile={profile}
            onSave={(p) => { saveProfile(p); showToast("✓ Profil sauvegardé"); }}
            onGenAxes={(p) => { saveProfile(p); setActiveTab("axes"); }}
            showToast={showToast}
            onAxesGenerated={(session) => {
              saveAxesSessions((prev) => [session, ...prev]);
              showToast("✓ 6 axes générés !");
              setActiveTab("axes");
            }}
          />
        )}
        {activeTab === "axes" && (
          <AxesTab
            axesSessions={axesSessions}
            favAxes={favAxes}
            selectedAxes={selectedAxes}
            onToggleAxis={(a) => saveSelectedAxes((prev) =>
              prev.find((x) => x.id === a.id) ? prev.filter((x) => x.id !== a.id) : [...prev, a]
            )}
            onToggleFav={(id) => saveFavAxes((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )}
            onAxesGenerated={(session) => {
              saveAxesSessions((prev) => [session, ...prev]);
              showToast("✓ Axes générés !");
            }}
            profile={profile}
            showToast={showToast}
            onGoRoadmap={() => { createRoadmap(); setActiveTab("roadmap"); }}
            onGoCreer={() => setActiveTab("creer")}
          />
        )}
        {activeTab === "roadmap" && (
          <RoadmapTab
            roadmaps={roadmaps}
            activeRmId={activeRmId}
            onSetActive={saveActiveRmId}
            onNewRoadmap={createRoadmap}
            onRenameRoadmap={(id) => {
              const name = window.prompt("Nouveau nom :");
              if (name?.trim()) saveRoadmaps((prev) => prev.map((r) => r.id === id ? { ...r, name: name.trim() } : r));
            }}
            onDeleteRoadmap={(id) => {
              saveRoadmaps((prev) => {
                const next = prev.filter((r) => r.id !== id);
                if (activeRmId === id) saveActiveRmId(next[0]?.id || null);
                return next;
              });
            }}
            onRoadmapGenerated={(rm) => {
              saveRoadmaps((prev) => [...prev, rm]);
              saveActiveRmId(rm.id);
              showToast(`✓ Roadmap générée !`);
              setActiveTab("roadmap");
            }}
            onGoCreer={goCreerFromRoadmap}
            pubWeeks={pubWeeks}
            selectedAxes={selectedAxes}
            profile={profile}
            showToast={showToast}
          />
        )}
        {activeTab === "creer" && (
          <CreerTab
            profile={profile}
            selectedAxes={selectedAxes}
            prefill={creerPrefill}
            onSavePost={addPost}
            showToast={showToast}
          />
        )}
        {activeTab === "mesposts" && (
          <MesPostsTab
            posts={posts}
            onDelete={deletePost}
          />
        )}
        {activeTab === "insights" && (
          <InsightsTab
            insights={insights}
            posts={posts}
            onAddInsight={addInsight}
            onDeleteInsight={deleteInsight}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}
