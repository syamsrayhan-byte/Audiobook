import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function ProtectedRoute() {
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setState({ loading: false, user: data.user }));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setState({ loading: false, user: session?.user ?? null })
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  if (state.loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Memuat…</div>;
  if (!state.user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
