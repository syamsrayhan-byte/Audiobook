import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Folder as FolderIcon, LogOut, Headphones, Moon, Repeat } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function AppHome() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("folders").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setFolders(data || []); setLoading(false); });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><BrandLogo /><span className="font-semibold">HCR.ID</span></div>
          <button onClick={logout} className="text-sm text-slate-400 hover:text-gold-400 flex items-center gap-2">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-2">Audio Afirmasi</h1>
        <p className="text-slate-400 mb-8">Pilih folder untuk mendengarkan koleksi afirmasi.</p>

        {loading ? (
          <p className="text-slate-500">Memuat folder…</p>
        ) : folders.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-slate-400">Belum ada folder.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((f) => (
              <Link to={`/folder/${f.id}`} key={f.id}
                className="glass rounded-xl p-5 hover:border-gold-400/40 transition group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-navy-700/60 text-gold-400"><FolderIcon size={20} /></div>
                  <h3 className="font-semibold group-hover:text-gold-400">{f.name}</h3>
                </div>
                {f.description && <p className="text-sm text-slate-400 line-clamp-2">{f.description}</p>}
              </Link>
            ))}
          </div>
        )}

        <section className="mt-14">
          <h2 className="text-xl font-semibold mb-4">Panduan mendengarkan</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { i: <Headphones size={20} />, t: "Gunakan earphone", d: "Suara lebih intim dan fokus." },
              { i: <Moon size={20} />, t: "Cari waktu tenang", d: "Pagi sebelum aktivitas atau sebelum tidur." },
              { i: <Repeat size={20} />, t: "Konsisten setiap hari", d: "Minimal 21 hari berturut-turut." },
            ].map((tip, i) => (
              <div key={i} className="glass rounded-xl p-5">
                <div className="text-gold-400 mb-2">{tip.i}</div>
                <h4 className="font-semibold mb-1">{tip.t}</h4>
                <p className="text-sm text-slate-400">{tip.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
