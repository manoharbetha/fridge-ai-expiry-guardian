
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FancyAuth } from "@/components/ui/FancyAuth";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Supabase-powered login/signup
  const handleSubmit = async (form: { email: string; password: string; fullName?: string }) => {
    setError(null);
    setLoading(true);

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (err) {
        setError(err.message);
        toast.error(err.message);
      } else {
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } else {
      const { error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (err) {
        setError(err.message);
        toast.error(err.message);
      } else {
        toast.success("Account created! You can now log in.");
        setMode("login");
      }
    }
    setLoading(false);
  };

  return (
    <FancyAuth
      mode={mode}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      onModeChange={setMode}
    />
  );
};

export default Auth;
