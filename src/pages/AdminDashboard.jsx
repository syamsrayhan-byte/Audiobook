import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Check, X, Upload, LogOut, Folder as FolderIcon } from "lucide-react";
import { supabase } from "../lib/supabase.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("folders").select("*").order("created_at", { ascending: false });
    setFolders(data || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createFolder(e) {
    e.preventDefault();
    if (!newFolder.name.trim()) return;
    const { error } = await supabase.from("folders").insert(newFolder);
    if (error) return toast.error(error.message);
    setNewFolder({ name: "", description: "" });
    toast.success("Folder dibuat");
    load();
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate("/admin", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><BrandLogo /><span className="font-semibold">HCR.ID — Admin</span></div>
          <button onClick={logout} className="text-sm text-slate-400 hover:text-gold-400 flex items-center gap-2">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <section className="glass rounded-xl p-6">
          <h2 className="font-semibold mb-4">Buat folder baru</h2>
          <form onSubmit={createFolder} className="grid sm:grid-cols-[1fr,1.5fr,auto] gap-3">
            <input placeholder="Nama folder" value={newFolder.name} onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })} />
            <input placeholder="Deskripsi (opsional)" value={newFolder.description} onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })} />
            <button className="btn-gold rounded-lg px-4 flex items-center gap-2"><Plus size={16} /> Tambah</button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold">Folder</h2>
          {loading ? <p className="text-slate-500">Memuat…</p> :
            folders.length === 0 ? <p className="text-slate-500 text-sm">Belum ada folder.</p> :
            folders.map((f) => <FolderCard key={f.id} folder={f} onChange={load} />)}
        </section>

        <UserSection />
      </main>
    </div>
  );
}

function FolderCard({ folder, onChange }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [desc, setDesc] = useState(folder.description || "");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function loadFiles() {
    const { data } = await supabase.from("files").select("*").eq("folder_id", folder.id).order("created_at");
    setFiles(data || []);
  }
  useEffect(() => { loadFiles(); }, [folder.id]);

  async function save() {
    const { error } = await supabase.from("folders").update({ name, description: desc }).eq("id", folder.id);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan"); setEditing(false); onChange();
  }

  async function remove() {
    if (!confirm(`Hapus folder "${folder.name}" beserta semua file di dalamnya?`)) return;
    for (const f of files) {
      await supabase.storage.from("media").remove([f.storage_path]);
    }
    await supabase.from("files").delete().eq("folder_id", folder.id);
    const { error } = await supabase.from("folders").delete().eq("id", folder.id);
    if (error) return toast.error(error.message);
    toast.success("Folder dihapus"); onChange();
  }

  async function upload(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const ft = file.type.startsWith("audio") ? "audio" : file.type.startsWith("image") ? "image" : "pdf";
    const { error: dbErr } = await supabase.from("files").insert({
      folder_id: folder.id, name: file.name, storage_path: path,
      file_type: ft, mime_type: file.type, size_bytes: file.size,
    });
    setUploading(false); e.target.value = "";
    if (dbErr) return toast.error(dbErr.message);
    toast.success("File diunggah"); loadFiles();
  }

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-navy-700/60 text-gold-400 mt-1"><FolderIcon size={18} /></div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <input value={name} onChange={(e) => setName(e.target.value)} />
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Deskripsi" />
              </div>
            ) : (
              <>
                <h3 className="font-semibold">{folder.name}</h3>
                {folder.description && <p className="text-sm text-slate-400">{folder.description}</p>}
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={save} className="p-2 rounded hover:bg-white/5 text-emerald-400"><Check size={16} /></button>
              <button onClick={() => { setEditing(false); setName(folder.name); setDesc(folder.description || ""); }}
                className="p-2 rounded hover:bg-white/5 text-slate-400"><X size={16} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-2 rounded hover:bg-white/5 text-slate-400"><Pencil size={16} /></button>
              <button onClick={remove} className="p-2 rounded hover:bg-white/5 text-red-400"><Trash2 size={16} /></button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {files.map((f) => <FileRow key={f.id} file={f} onChange={loadFiles} />)}
      </div>

      <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-gold-400 hover:text-gold-500">
        <Upload size={16} /> {uploading ? "Mengunggah…" : "Unggah file (audio / pdf / gambar)"}
        <input type="file" className="hidden" onChange={upload} accept="audio/*,image/*,application/pdf" disabled={uploading} />
      </label>
    </div>
  );
}

function FileRow({ file, onChange }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(file.name);

  async function rename() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("files").update({ name: trimmed }).eq("id", file.id);
    if (error) return toast.error(error.message);
    toast.success("Nama diperbarui"); setEditing(false); onChange();
  }

  async function remove() {
    if (!confirm(`Hapus file "${file.name}"?`)) return;
    await supabase.storage.from("media").remove([file.storage_path]);
    const { error } = await supabase.from("files").delete().eq("id", file.id);
    if (error) return toast.error(error.message);
    toast.success("File dihapus"); onChange();
  }

  return (
    <div className="flex items-center gap-2 text-sm bg-navy-900/40 rounded-lg px-3 py-2">
      {editing ? (
        <>
          <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <button onClick={rename} className="p-1 text-emerald-400"><Check size={14} /></button>
          <button onClick={() => { setEditing(false); setName(file.name); }} className="p-1 text-slate-400"><X size={14} /></button>
        </>
      ) : (
        <>
          <span className="flex-1 truncate">{file.name}</span>
          <span className="text-xs text-slate-500">{file.file_type}</span>
          <button onClick={() => setEditing(true)} className="p-1 text-slate-400 hover:text-gold-400"><Pencil size={14} /></button>
          <button onClick={remove} className="p-1 text-red-400"><Trash2 size={14} /></button>
        </>
      )}
    </div>
  );
}

function UserSection() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function createUser(e) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "create", email, password },
    });
    setBusy(false);
    if (error || data?.error) return toast.error(error?.message || data?.error);
    toast.success("User dibuat: " + email);
    setEmail(""); setPassword("");
  }

  return (
    <section className="glass rounded-xl p-6">
      <h2 className="font-semibold mb-1">Kelola peserta</h2>
      <p className="text-xs text-slate-500 mb-4">Membutuhkan Edge Function <code>admin-users</code> ter-deploy (lihat README).</p>
      <form onSubmit={createUser} className="grid sm:grid-cols-[1fr,1fr,auto] gap-3">
        <input type="email" placeholder="email@peserta.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="text" placeholder="Password awal" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className="btn-gold rounded-lg px-4">{busy ? "…" : "Tambah peserta"}</button>
      </form>
    </section>
  );
}
