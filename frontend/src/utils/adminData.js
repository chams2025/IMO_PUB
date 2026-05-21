export function formatDateFr(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function formatMonthShort(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { month: "short" });
  } catch {
    return "";
  }
}

export function mergeMonthly(annoncesByMonth, usersByMonth) {
  const map = new Map();
  for (const row of annoncesByMonth || []) {
    const k = row.month;
    map.set(k, { month: k, annonces: row.count ?? 0, users: 0 });
  }
  for (const row of usersByMonth || []) {
    const k = row.month;
    const prev = map.get(k) || { month: k, annonces: 0, users: 0 };
    prev.users = row.count ?? 0;
    map.set(k, prev);
  }
  return [...map.entries()]
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([, v]) => ({
      ...v,
      monthLabel: formatMonthShort(v.month) || "—",
    }));
}

export function typesToPercents(rows) {
  const list = rows || [];
  const total = list.reduce((s, x) => s + (Number(x.count) || 0), 0);
  if (!total)
    return [];
  return list.map((x) => ({
    label: x.type_bien || "—",
    pct: Math.round(((Number(x.count) || 0) / total) * 100),
    count: x.count,
  }));
}

const BAR_CLASSES = ["bar-alger", "bar-oran", "bar-tizi", "bar-blida"];

export function cityBarsFromCharts(annoncesByCity, maxBars = 8) {
  const list = (annoncesByCity || []).slice(0, maxBars);
  const maxC = Math.max(1, ...list.map((x) => Number(x.count) || 0));
  return list.map((item, index) => ({
    ville: item.ville || "—",
    count: Number(item.count) || 0,
    heightPx: ((Number(item.count) || 0) / maxC) * 180,
    barClass: BAR_CLASSES[index % BAR_CLASSES.length],
  }));
}

export function userMapFromRows(users) {
  const m = {};
  for (const u of users || []) {
    if (u && u.id != null) m[u.id] = u;
  }
  return m;
}

export function annonceMapFromRows(annonces) {
  const m = {};
  for (const a of annonces || []) {
    if (a && a.id != null) m[a.id] = a;
  }
  return m;
}

export function buildDashboardActivities(recent) {
  const items = [];
  const act = recent || {};

  for (const a of act.latest_annonces || []) {
    const ts = new Date(a.date_publication || 0).getTime() || 0;
    items.push({
      id: `ann-${a.id}`,
      name: (a.titre || "Annonce").slice(0, 48),
      action: `Publication : ${a.titre || ""}`,
      time: formatDateFr(a.date_publication),
      ts,
    });
  }

  for (const msg of act.latest_messages || []) {
    const ts = new Date(msg.date_envoi || 0).getTime() || 0;
    items.push({
      id: `msg-${msg.id}`,
      name: msg.nom || "Contact",
      action: "Nouveau message reçu",
      time: formatDateFr(msg.date_envoi),
      ts,
    });
  }

  for (const u of act.latest_users || []) {
    items.push({
      id: `usr-${u.id}`,
      name: u.username || "Utilisateur",
      action: "Nouvel utilisateur inscrit",
      time: "—",
      ts: 0,
    });
  }

  items.sort((a, b) => b.ts - a.ts);
  return items;
}

export function buildAdminTimeline(recent) {
  const items = [];
  const act = recent || {};

  for (const u of act.latest_users || []) {
    items.push({
      id: `usr-${u.id}`,
      type: "user",
      title: "Nouvel utilisateur inscrit",
      text: `${u.username || ""} — ${u.email || ""}`,
      time: "Récent",
      ts: Number(u.id) || 0,
    });
  }

  for (const a of act.latest_annonces || []) {
    const ts = new Date(a.date_publication || 0).getTime() || 0;
    items.push({
      id: `ann-${a.id}`,
      type: "annonce",
      title: "Annonce publiée",
      text: a.titre || "—",
      time: formatDateFr(a.date_publication),
      ts,
    });
  }

  for (const msg of act.latest_messages || []) {
    const ts = new Date(msg.date_envoi || 0).getTime() || 0;
    items.push({
      id: `msg-${msg.id}`,
      type: "message",
      title: "Message reçu",
      text: `${msg.nom || "Contact"} — ${msg.email || ""}`,
      time: formatDateFr(msg.date_envoi),
      ts,
    });
  }

  items.sort((a, b) => b.ts - a.ts);
  return items;
}

export function superAdminTimelineFromRecent(recent) {
  const rows = buildDashboardActivities(recent).slice(0, 20);
  return rows.map((item) => ({
    icon: item.id.startsWith("ann") ? "🏠" : item.id.startsWith("msg") ? "✉️" : "👤",
    title: item.action,
    user: item.name,
    description: item.action,
    type:
      item.id.startsWith("ann") ? "Annonce" : item.id.startsWith("msg") ? "Message" : "Utilisateur",
    time: item.time === "—" ? "Récent" : item.time,
    date: item.time,
    level: item.id.startsWith("msg") ? "danger" : "normal",
  }));
}

export function citiesToPercentBars(rows, topN = 5) {
  const list = (rows || []).slice(0, topN);
  const max = Math.max(1, ...list.map((x) => Number(x.count) || 0));
  return list.map((x) => ({
    name: x.ville || "—",
    value: Math.round(((Number(x.count) || 0) / max) * 100),
    count: Number(x.count) || 0,
  }));
}

export function scaleCountsForLine(counts, maxPx = 130) {
  const nums = counts.map((c) => Number(c) || 0);
  const max = Math.max(1, ...nums);
  return nums.map((c) => (c / max) * maxPx);
}

export function formatPriceDa(prix) {
  if (prix === null || prix === undefined || prix === "") return "—";
  const n = Number(prix);
  if (Number.isNaN(n)) return String(prix);
  return `${n.toLocaleString("fr-FR")} DA`;
}
