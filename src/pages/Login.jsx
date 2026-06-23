import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../lib/supabase.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Berhasil masuk");
    navigate("/app", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="glass rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6">
          <BrandLogo size={56} />
          <h1 className="text-2xl font-semibold tracking-tight">HCR.ID</h1>
          <p className="text-sm text-slate-400">Masuk untuk mengakses audio afirmasi</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full rounded-lg py-2.5">
            {loading ? "Memproses…" : "Masuk"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          <Link to="/admin" className="hover:text-gold-400">Akses Admin</Link>
        </div>
      </div>
    </div>
  );
}
