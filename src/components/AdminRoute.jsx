import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase, checkIsAdmin } from "../lib/supabase.js";

export default function AdminRoute() {
  const [s, setS] = useState({ loading: true, ok: false });
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setS({ loading: false, ok: false });
      const ok = await checkIsAdmin(data.user.id);
      setS({ loading: false, ok });
    })();
  }, []);
  if (s.loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Memuat…</div>;
  if (!s.ok) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
