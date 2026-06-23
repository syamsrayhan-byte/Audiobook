import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileAudio, FileText, Image as ImageIcon } from "lucide-react";
import { supabase, getSignedUrl } from "../lib/supabase.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function Folder() {
  const { id } = useParams();
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [active, setActive] = useState(null);
  const [signed, setSigned] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: f } = await supabase.from("folders").select("*").eq("id", id).maybeSingle();
      setFolder(f);
      const { data: fl } = await supabase.from("files").select("*").eq("folder_id", id).order("created_at");
      setFiles(fl || []);
    })();
  }, [id]);

  async function open(file) {
    setActive(file); setSigned(null);
    try { setSigned(await getSignedUrl(file.storage_path)); } catch (e) { console.error(e); }
  }

  const noContextMenu = (e) => e.preventDefault();

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><BrandLogo /><span className="font-semibold">HCR.ID</span></div>
          <Link to="/app" className="text-sm text-slate-400 hover:text-gold-400 flex items-center gap-2">
            <ArrowLeft size={16} /> Folder lain
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr,1.2fr] gap-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{folder?.name || "Folder"}</h1>
          {folder?.description && <p className="text-slate-400 mb-6 text-sm">{folder.description}</p>}
          <div className="space-y-2">
            {files.map((f) => {
              const Icon = f.file_type === "audio" ? FileAudio : f.file_type === "pdf" ? FileText : ImageIcon;
              return (
                <button key={f.id} onClick={() => open(f)}
                  className={`w-full text-left glass rounded-lg p-3 flex items-center gap-3 hover:border-gold-400/40 transition ${active?.id===f.id ? "border-gold-400/60" : ""}`}>
                  <Icon size={18} className="text-gold-400" />
                  <span className="text-sm">{f.name}</span>
                </button>
              );
            })}
            {files.length === 0 && <p className="text-slate-500 text-sm">Belum ada file di folder ini.</p>}
          </div>
        </div>

        <div className="glass rounded-xl p-6 min-h-[300px]">
          {!active && <p className="text-slate-500 text-sm">Pilih file di kiri untuk memutar / melihat.</p>}
          {active && !signed && <p className="text-slate-400 text-sm">Memuat…</p>}
          {active && signed && (
            <div onContextMenu={noContextMenu} className="no-select">
              <h3 className="font-semibold mb-4">{active.name}</h3>
              {active.file_type === "audio" && (
                <audio src={signed} controls controlsList="nodownload noplaybackrate" className="w-full" />
              )}
              {active.file_type === "image" && (
                <img src={signed} alt={active.name} className="max-w-full rounded-lg pointer-events-none" draggable={false} />
              )}
              {active.file_type === "pdf" && (
                <iframe src={signed + "#toolbar=0"} className="w-full h-[600px] rounded-lg" title={active.name} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
