import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase, checkIsAdmin } from "../lib/supabase.js";
import BrandLogo from "../components/BrandLogo.jsx";

const ADMIN_USERNAME = "HCR.ID";
const ADMIN_EMAIL = "admin@hcr.id";
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
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandLogo className="h-12 w-auto" />
        </div>
        <div className="glass-card rounded-2xl p-8 brand-glow">
          <div className="flex items-center gap-2 text-accent mb-3">
            {/* <ShieldCheck className="h-5 w-5" /> */}
            <span className="text-xs uppercase tracking-[0.2em]">Admin Area</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Masuk Admin</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Dashboard pengelola konten audio afirmasi.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                // value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="HCR.ID"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                // value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="w-full h-11 text-base rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} HCR.ID — Developing Corporate Future Leader
        </p>
      </div>
    </div>
  );
}
