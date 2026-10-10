import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const ALL_CATEGORIES = [
  { id: "Road & Highway",         icon: "???",  desc: "RHD, LGED roads, bridges, pavement" },
  { id: "Building & Civil",       icon: "???",  desc: "PWD, EED buildings, renovation, repair" },
  { id: "Medical & Hospital",     icon: "??",  desc: "DGHS, hospital supplies, medicines" },
  { id: "IT & Equipment",         icon: "??",  desc: "Computers, software, network, ICT" },
  { id: "Water & Drainage",       icon: "??",  desc: "BWDB, WASA, irrigation, flood control" },
  { id: "Power & Electrical",     icon: "?",  desc: "BPDB, REB, transformers, solar, grid" },
  { id: "Vehicles & Spare Parts", icon: "??",  desc: "Railway, ferry, trucks, spare parts" },
  { id: "Food & Ration",          icon: "??",  desc: "Police ration, hospital diet, groceries" },
  { id: "Others",                 icon: "??",  desc: "All other procurement categories" },
];

interface Props {
  userId: string;
  subscriptionTier: string;
}

export default function TenderRadarSettings({ userId, subscriptionTier }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(true);

  const isPro = subscriptionTier === "pro" || subscriptionTier === "enterprise";

  useEffect(() => {
    if (!userId || !isPro) { setLoading(false); return; }
    getDoc(doc(db, "users", userId)).then(snap => {
      if (snap.exists()) {
        setSelected(snap.data().tenderCategories || []);
      }
      setLoading(false);
    });
  }, [userId]);

  const toggle = (cat: string) => {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    await updateDoc(doc(db, "users", userId), { tenderCategories: selected });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!isPro) {
    return (
      <div style={{ background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:10, padding:"20px 24px" }}>
        <div style={{ fontSize:16, fontWeight:700, color:"#92400E", marginBottom:6 }}>
          ?? Tender Radar — Pro Feature
        </div>
        <div style={{ fontSize:13, color:"#B45309", marginBottom:14 }}>
          Get daily emails of new e-GP tenders filtered by your categories.
          Upgrade to Pro to unlock this feature.
        </div>
        <a href="/pricing" style={{ background:"#D97706", color:"#fff", padding:"8px 18px", borderRadius:7, fontSize:13, fontWeight:600, textDecoration:"none" }}>
          Upgrade to Pro — ?999/month
        </a>
      </div>
    );
  }

  if (loading) return <div style={{ color:"#6B7280", fontSize:13 }}>Loading your preferences…</div>;

  return (
    <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, padding:"24px 28px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:17, fontWeight:700, color:"#111827" }}><Bell size={20} /> Tender Radar</div>
          <div style={{ fontSize:13, color:"#6B7280", marginTop:2 }}>
            Select categories to receive in your daily e-GP tender email
          </div>
        </div>
        <span style={{ background:"#EFF6FF", color:"#1D4ED8", border:"1px solid #BFDBFE", borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:600 }}>
          {selected.length} selected
        </span>
      </div>

      <div style={{ borderTop:"1px solid #F3F4F6", margin:"16px 0" }} />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:10, marginBottom:20 }}>
        {ALL_CATEGORIES.map(cat => {
          const isSelected = selected.includes(cat.id);
          return (
            <div
              key={cat.id}
              onClick={() => toggle(cat.id)}
              style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"12px 14px",
                border: isSelected ? "2px solid #1D4ED8" : "1.5px solid #E5E7EB",
                borderRadius:9,
                background: isSelected ? "#EFF6FF" : "#FAFAFA",
                cursor:"pointer",
                transition:"all .15s",
              }}
            >
              <span style={{ fontSize:22, flexShrink:0 }}>{cat.icon}</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color: isSelected ? "#1D4ED8" : "#111827" }}>
                  {cat.id}
                </div>
                <div style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>{cat.desc}</div>
              </div>
              {isSelected && (
                <span style={{ marginLeft:"auto", color:"#1D4ED8", fontSize:16, flexShrink:0 }}>?</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button
          onClick={save}
          disabled={saving || selected.length === 0}
          style={{
            background: selected.length === 0 ? "#E5E7EB" : "#1D4ED8",
            color: selected.length === 0 ? "#9CA3AF" : "#fff",
            border:"none", borderRadius:8,
            padding:"10px 24px", fontSize:14, fontWeight:600,
            cursor: selected.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save Preferences"}
        </button>

        {selected.length > 0 && (
          <button
            onClick={() => { setSelected([]); setSaved(false); }}
            style={{ background:"none", border:"1px solid #E5E7EB", borderRadius:8, padding:"10px 16px", fontSize:13, color:"#6B7280", cursor:"pointer" }}
          >
            Clear all
          </button>
        )}

        {saved && (
          <span style={{ color:"#059669", fontSize:13, fontWeight:600 }}>
            ? Saved! Daily emails will reflect your new categories.
          </span>
        )}
      </div>

      {selected.length === 0 && (
        <div style={{ marginTop:12, fontSize:12, color:"#EF4444" }}>
          ? Select at least one category to receive daily emails.
        </div>
      )}

      <div style={{ marginTop:16, padding:"10px 14px", background:"#F9FAFB", borderRadius:8, fontSize:12, color:"#6B7280" }}>
        ?? Emails are sent every morning at <strong>8:00 AM BST</strong> with tenders published the previous day on eprocure.gov.bd
      </div>
    </div>
  );
}
