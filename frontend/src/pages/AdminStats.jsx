import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import AdminChartsPanel from "../components/AdminChartsPanel";
import { useI18n } from "../i18n/I18nContext";
import { getApiError } from "../utils/apiError";
import api from "../api";
import "../styles/AdminPages.css";

export default function AdminStats() {
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
    <AdminShell title={t("statsTitle")} subtitle={t("statsSubtitle")}>
      <AdminChartsPanel
        charts={charts}
        stats={stats}
        loading={loading}
        error={error}
      />
    </AdminShell>
  );
}
