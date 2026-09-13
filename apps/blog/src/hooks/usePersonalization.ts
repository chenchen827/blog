import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getHome } from "../apis/home";
import { getPersonalization } from "../apis/personalization";
import type { Personalization } from "../apis/personalization";
import { useAuth } from "../auth/AuthContext";
import { getCachedPersonalization, setCachedPersonalization } from "../lib/personalizationCache";

export function usePersonalization() {
  const { user } = useAuth();
  const { accessCode } = useParams<{ accessCode?: string }>();
  const navigate = useNavigate();
  const [personalization, setPersonalization] = useState<Personalization | null>(() => getCachedPersonalization());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (user) {
        const res = await getPersonalization();
        const next = res.data.personalization ?? null;
        setPersonalization(next);
        setCachedPersonalization(next);
        return;
      }

      if (accessCode) {
        const res = await getHome(accessCode);
        const next = res.data.personalization ?? null;

        if (!next) {
          setPersonalization(null);
          setCachedPersonalization(null);
          navigate("/login", { replace: true });
          return;
        }

        setPersonalization(next);
        setCachedPersonalization(next);
        return;
      }

      setPersonalization(getCachedPersonalization());
    } catch (err) {
      if (!user && accessCode) {
        setPersonalization(null);
        setCachedPersonalization(null);
        navigate("/login", { replace: true });
        return;
      }

      setError(err instanceof Error ? err.message : "加载个性化配置失败");
      setPersonalization(getCachedPersonalization());
    } finally {
      setLoading(false);
    }
  }, [accessCode, navigate, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { personalization, loading, error, refresh };
}
