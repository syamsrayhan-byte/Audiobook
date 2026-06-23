import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase, checkIsAdmin } from "../lib/supabase.js";
import BrandLogo from "../components/BrandLogo.jsx";

const ADMIN_USERNAME = "HCR.ID";
const ADMIN_EMAIL = "hcr.id@hcr.local";
const ADMIN_PASSWORD = "12345678";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return toast.error("Kredensial admin salah");
    }
    setLoading(true);
    // Try sign-in; if account doesn't exist yet, sign up then sign in.
    let { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (error) {
      const { error: signUpErr } = await supabase.auth.signUp({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      if (signUpErr && !/registered/i.test(signUpErr.message)) {
        setLoading(false);
        return toast.error("Gagal bootstrap admin: " + signUpErr.message);
      }
      const r = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      error = r.error;
    }
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Ensure admin role row
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) {
      const isAdmin = await checkIsAdmin(u.user.id);
      if (!isAdmin) {
        await supabase.from("user_roles").insert({ user_id: u.user.id, role: "admin" });
      }
    }
    setLoading(false);
    toast.success("Masuk sebagai admin");
    navigate("/admin/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="glass rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-3 mb-6">
          <BrandLogo size={56} />
          <h1 className="text-2xl font-semibold">Admin HCR.ID</h1>
          <p className="text-sm text-slate-400">Login khusus administrator</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Username</label>
            <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="HCR.ID" />
          </div>
          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full rounded-lg py-2.5">
            {loading ? "Memproses…" : "Masuk Admin"}
          </button>
        </form>
        <div className="mt-6 text-center text-xs text-slate-500">
          <Link to="/login" className="hover:text-gold-400">← Kembali ke login peserta</Link>
        </div>
      </div>
    </div>
  );
}
