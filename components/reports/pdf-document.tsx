/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ReportData } from '@/lib/queries/reports';

let fontRegistered = false;
let arabicFontRegistered = false;

const REGULAR_TTF = 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Regular.ttf';
const BOLD_TTF = 'https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf';
const ARABIC_TTF =
  'https://github.com/Gue3bara/Cairo/raw/master/fonts/ttf/Cairo-Regular.ttf';
const ARABIC_TTF_BOLD =
  'https://github.com/Gue3bara/Cairo/raw/master/fonts/ttf/Cairo-Bold.ttf';

async function ensureFonts(useArabic: boolean) {
  if (!fontRegistered) {
    Font.register({
      family: 'Roboto',
      fonts: [
        { src: REGULAR_TTF },
        { src: BOLD_TTF, fontWeight: 'bold' },
      ],
    });
    fontRegistered = true;
  }
  if (useArabic && !arabicFontRegistered) {
    Font.register({
      family: 'Cairo',
      fonts: [
        { src: ARABIC_TTF },
        { src: ARABIC_TTF_BOLD, fontWeight: 'bold' },
      ],
    });
    arabicFontRegistered = true;
  }
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#0F1115',
  },
  pageRtl: {
    padding: 36,
    fontFamily: 'Cairo',
    fontSize: 10,
    color: '#0F1115',
  },
  header: { marginBottom: 18, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F1115' },
  subtitle: { fontSize: 11, color: '#475569', marginTop: 4 },
  kpiRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  kpiCard: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6 },
  kpiLabel: { fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cell: { flex: 1 },
  cellRight: { flex: 1, textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export type PdfStrings = {
  businessName: string;
  periodLabel: string;
  generatedOn: string;
  totalIn: string;
  totalOut: string;
  profit: string;
  topChannels: string;
  topCategories: string;
  uncategorized: string;
  noData: string;
  channelHeader: string;
  categoryHeader: string;
  amountHeader: string;
  shareHeader: string;
  countHeader: string;
  footer: string;
};

export async function buildPdfDocument({
  data,
  locale,
  strings,
  format,
}: {
  data: ReportData;
  locale: 'en' | 'ar';
  strings: PdfStrings;
  format: (n: number) => string;
}) {
  const isRtl = locale === 'ar';
  await ensureFonts(isRtl);

  const pageStyle = isRtl ? styles.pageRtl : styles.page;

  return (
    <Document>
      <Page size="A4" style={pageStyle}>
        <View style={styles.header}>
          <Text style={styles.title}>{strings.businessName}</Text>
          <Text style={styles.subtitle}>
            {strings.periodLabel} · {strings.generatedOn}
          </Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{strings.totalIn}</Text>
            <Text style={[styles.kpiValue, { color: '#16a34a' }]}>{format(data.totalIn)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{strings.totalOut}</Text>
            <Text style={[styles.kpiValue, { color: '#dc2626' }]}>{format(data.totalOut)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{strings.profit}</Text>
            <Text style={[styles.kpiValue, { color: '#0284c7' }]}>{format(data.profit)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.topChannels}</Text>
          <BreakdownTable
            rows={data.topChannels}
            total={data.totalIn}
            uncategorized={strings.uncategorized}
            empty={strings.noData}
            labelHeader={strings.channelHeader}
            amountHeader={strings.amountHeader}
            shareHeader={strings.shareHeader}
            countHeader={strings.countHeader}
            format={format}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.topCategories}</Text>
          <BreakdownTable
            rows={data.topCategories}
            total={data.totalOut}
            uncategorized={strings.uncategorized}
            empty={strings.noData}
            labelHeader={strings.categoryHeader}
            amountHeader={strings.amountHeader}
            shareHeader={strings.shareHeader}
            countHeader={strings.countHeader}
            format={format}
          />
        </View>

        <Text style={styles.footer} fixed>
          {strings.footer}
        </Text>
      </Page>
    </Document>
  );
}

function BreakdownTable({
  rows,
  total,
  uncategorized,
  empty,
  labelHeader,
  amountHeader,
  shareHeader,
  countHeader,
  format,
}: {
  rows: ReportData['topChannels'];
  total: number;
  uncategorized: string;
  empty: string;
  labelHeader: string;
  amountHeader: string;
  shareHeader: string;
  countHeader: string;
  format: (n: number) => string;
}) {
  if (rows.length === 0) {
    return (
      <View style={styles.tableRow}>
        <Text style={styles.cell}>{empty}</Text>
      </View>
    );
  }
  return (
    <View>
      <View style={styles.tableHeader}>
        <Text style={styles.cell}>{labelHeader}</Text>
        <Text style={styles.cellRight}>{amountHeader}</Text>
        <Text style={styles.cellRight}>{shareHeader}</Text>
        <Text style={styles.cellRight}>{countHeader}</Text>
      </View>
      {rows.slice(0, 10).map((r) => {
        const pct = total === 0 ? 0 : (r.amount / total) * 100;
        return (
          <View key={r.id ?? '__uncat__'} style={styles.tableRow}>
            <Text style={styles.cell}>{r.name || uncategorized}</Text>
            <Text style={styles.cellRight}>{format(r.amount)}</Text>
            <Text style={styles.cellRight}>{pct.toFixed(0)}%</Text>
            <Text style={styles.cellRight}>{r.count}×</Text>
          </View>
        );
      })}
    </View>
  );
}
