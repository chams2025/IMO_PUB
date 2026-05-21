import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mergeMonthly, typesToPercents } from "../utils/adminData";
import { useI18n } from "../i18n/I18nContext";
import "../styles/AdminCharts.css";

const PIE_COLORS = ["#c9a227", "#4a7cbf", "#2d6a4f", "#8b5cf6", "#e8c547", "#64748b"];

export default function AdminChartsPanel({ charts = {}, stats = {}, loading, error }) {
  const { t } = useI18n();

  const monthly = mergeMonthly(charts.annonces_by_month, charts.users_by_month);
  const typesData = typesToPercents(charts.annonces_by_type).map((x) => ({
    name: x.label,
    value: x.count,
    pct: x.pct,
  }));
  const cityData = (charts.annonces_by_city || []).slice(0, 8).map((x) => ({
    name: x.ville || "—",
    count: Number(x.count) || 0,
  }));

  const kpiCards = [
    { label: t("totalUsers"), value: stats.total_users },
    { label: t("activeUsers"), value: stats.active_users },
    { label: t("blockedUsers"), value: stats.blocked_users },
    { label: t("totalAnnonces"), value: stats.total_annonces },
    { label: t("totalMessages"), value: stats.total_messages },
    { label: t("totalFavorites"), value: stats.total_favorites },
    { label: t("totalNotifications"), value: stats.total_notifications },
    { label: t("totalReports"), value: stats.total_reports ?? charts.reports_count },
    { label: t("contactMessagesCount"), value: charts.contact_messages_count },
  ];

  if (loading) {
    return <div className="charts-state">{t("loading")}</div>;
  }
  if (error) {
    return <div className="charts-state charts-error">{error}</div>;
  }

  return (
    <div className="admin-charts-panel">
      <section className="charts-kpi-grid">
        {kpiCards.map((card) => (
          <article key={card.label} className="charts-kpi-card">
            <small>{card.label}</small>
            <strong>{card.value ?? "—"}</strong>
          </article>
        ))}
      </section>

      <section className="charts-grid-2">
        <article className="charts-card">
          <h3>{t("chartCityTitle")}</h3>
          {cityData.length === 0 ? (
            <p className="charts-empty">{t("noData")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.15)" />
                <XAxis dataKey="name" tick={{ fill: "#f5f0e6", fontSize: 11 }} />
                <YAxis tick={{ fill: "#f5f0e6", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#152a45",
                    border: "1px solid rgba(201,162,39,0.4)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="#c9a227" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className="charts-card">
          <h3>{t("chartTypeTitle")}</h3>
          {typesData.length === 0 ? (
            <p className="charts-empty">{t("noData")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={typesData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, pct }) => `${name} ${pct}%`}
                >
                  {typesData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#152a45",
                    border: "1px solid rgba(201,162,39,0.4)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </article>
      </section>

      <section className="charts-grid-2">
        <article className="charts-card">
          <h3>{t("chartAnnoncesMonth")}</h3>
          {monthly.length === 0 ? (
            <p className="charts-empty">{t("noData")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.15)" />
                <XAxis dataKey="monthLabel" tick={{ fill: "#f5f0e6", fontSize: 11 }} />
                <YAxis tick={{ fill: "#f5f0e6", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#152a45",
                    border: "1px solid rgba(201,162,39,0.4)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="annonces"
                  stroke="#c9a227"
                  strokeWidth={2}
                  name={t("annonces")}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className="charts-card">
          <h3>{t("chartUsersMonth")}</h3>
          {monthly.length === 0 ? (
            <p className="charts-empty">{t("noData")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.15)" />
                <XAxis dataKey="monthLabel" tick={{ fill: "#f5f0e6", fontSize: 11 }} />
                <YAxis tick={{ fill: "#f5f0e6", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#152a45",
                    border: "1px solid rgba(201,162,39,0.4)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#4a7cbf"
                  strokeWidth={2}
                  name={t("users")}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </article>
      </section>
    </div>
  );
}
