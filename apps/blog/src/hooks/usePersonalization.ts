import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";

import { getPersonalization, getPersonalizationByAccessCode } from "../apis/personalization";
import type { Personalization } from "../apis/personalization";
import { useAuth } from "../auth/AuthContext";
import { getCachedPersonalization, setCachedPersonalization } from "../lib/personalizationCache";

export function usePersonalization() {
  const { user } = useAuth();
  const { accessCode } = useParams<{ accessCode?: string }>();
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
        const res = await getPersonalizationByAccessCode(accessCode);
        const next = res.data.personalization ?? null;
        setPersonalization(next);
        setCachedPersonalization(next);
        return;
      }

      setPersonalization(getCachedPersonalization());
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载个性化配置失败");
      setPersonalization(getCachedPersonalization());
    } finally {
      setLoading(false);
    }
  }, [accessCode, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { personalization, loading, error, refresh };
}
