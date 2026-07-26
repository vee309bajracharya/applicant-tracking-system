import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import CustomLoader from "../../components/common/CustomLoader";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { persistSession } = useAuth();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return; // StrictMode double-invoke guard
    ranOnce.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");

    if (!token) {
      toast.error("Google login failed — no session returned.");
      navigate("/login", { replace: true });
      return;
    }

    const user = {
      id: params.get("id"),
      fullname: params.get("fullname"),
      email: params.get("email"),
      role: params.get("role"),
      status: params.get("status"),
    };

    persistSession(token, user);
    window.history.replaceState(null, "", "/oauth/callback"); // drop token from history
    toast.success("Logged in with Google");
    navigate("/", { replace: true });
  }, [navigate, persistSession]);

  return <CustomLoader label="Finishing Google sign-in..." />;
};

export default OAuthCallbackPage;
