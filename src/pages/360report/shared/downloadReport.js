import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Svg,
  Polyline,
  Circle,
} from "@react-pdf/renderer";
import { formatOneDecimal } from "../../../utils/reportCalculations";

const BAR_COLORS = ["#2563eb", "#7c3aed", "#059669", "#0d9488", "#d97706", "#dc2626", "#6366f1", "#ea580c"];

/** Match UI horizontal_bar_rag colors (DynamicReportRenderer). */
const RAG_BAR_COLORS = { "On Track": "#10B981", Monitor: "#F59E0B", Overdue: "#F97316", Critical: "#EF4444" };

function toNumeric(val) {
  if (val == null) return null;
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = parseFloat(val.replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const styles = StyleSheet.create({
  page: { paddingTop: 32, paddingHorizontal: 42, paddingBottom: 44, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
  },
  reportTitle: { fontSize: 17, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
  reportSubtitle: { fontSize: 10, color: "#64748b" },
  reportMeta: { fontSize: 8, color: "#94a3b8", marginTop: 4 },
  sectionBlock: { marginBottom: 18, paddingBottom: 16, paddingTop: 4, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  sectionBlockContinued: { marginBottom: 14, paddingBottom: 14, paddingTop: 2, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  sectionNumber: { fontSize: 8, fontWeight: "bold", color: "#2563eb", marginBottom: 4, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  sectionTitleContinued: { fontSize: 10, fontWeight: "bold", color: "#475569", marginBottom: 14 },
  sectionDesc: { fontSize: 9, color: "#475569", marginBottom: 10, lineHeight: 1.45 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  kpiBox: { width: "31%", minWidth: 96, padding: 7, backgroundColor: "#f8fafc", borderRadius: 4, borderWidth: 0.5, borderColor: "#e2e8f0" },
  kpiLabel: { fontSize: 6.5, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  kpiValue: { fontSize: 10, fontWeight: "bold", color: "#1e293b" },
  /** One chart block: description + viz + table — generous vertical rhythm */
  chartItemWrap: { marginBottom: 20 },
  chartDescription: { fontSize: 8, color: "#475569", marginBottom: 8, lineHeight: 1.45 },
  chartBlock: { marginTop: 14, marginBottom: 6 },
  chartDataTableTitle: { fontSize: 8, fontWeight: "bold", color: "#64748b", marginBottom: 6, marginTop: 2 },
  chartTitle: { fontSize: 9, fontWeight: "bold", color: "#334155", marginBottom: 8 },
  chartGraphWrap: { marginBottom: 2 },
  lineChartAxisRow: { flexDirection: "row", width: "100%", marginTop: 10 },
  lineChartAxisCell: { flex: 1, paddingHorizontal: 4 },
  lineChartAxisText: { fontSize: 7.5, color: "#64748b", textAlign: "center" },
  lineChartAxisWrap: { marginTop: 10, marginBottom: 4 },
  chartDataTableShell: { borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  barLabel: { fontSize: 8, color: "#334155", width: "28%", paddingRight: 8 },
  barTrack: { flex: 1, height: 14, backgroundColor: "#e2e8f0", borderRadius: 2, overflow: "hidden", flexDirection: "row" },
  barFill: { height: "100%", borderRadius: 2 },
  barValue: { fontSize: 8, fontWeight: "bold", color: "#1e293b", width: 48, textAlign: "right", paddingLeft: 8 },
  /* Pie chart: stacked strip + legend */
  pieStrip: { height: 20, flexDirection: "row", borderRadius: 3, overflow: "hidden", marginBottom: 8 },
  pieLegendRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 6, gap: 4 },
  pieLegendItem: { flexDirection: "row", alignItems: "center", marginRight: 10, marginBottom: 2 },
  pieLegendColor: { width: 10, height: 10, borderRadius: 2, marginRight: 4 },
  pieLegendText: { fontSize: 8, color: "#334155" },
  /* Vertical bar chart */
  verticalBarWrap: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 78, marginBottom: 6, paddingHorizontal: 2 },
  verticalBarCol: { alignItems: "center", flex: 1, height: "100%" },
  verticalBarPlaceholder: { flex: 1, justifyContent: "flex-end", alignItems: "center", minHeight: 48 },
  verticalBar: { width: "70%", minWidth: 14, borderRadius: 2 },
  verticalBarLabel: { fontSize: 7, color: "#64748b", marginTop: 4, textAlign: "center" },
  verticalBarValue: { fontSize: 7, fontWeight: "bold", color: "#1e293b", marginTop: 2 },
  tableWrap: { marginTop: 12, marginBottom: 10, borderWidth: 0.5, borderColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  tableTitle: { fontSize: 9, fontWeight: "bold", color: "#334155", marginBottom: 4, paddingHorizontal: 10, paddingTop: 6 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingVertical: 5, paddingHorizontal: 10, alignItems: "center", minHeight: 18 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#cbd5e1", paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#f8fafc", alignItems: "center" },
  tableCell: { fontSize: 8, color: "#334155", flex: 1, paddingRight: 8, lineHeight: 1.35 },
  tableCellLabel: { fontSize: 8, color: "#64748b", width: "38%", paddingRight: 10, lineHeight: 1.35 },
  tableCellValue: { fontSize: 8, color: "#1e293b", width: "62%", lineHeight: 1.35 },
  riskGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, marginBottom: 4 },
  riskBox: { flex: 1, minWidth: 56, padding: 7, backgroundColor: "#f8fafc", borderRadius: 4, borderWidth: 0.5, borderColor: "#e2e8f0" },
  riskCount: { fontSize: 14, fontWeight: "bold" },
  riskLabel: { fontSize: 8, color: "#64748b", marginTop: 2 },
  footer: { position: "absolute", bottom: 22, left: 42, right: 42, fontSize: 7, color: "#94a3b8", textAlign: "center" },
  emptyState: { marginTop: 48, padding: 24, alignItems: "center" },
  emptyStateText: { fontSize: 11, color: "#64748b", textAlign: "center" },
  /* IPR Insights – aligned after overview */
  iprBlock: { marginTop: 10, marginBottom: 10, paddingTop: 8, paddingBottom: 10, borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  iprSectionTitle: { fontSize: 8, fontWeight: "bold", color: "#2563eb", marginBottom: 3, letterSpacing: 0.5 },
  iprSectionSubtitle: { fontSize: 9, fontWeight: "bold", color: "#0f172a", marginBottom: 8 },
  iprChartBlock: { marginBottom: 10, paddingLeft: 2 },
  iprChartTitle: { fontSize: 8, fontWeight: "bold", color: "#334155", marginBottom: 4 },
  iprLabel: { fontSize: 6.5, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: 2, marginTop: 4 },
  iprLabelIssues: { color: "#b45309" },
  iprLabelRec: { color: "#059669" },
  iprListItem: { fontSize: 7.5, color: "#475569", marginBottom: 2, lineHeight: 1.35, paddingLeft: 4 },
});

function KpiRows({ kpis }) {
  const cards = kpis || [];
  if (!cards.length) return null;
  return (
    <View style={styles.kpiGrid}>
      {cards.map((k, i) => (
        <View key={i} style={styles.kpiBox}>
          <Text style={styles.kpiLabel}>{k.label}</Text>
          <Text style={styles.kpiValue}>{k.value}{k.sub ? ` (${k.sub})` : ""}</Text>
        </View>
      ))}
    </View>
  );
}

const CHART_TABLE_SKIP_KEYS = ["color", "severity_color", "badge_color", "rag"];
const LABEL_KEYS = [
  "label", "name", "stage", "type", "country", "series", "vin", "code", "system", "event",
  "month", "quarter", "dimension", "date", "survey", "x", "machine_id", "fault_code",
];
const VALUE_KEYS = [
  "value", "count", "throughput", "oee", "hours", "utilization", "quality", "avg_nps", "score",
  "percentage", "pct", "spend_k", "cost", "duration", "cumulative", "days", "claims", "completion", "nps", "y",
  "total_faults",
];

function getChartLabelAndValue(row, labelKey, valueKey) {
  const label = row[labelKey] != null ? String(row[labelKey]) : "";
  const num = valueKey != null ? toNumeric(row[valueKey]) : null;
  return { label, value: num };
}

function getChartKeys(data) {
  if (!data?.length) return { labelKey: null, valueKey: null };
  const first = data[0];
  const allKeys = Object.keys(first).filter(
    (k) => typeof first[k] !== "object" && first[k] !== null && !CHART_TABLE_SKIP_KEYS.includes(k)
  );
  const labelKey = allKeys.find((k) => LABEL_KEYS.includes(k)) || allKeys[0];
  const valueKey =
    allKeys.find((k) => VALUE_KEYS.includes(k) && toNumeric(first[k]) != null) ||
    allKeys.find((k) => k !== labelKey && toNumeric(first[k]) != null) ||
    null;
  return { labelKey, valueKey };
}

/** Pie chart in PDF: stacked coloured strip (proportional segments) + legend. */
function PieChartGraph({ chart }) {
  if (!chart?.data?.length) return null;
  const data = chart.data;
  const total = data.reduce((sum, d) => sum + (toNumeric(d.value) || 0), 0) || 1;
  const segments = data.map((d, i) => ({
    label: d.label || d.name || `Item ${i + 1}`,
    value: toNumeric(d.value) || 0,
    pct: ((toNumeric(d.value) || 0) / total) * 100,
    color: d.color || BAR_COLORS[i % BAR_COLORS.length],
  }));
  return (
    <View style={styles.chartGraphWrap}>
      <Text style={styles.chartTitle}>{chart.title}</Text>
      <View style={styles.pieStrip}>
        {segments.map((s, i) => (
          <View
            key={i}
            style={{ flex: s.pct, backgroundColor: s.color, minWidth: 2 }}
          />
        ))}
      </View>
      <View style={styles.pieLegendRow}>
        {segments.map((s, i) => (
          <View key={i} style={styles.pieLegendItem}>
            <View style={[styles.pieLegendColor, { backgroundColor: s.color }]} />
            <Text style={styles.pieLegendText}>{s.label}: {formatOneDecimal(s.value)} ({formatOneDecimal(s.pct)}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Vertical bar chart in PDF: bars with labels underneath. */
function VerticalBarChartGraph({ chart, omitTitle }) {
  if (!chart?.data?.length) return null;
  const data = chart.data.slice(0, 8);
  const { labelKey, valueKey } = getChartKeys(data);
  if (!valueKey) return null;
  const rows = data.map((row) => {
    const { label, value } = getChartLabelAndValue(row, labelKey, valueKey);
    return { label: (label || "").replace(/\n/g, " "), value: value != null ? value : 0 };
  });
  const maxVal = Math.max(...rows.map((r) => r.value), 1);
  const barMaxHeight = 58;
  return (
    <View style={styles.chartGraphWrap}>
      {chart.title && !omitTitle ? <Text style={styles.chartTitle}>{chart.title}</Text> : null}
      <View style={styles.verticalBarWrap}>
        {rows.map((r, i) => (
          <View key={i} style={styles.verticalBarCol}>
            <View style={styles.verticalBarPlaceholder}>
              <View
                style={[
                  styles.verticalBar,
                  {
                    height: Math.max(6, (r.value / maxVal) * barMaxHeight),
                    backgroundColor: (chart.data[i] && chart.data[i].color) || BAR_COLORS[i % BAR_COLORS.length],
                  },
                ]}
              />
            </View>
            <Text style={styles.verticalBarValue}>{formatOneDecimal(r.value)}</Text>
            <Text style={styles.verticalBarLabel} numberOfLines={2}>{r.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function horizontalBarFillColor(chart, i) {
  const d = chart.data[i];
  if (!d) return BAR_COLORS[i % BAR_COLORS.length];
  const t = (chart.chart_type || chart.chartType || "").toLowerCase();
  if (t === "horizontal_bar_rag" && d.rag) return RAG_BAR_COLORS[d.rag] || d.color || BAR_COLORS[i % BAR_COLORS.length];
  return d.color || BAR_COLORS[i % BAR_COLORS.length];
}

/** Horizontal bar graph in PDF — flex-based fill (react-pdf often renders % width as empty). */
function HorizontalBarChartGraph({ chart, omitTitle }) {
  if (!chart?.data?.length) return null;
  const data = chart.data.slice(0, 10);
  const { labelKey, valueKey } = getChartKeys(data);
  if (!valueKey) return null;
  const rows = data.map((row) => {
    const { label, value } = getChartLabelAndValue(row, labelKey, valueKey);
    return { label: label.replace(/\n/g, " "), value: value != null ? value : 0 };
  });
  const maxVal = Math.max(...rows.map((r) => r.value), 1);
  return (
    <View style={styles.chartGraphWrap}>
      {chart.title && !omitTitle ? <Text style={styles.chartTitle}>{chart.title}</Text> : null}
      {rows.map((r, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel} numberOfLines={1}>{r.label}</Text>
          <View style={styles.barTrack}>
            <View style={{ flexDirection: "row", width: "100%", height: "100%" }}>
              <View style={{ flex: Math.max(0, r.value), backgroundColor: horizontalBarFillColor(chart, i), minWidth: 0 }} />
              <View style={{ flex: Math.max(0, maxVal - r.value), minWidth: 0 }} />
            </View>
          </View>
          <Text style={styles.barValue}>{r.value != null ? formatOneDecimal(r.value) : "—"}</Text>
        </View>
      ))}
    </View>
  );
}

const LINE_CHART_W = 500;
const LINE_CHART_H = 102;
const LINE_CHART_MAX_X_LABELS = 7;

/** Avoid wrapping dozens of timestamps — sample evenly for a clean SaaS axis. */
function sampleLineChartXLabels(pts) {
  const n = pts.length;
  if (n <= LINE_CHART_MAX_X_LABELS) return pts.map((p) => p.xLabel);
  const out = [];
  for (let k = 0; k < LINE_CHART_MAX_X_LABELS; k++) {
    const idx = Math.round((k / (LINE_CHART_MAX_X_LABELS - 1)) * (n - 1));
    out.push(pts[idx].xLabel);
  }
  return out;
}

/** Even columns + optional second row — readable vs one crowded bullet line. */
function LineChartAxisLabels({ pts }) {
  const labels = sampleLineChartXLabels(pts);
  if (!labels.length) return null;
  const rows = labels.length <= 4 ? [labels] : [labels.slice(0, Math.ceil(labels.length / 2)), labels.slice(Math.ceil(labels.length / 2))];
  return (
    <View style={styles.lineChartAxisWrap}>
      {rows.map((row, ri) => (
        <View key={ri} style={[styles.lineChartAxisRow, ri > 0 ? { marginTop: 6 } : {}]}>
          {row.map((lab, i) => (
            <View key={i} style={styles.lineChartAxisCell}>
              <Text style={styles.lineChartAxisText}>{lab}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Line chart in PDF (SVG polyline) — aligns with UI line charts. */
function LineChartPdf({ chart, omitTitle }) {
  if (!chart?.data?.length) return null;
  const data = chart.data;
  const { labelKey, valueKey } = getChartKeys(data);
  const xKey = chart.x_axis || labelKey;
  const yKey = chart.y_axis || valueKey;
  if (!xKey || !yKey) return null;
  let pts = data.map((row, i) => ({
    xLabel: String(row[xKey] ?? row[labelKey] ?? i),
    y: toNumeric(row[yKey]),
  })).filter((p) => p.y != null);
  if (pts.length < 1) return null;
  if (pts.length === 1) pts = [pts[0], { ...pts[0], xLabel: `${pts[0].xLabel}` }];
  const ys = pts.map((p) => p.y);
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const yPad = (ymax - ymin) * 0.12 || 1;
  const minY = ymin - yPad;
  const maxY = ymax + yPad;
  const padL = 28;
  const padR = 10;
  const padT = 8;
  const padB = 16;
  const iw = LINE_CHART_W - padL - padR;
  const ih = LINE_CHART_H - padT - padB;
  const n = pts.length;
  const rangeY = maxY - minY || 1;
  const pointsStr = pts
    .map((p, i) => {
      const px = padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
      const py = padT + ih - ((p.y - minY) / rangeY) * ih;
      return `${px},${py}`;
    })
    .join(" ");
  return (
    <View style={styles.chartGraphWrap}>
      {chart.title && !omitTitle ? <Text style={styles.chartTitle}>{chart.title}</Text> : null}
      <Svg width={LINE_CHART_W} height={LINE_CHART_H} viewBox={`0 0 ${LINE_CHART_W} ${LINE_CHART_H}`}>
        <Polyline points={pointsStr} fill="none" stroke="#2563eb" strokeWidth={2} />
        {pts.map((p, i) => {
          const px = padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
          const py = padT + ih - ((p.y - minY) / rangeY) * ih;
          return <Circle key={i} cx={px} cy={py} r={3} fill="#2563eb" />;
        })}
      </Svg>
      <LineChartAxisLabels pts={pts} />
    </View>
  );
}

/** Grouped bars — one cluster per category (series from config or inferred). */
function GroupedBarChartPdf({ chart }) {
  if (!chart?.data?.length) return null;
  const data = chart.data;
  const series = chart.series?.length ? chart.series : null;
  const first = data[0];
  const keys = Object.keys(first).filter((k) => !CHART_TABLE_SKIP_KEYS.includes(k));
  const catKey = keys.find((k) => typeof first[k] === "string" && k !== "color") || keys[0];
  const seriesKeys = series || keys.filter((k) => k !== catKey && toNumeric(first[k]) != null);
  if (!seriesKeys.length) return <HorizontalBarChartGraph chart={chart} />;
  const maxVal = Math.max(1, ...data.flatMap((row) => seriesKeys.map((sk) => toNumeric(row[sk]) || 0)));
  return (
    <View style={styles.chartGraphWrap}>
      <Text style={styles.chartTitle}>{chart.title}</Text>
      {data.slice(0, 6).map((row, ri) => (
        <View key={ri} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 8, color: "#334155", marginBottom: 3 }}>{String(row[catKey] ?? ri)}</Text>
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: 64, justifyContent: "space-around" }}>
            {seriesKeys.map((sk, si) => {
              const v = toNumeric(row[sk]) || 0;
              const h = Math.max(4, (v / maxVal) * 48);
              return (
                <View key={sk} style={{ alignItems: "center", flex: 1, justifyContent: "flex-end", height: "100%" }}>
                  <Text style={{ fontSize: 7, fontWeight: "bold", color: "#1e293b", marginBottom: 2 }}>{formatOneDecimal(v)}</Text>
                  <View style={{ width: "72%", height: h, backgroundColor: BAR_COLORS[si % BAR_COLORS.length], borderRadius: 2 }} />
                  <Text style={{ fontSize: 6, color: "#64748b", marginTop: 4, textAlign: "center" }}>{sk}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function StackedBarChartPdf({ chart }) {
  if (!chart?.data?.length) return null;
  const series = chart.series || [];
  const colors = chart.colors || {};
  const data = chart.data;
  if (!series.length) return <VerticalBarChartGraph chart={{ ...chart, chart_type: "bar" }} />;
  return (
    <View style={styles.chartGraphWrap}>
      <Text style={styles.chartTitle}>{chart.title}</Text>
      {data.slice(0, 8).map((row, ri) => (
        <View key={ri} style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 8, color: "#334155", marginBottom: 4 }}>{String(row.country ?? row.label ?? ri)}</Text>
          <View style={{ height: 22, flexDirection: "row", borderRadius: 4, overflow: "hidden" }}>
            {series.map((sk, si) => (
              <View
                key={sk}
                style={{
                  flex: Math.max(0, toNumeric(row[sk]) || 0),
                  backgroundColor: colors[sk] || BAR_COLORS[si % BAR_COLORS.length],
                  minWidth: 0,
                }}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Bars (cost) + cumulative line — matches UI composed chart. */
function BarWithLineChartPdf({ chart }) {
  if (!chart?.data?.length) return null;
  const data = chart.data;
  const barRows = data.map((d, i) => ({
    label: String(d.event ?? d.label ?? d.name ?? i),
    value: toNumeric(d.cost) ?? 0,
    color: d.color || BAR_COLORS[i % BAR_COLORS.length],
  }));
  const lineRows = data.map((d, i) => ({
    label: String(d.event ?? d.label ?? d.name ?? i),
    value: toNumeric(d.cumulative) ?? 0,
    color: d.color,
  }));
  const barChart = { ...chart, chart_type: "bar", title: "", data: barRows };
  const lineChart = { ...chart, chart_type: "line", title: "", data: lineRows, x_axis: "label", y_axis: "value" };
  return (
    <View style={styles.chartGraphWrap}>
      <Text style={styles.chartTitle}>{chart.title}</Text>
      <Text style={{ fontSize: 7, color: "#94a3b8", marginBottom: 3 }}>Cost per event</Text>
      <VerticalBarChartGraph chart={barChart} omitTitle />
      <Text style={{ fontSize: 7, color: "#94a3b8", marginTop: 6, marginBottom: 3 }}>Cumulative</Text>
      <LineChartPdf chart={lineChart} omitTitle />
    </View>
  );
}

/** Gantt-style timeline — same proportions as UI (start / duration on shared scale). */
function GanttBarChartPdf({ chart }) {
  if (!chart?.data?.length) return null;
  const data = chart.data;
  const total = Math.max(1, data.reduce((s, d) => s + (toNumeric(d.duration) || 0), 0));
  return (
    <View style={styles.chartGraphWrap}>
      <Text style={styles.chartTitle}>{chart.title}</Text>
      {data.map((d, i) => (
        <View key={i} style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 8, color: "#334155", marginBottom: 4 }}>{String(d.stage ?? i)}</Text>
          <View style={{ height: 16, backgroundColor: "#e2e8f0", borderRadius: 2, flexDirection: "row", overflow: "hidden" }}>
            <View style={{ flex: Math.max(0, toNumeric(d.start) || 0), minWidth: 0 }} />
            <View
              style={{
                flex: Math.max(1, toNumeric(d.duration) || 0),
                backgroundColor: d.color || BAR_COLORS[i % BAR_COLORS.length],
                minWidth: 0,
              }}
            />
            <View style={{ flex: Math.max(0, total - (toNumeric(d.start) || 0) - (toNumeric(d.duration) || 0)), minWidth: 0 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Pick graph type by chart_type — mirrors DynamicReportRenderer. */
function ChartGraph({ chart }) {
  if (!chart?.data?.length) return null;
  const type = (chart.chart_type || chart.chartType || "").toLowerCase();
  if (type === "histogram") return <VerticalBarChartGraph chart={{ ...chart, chart_type: "bar" }} />;
  if (type === "pie" || type === "donut") return <PieChartGraph chart={chart} />;
  if (type === "bar") return <VerticalBarChartGraph chart={chart} />;
  if (type === "line") return <LineChartPdf chart={chart} />;
  if (type === "grouped_bar") return <GroupedBarChartPdf chart={chart} />;
  if (type === "stacked_bar") return <StackedBarChartPdf chart={chart} />;
  if (type === "bar_with_line") return <BarWithLineChartPdf chart={chart} />;
  if (type === "gantt_bar") return <GanttBarChartPdf chart={chart} />;
  if (type === "horizontal_bar" || type === "horizontal_bar_rag") return <HorizontalBarChartGraph chart={chart} />;
  return <HorizontalBarChartGraph chart={chart} />;
}

/** Tabular breakdown under each chart (matches pre-refactor PDF). */
function ChartAsTable({ chart }) {
  if (!chart?.data?.length) return null;
  const data = chart.data;
  const allKeys = Object.keys(data[0]).filter(
    (k) => typeof data[0][k] !== "object" && data[0][k] !== null && !CHART_TABLE_SKIP_KEYS.includes(k)
  );
  const labelKey = allKeys.find((k) => LABEL_KEYS.includes(k)) || allKeys[0];
  const valueKeys = allKeys.filter((k) => k !== labelKey && (typeof data[0][k] === "number" || typeof data[0][k] === "string"));
  const headers = [labelKey.replace(/_/g, " "), ...valueKeys.map((k) => k.replace(/_/g, " "))];
  return (
    <View style={styles.chartBlock}>
      <Text style={styles.chartDataTableTitle}>{chart.title ? `${chart.title} — Data` : "Data"}</Text>
      <View style={styles.chartDataTableShell}>
        <View style={styles.tableHeader}>
          {headers.map((h, i) => (
            <Text key={i} style={[styles.tableCell, { fontWeight: "bold", color: "#475569" }]}>{String(h).toUpperCase()}</Text>
          ))}
        </View>
        {data.slice(0, 14).map((row, ri) => (
          <View key={ri} style={[styles.tableRow, ri % 2 === 1 ? { backgroundColor: "#f8fafc" } : {}]}>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>{String(row[labelKey] ?? "")}</Text>
            {valueKeys.map((k, i) => (
              <Text key={i} style={styles.tableCell}>{row[k] != null ? (typeof row[k] === "number" ? formatOneDecimal(row[k]) : String(row[k])) : "—"}</Text>
            ))}
          </View>
        ))}
      </View>
      {data.length > 14 && (
        <Text style={{ fontSize: 7, color: "#94a3b8", marginTop: 6, paddingHorizontal: 4 }}>… and {data.length - 14} more rows</Text>
      )}
    </View>
  );
}

function SectionTable({ table }) {
  if (!table?.rows?.length) return null;
  const isKeyValue = table.type === "key_value";
  const headers = table.headers || [];
  return (
    <View style={styles.tableWrap}>
      {table.title ? <Text style={styles.tableTitle}>{table.title}</Text> : null}
      {table.description ? <Text style={styles.sectionDesc}>{table.description}</Text> : null}
      {isKeyValue ? (
        table.rows.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCellLabel}>{row.label}</Text>
            <Text style={styles.tableCellValue}>{row.value}</Text>
          </View>
        ))
      ) : (
        <>
          {headers.length > 0 && (
            <View style={styles.tableHeader}>
              {headers.map((h, i) => (
                <Text key={i} style={[styles.tableCell, { fontWeight: "bold", color: "#64748b" }]}>{String(h).toUpperCase()}</Text>
              ))}
            </View>
          )}
          {table.rows.map((row, ri) => (
            <View key={ri} style={styles.tableRow}>
              {headers.length > 0
                ? headers.map((h, ci) => {
                    const key = String(h).toLowerCase().replace(/\s+/g, "_");
                    const val = row[key] ?? row[h] ?? Object.values(row)[ci];
                    return <Text key={ci} style={styles.tableCell}>{val != null ? (typeof val === "number" ? formatOneDecimal(val) : String(val)) : "—"}</Text>;
                  })
                : Object.values(row).map((val, ci) => <Text key={ci} style={styles.tableCell}>{val != null ? (typeof val === "number" ? formatOneDecimal(val) : String(val)) : "—"}</Text>)}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function sortSections(sections) {
  const list = [...(sections || [])];
  return list.sort((a, b) => (a.section_order ?? 999) - (b.section_order ?? 999));
}

function SectionContent({ section, idx, showOverallScore }) {
  const cont = section._pdfContinued;
  const blockStyle = cont ? styles.sectionBlockContinued : styles.sectionBlock;
  return (
    <View key={section.section_id || idx} style={blockStyle}>
      {cont ? (
        <Text style={styles.sectionTitleContinued}>{section.title} (continued)</Text>
      ) : (
        <>
          <Text style={styles.sectionNumber}>{idx + 1}. {String(section.title || section.section_id).toUpperCase()}</Text>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </>
      )}
      {!cont && section.description ? <Text style={styles.sectionDesc}>{section.description}</Text> : null}
      <KpiRows kpis={section.kpi_cards} />
      {showOverallScore && (section.overall_score != null || section.overall_status || section.overall != null) && (
        <View style={{ marginTop: 8, marginBottom: 8, padding: 10, backgroundColor: "#f0fdf4", borderRadius: 4, borderWidth: 0.5, borderColor: "#bbf7d0" }}>
          <Text style={{ fontSize: 12, fontWeight: "bold", color: "#059669" }}>Overall Score: {section.overall_score ?? section.overall ?? "—"}/10</Text>
          {(section.overall_status || section.status) && <Text style={{ fontSize: 8, color: "#64748b", marginTop: 3 }}>Status: {section.overall_status || section.status}</Text>}
        </View>
      )}
      {section.risk_summary?.data?.length > 0 && (
        <View style={styles.riskGrid}>
          {section.risk_summary.data.map((r, i) => (
            <View key={i} style={styles.riskBox}>
              <Text style={[styles.riskCount, { color: r.color || "#64748b" }]}>{typeof r.count === "number" ? formatOneDecimal(r.count) : r.count}</Text>
              <Text style={styles.riskLabel}>{r.level} Risk</Text>
            </View>
          ))}
        </View>
      )}
      {section.charts?.length > 0 && section.charts.map((ch, ci) => (
        <View key={ch.chart_id || ci} style={styles.chartItemWrap}>
          {ch.description ? <Text style={styles.chartDescription}>{ch.description}</Text> : null}
          <ChartGraph chart={ch} />
          <ChartAsTable chart={ch} />
        </View>
      ))}
      {section.table ? <SectionTable table={section.table} /> : null}
    </View>
  );
}

/** IPR Insights block for PDF: Inferences, Issues, Recommendations from all charts. */
function IprBlock({ sections }) {
  const chartsWithIpr = (sections || []).flatMap((s) => (s.charts || []).filter((ch) => ch.iprInsights)).filter(
    (ch) => (ch.iprInsights.Inferences?.length || ch.iprInsights.Issues?.length || ch.iprInsights.Recommendations?.length)
  );
  if (!chartsWithIpr.length) return null;
  return (
    <View style={styles.iprBlock}>
      <Text style={styles.iprSectionTitle}>3. IPR INSIGHTS</Text>
      <Text style={styles.iprSectionSubtitle}>Insights, Issues &amp; Recommendations</Text>
      {chartsWithIpr.map((ch, i) => (
        <View key={ch.chart_id || i} style={styles.iprChartBlock}>
          <Text style={styles.iprChartTitle}>{ch.title}</Text>
          {(ch.iprInsights.Inferences || []).length > 0 && (
            <>
              <Text style={styles.iprLabel}>Inferences</Text>
              {(ch.iprInsights.Inferences || []).map((item, j) => (
                <Text key={j} style={styles.iprListItem}>• {item}</Text>
              ))}
            </>
          )}
          {(ch.iprInsights.Issues || []).length > 0 && (
            <>
              <Text style={[styles.iprLabel, styles.iprLabelIssues]}>Issues</Text>
              {(ch.iprInsights.Issues || []).map((item, j) => (
                <Text key={j} style={styles.iprListItem}>• {item}</Text>
              ))}
            </>
          )}
          {(ch.iprInsights.Recommendations || []).length > 0 && (
            <>
              <Text style={[styles.iprLabel, styles.iprLabelRec]}>Recommendations</Text>
              {(ch.iprInsights.Recommendations || []).map((item, j) => (
                <Text key={j} style={styles.iprListItem}>• {item}</Text>
              ))}
            </>
          )}
        </View>
      ))}
    </View>
  );
}

/**
 * Max charts per slice — layout is compact (no duplicate data tables under charts).
 * Splits are balanced so the last page is not a single sparse chart (e.g. 5 charts → 3+2 not 4+1).
 */
/** With chart + description + data table per block, 3 per page avoids clipping on typical A4. */
const CHARTS_PER_PDF_PAGE = 3;

function balancedChartChunks(charts, maxPerPage) {
  if (!charts?.length) return [];
  const n = charts.length;
  if (n <= maxPerPage) return [charts];
  const numPages = Math.ceil(n / maxPerPage);
  const baseSize = Math.floor(n / numPages);
  const remainder = n % numPages;
  const chunks = [];
  let start = 0;
  for (let p = 0; p < numPages; p++) {
    const size = baseSize + (p < remainder ? 1 : 0);
    chunks.push(charts.slice(start, start + size));
    start += size;
  }
  return chunks;
}

/**
 * Flatten sections into page-sized slices so charts are not clipped off the bottom of a page.
 */
function expandSectionsForPdfPages(sections) {
  const sorted = sortSections(sections || []);
  const out = [];
  sorted.forEach((section, sectionIndex) => {
    const charts = section.charts || [];
    if (charts.length === 0) {
      out.push({
        section,
        sectionIndex,
        key: `${section.section_id || "sec"}-${sectionIndex}-all`,
      });
      return;
    }
    const chunks = balancedChartChunks(charts, CHARTS_PER_PDF_PAGE);
    if (chunks.length === 1) {
      out.push({
        section,
        sectionIndex,
        key: `${section.section_id || "sec"}-${sectionIndex}-all`,
      });
      return;
    }
    chunks.forEach((chunk, chunkIdx) => {
      const isLast = chunkIdx === chunks.length - 1;
      const slice = {
        ...section,
        charts: chunk,
        _pdfContinued: chunkIdx > 0,
        kpi_cards: chunkIdx === 0 ? section.kpi_cards : [],
        description: chunkIdx === 0 ? section.description : undefined,
        risk_summary: chunkIdx === 0 ? section.risk_summary : undefined,
        table: isLast ? section.table : undefined,
        overall_score: chunkIdx === 0 ? section.overall_score : undefined,
        overall_status: chunkIdx === 0 ? section.overall_status : undefined,
        overall: chunkIdx === 0 ? section.overall : undefined,
        status: chunkIdx === 0 ? section.status : undefined,
      };
      out.push({
        section: slice,
        sectionIndex,
        key: `${section.section_id || "sec"}-${sectionIndex}-${chunkIdx}`,
      });
    });
  });
  return out;
}

function isOverviewSection(section) {
  if (!section || section.section_id === "summary" || section.type === "summary") return false;
  const title = String(section.title || section.section_id || "");
  return /overview/i.test(title);
}

function PdfEmptyBody({ reportKind }) {
  const copy =
    reportKind === "machine"
      ? "No fleet report sections were returned. Generate a report in the app or check your connection, then try again."
      : "No customer report sections were returned. Generate a report in the app or check your connection, then try again.";
  return (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 12, fontWeight: "bold", color: "#334155", marginBottom: 6 }}>No report content</Text>
      <Text style={styles.emptyStateText}>{copy}</Text>
    </View>
  );
}

/**
 * Machine 360 PDF — section-wise: summary KPIs, risk summary, graphs (bar visuals), tables, chart data, IPR after overview.
 * Payload = { meta, reports: { fleet_manager_360 } } — JSON format from backend unchanged.
 */
export function generateMachine360PDF(payload) {
  const dateStr = new Date().toLocaleDateString("en-GB", { dateStyle: "long" });
  const report = payload?.reports?.fleet_manager_360 || payload;
  const sections = report?.sections || [];
  const expanded = expandSectionsForPdfPages(sections);
  const pageItems = expanded.length > 0 ? expanded : [{ section: { section_id: "empty", charts: [] }, sectionIndex: 0, key: "empty", _empty: true }];
  const totalPages = pageItems.length;

  const Doc = () => (
    <Document>
      {pageItems.map((item, pageIdx) => (
        <Page key={item.key} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.reportTitle}>Machine 360 — Fleet Report</Text>
              <Text style={styles.reportSubtitle}>{report.fleet_name || report.report_title || "Fleet Overview"}</Text>
              <Text style={styles.reportMeta}>Report ID: {report.report_id || "—"} · Generated {dateStr}{totalPages > 1 ? ` · Page ${pageIdx + 1}/${totalPages}` : ""}</Text>
            </View>
          </View>

          <View>
            {item._empty ? (
              <PdfEmptyBody reportKind="machine" />
            ) : (
              <>
                <SectionContent section={item.section} idx={item.sectionIndex} showOverallScore={false} />
                {isOverviewSection(item.section) && !item.section._pdfContinued ? <IprBlock sections={sortSections(report?.sections || [])} /> : null}
              </>
            )}
          </View>

          <Text style={styles.footer}>Machine 360 Fleet Report · {report.report_id || "fleet"} · {dateStr}</Text>
        </Page>
      ))}
    </Document>
  );

  return pdf(<Doc />).toBlob().then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `machine_360_report_${(report.report_id || "fleet").replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch((err) => {
    console.error("Machine 360 PDF generation failed:", err);
    throw err;
  });
}

/**
 * Customer 360 PDF — section-wise: summary KPIs, overall score, graphs (bar visuals), tables, chart data.
 * Payload = { meta, reports: { customer_360 } } — JSON format from backend unchanged.
 */
export function generateCustomer360PDF(payload) {
  const dateStr = new Date().toLocaleDateString("en-GB", { dateStyle: "long" });
  const report = payload?.reports?.customer_360 || payload;
  const customer = report?.customer || {};
  const sections = report?.sections || [];
  const subtitle = customer.name
    ? `${customer.name} · ${customer.farm_type || ""} · ${customer.farm_size_ha != null ? `${customer.farm_size_ha} ha` : ""} · ${customer.country || ""}`.replace(/\s·\s·/g, " · ").replace(/^\s·\s|\s·\s$/g, "").trim()
    : (report.report_title || "Customer 360 Overview");

  const expanded = expandSectionsForPdfPages(sections);
  const pageItems = expanded.length > 0 ? expanded : [{ section: { section_id: "empty", charts: [] }, sectionIndex: 0, key: "empty", _empty: true }];
  const totalPages = pageItems.length;

  const Doc = () => (
    <Document>
      {pageItems.map((item, pageIdx) => (
        <Page key={item.key} size="A4" style={styles.page}>
          <View style={styles.header}>
            <View>
              <Text style={styles.reportTitle}>Customer 360 — Report</Text>
              <Text style={styles.reportSubtitle}>{subtitle}</Text>
              <Text style={styles.reportMeta}>Report ID: {report.report_id || "—"} · Generated {dateStr}{totalPages > 1 ? ` · Page ${pageIdx + 1}/${totalPages}` : ""}</Text>
            </View>
          </View>

          {item._empty ? <PdfEmptyBody reportKind="customer" /> : <SectionContent section={item.section} idx={item.sectionIndex} showOverallScore />}

          <Text style={styles.footer}>Customer 360 Report · {report.report_id || "customer"} · {dateStr}</Text>
        </Page>
      ))}
    </Document>
  );

  return pdf(<Doc />).toBlob().then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = report.report_id || (customer.name || "customer").replace(/\s+/g, "_");
    a.download = `customer_360_report_${baseName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch((err) => {
    console.error("Customer 360 PDF generation failed:", err);
    throw err;
  });
}
