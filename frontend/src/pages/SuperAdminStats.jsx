import { useEffect, useState } from "react";
import SuperAdminShell from "../components/SuperAdminShell";
import AdminChartsPanel from "../components/AdminChartsPanel";
import { useI18n } from "../i18n/I18nContext";
import { getApiError } from "../utils/apiError";
import api from "../api";
import "../styles/SuperAdminPages.css";

export default function SuperAdminStats() {
  const { t } = useI18n();
  const [charts, setCharts] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [chartsRes, statsRes] = await Promise.all([
          api.get("/admin/charts/"),
          api.get("/admin/stats/"),
        ]);
        if (cancelled) return;
        setCharts(chartsRes.data || {});
        setStats(statsRes.data || {});
      } catch (err) {
        if (!cancelled) setError(getApiError(err, t("loadError")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <SuperAdminShell title={t("statsTitle")} subtitle={t("superStatsSubtitle")}>
      <div className="sa-page">
        <AdminChartsPanel
          charts={charts}
          stats={stats}
          loading={loading}
          error={error}
        />
      </div>
    </SuperAdminShell>
  );
}
