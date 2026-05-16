import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ReportData } from '@/lib/queries/reports';
import type {
  ExportDetail,
  ExportRevenueRow,
  ExportExpenseRow,
  ExportShopifyOrder,
} from '@/lib/queries/export-detail';

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
    paddingBottom: 60,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#0F1115',
  },
  pageRtl: {
    padding: 36,
    paddingBottom: 60,
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
  cellNarrow: { width: 60 },
  cellNarrowRight: { width: 80, textAlign: 'right' },
  miniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  miniLabel: { color: '#475569' },
  miniValue: { fontWeight: 'bold' },
  badgePos: { color: '#16a34a' },
  badgeNeg: { color: '#dc2626' },
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
  momTitle: string;
  momMetricRevenue: string;
  momMetricExpenses: string;
  momMetricProfit: string;
  momCurrentHeader: string;
  momPreviousHeader: string;
  momChangeHeader: string;
  unpaidTitle: string;
  unpaidRevenueLabel: string;
  unpaidExpensesLabel: string;
  countWord: string;
  revenueDetailTitle: string;
  expenseDetailTitle: string;
  dateHeader: string;
  nameHeader: string;
  counterpartyHeader: string;
  paymentHeader: string;
  statusHeader: string;
  shopifyTitle: string;
  collectionRateLabel: string;
  revenueGapLabel: string;
  orderVolumeLabel: string;
  totalOrderedLabel: string;
  avgOrderValueLabel: string;
  refundedLabel: string;
  shopifyOrdersTitle: string;
  orderHeader: string;
  customerHeader: string;
  uncategorized: string;
  noData: string;
  channelHeader: string;
  categoryHeader: string;
  amountHeader: string;
  shareHeader: string;
  countHeader: string;
  footer: string;
  paid: string;
  unpaid: string;
};

const MAX_DETAIL_ROWS = 25;

export async function buildPdfDocument({
  data,
  detail,
  locale,
  strings,
  format,
}: {
  data: ReportData;
  detail: ExportDetail;
  locale: 'en' | 'ar';
  strings: PdfStrings;
  format: (n: number) => string;
}) {
  const isRtl = locale === 'ar';
  await ensureFonts(isRtl);

  const pageStyle = isRtl ? styles.pageRtl : styles.page;

  const momRows = [
    {
      label: strings.momMetricRevenue,
      current: data.totalIn,
      previous: data.prevTotalIn,
    },
    {
      label: strings.momMetricExpenses,
      current: data.totalOut,
      previous: data.prevTotalOut,
    },
    {
      label: strings.momMetricProfit,
      current: data.profit,
      previous: data.prevProfit,
    },
  ];

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
          <Text style={styles.sectionTitle}>{strings.momTitle}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.cell}>{' '}</Text>
            <Text style={styles.cellRight}>{strings.momCurrentHeader}</Text>
            <Text style={styles.cellRight}>{strings.momPreviousHeader}</Text>
            <Text style={styles.cellRight}>{strings.momChangeHeader}</Text>
          </View>
          {momRows.map((r) => {
            const change = pctChange(r.current, r.previous);
            const positive = change >= 0;
            return (
              <View key={r.label} style={styles.tableRow}>
                <Text style={styles.cell}>{r.label}</Text>
                <Text style={styles.cellRight}>{format(r.current)}</Text>
                <Text style={styles.cellRight}>{format(r.previous)}</Text>
                <Text
                  style={[
                    styles.cellRight,
                    positive ? styles.badgePos : styles.badgeNeg,
                  ]}
                >
                  {positive ? '+' : ''}
                  {change.toFixed(0)}%
                </Text>
              </View>
            );
          })}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.unpaidTitle}</Text>
          <View style={styles.miniRow}>
            <Text style={styles.miniLabel}>
              {strings.unpaidRevenueLabel} ({detail.unpaid.unpaidRevenueCount}{' '}
              {strings.countWord})
            </Text>
            <Text style={styles.miniValue}>
              {format(detail.unpaid.unpaidRevenueTotal)}
            </Text>
          </View>
          <View style={styles.miniRow}>
            <Text style={styles.miniLabel}>
              {strings.unpaidExpensesLabel} ({detail.unpaid.unpaidExpensesCount}{' '}
              {strings.countWord})
            </Text>
            <Text style={styles.miniValue}>
              {format(detail.unpaid.unpaidExpensesTotal)}
            </Text>
          </View>
        </View>

        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>{strings.revenueDetailTitle}</Text>
          <RevenueDetail
            rows={detail.revenue.slice(0, MAX_DETAIL_ROWS)}
            empty={strings.noData}
            dateHeader={strings.dateHeader}
            nameHeader={strings.nameHeader}
            counterpartyHeader={strings.counterpartyHeader}
            paymentHeader={strings.paymentHeader}
            amountHeader={strings.amountHeader}
            format={format}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.expenseDetailTitle}</Text>
          <ExpenseDetail
            rows={detail.expenses.slice(0, MAX_DETAIL_ROWS)}
            empty={strings.noData}
            dateHeader={strings.dateHeader}
            nameHeader={strings.nameHeader}
            counterpartyHeader={strings.counterpartyHeader}
            paymentHeader={strings.paymentHeader}
            statusHeader={strings.statusHeader}
            amountHeader={strings.amountHeader}
            paidLabel={strings.paid}
            unpaidLabel={strings.unpaid}
            format={format}
          />
        </View>

        {detail.shopify.connected && detail.shopify.stats && detail.shopify.collection ? (
          <>
            <View style={styles.section} break>
              <Text style={styles.sectionTitle}>{strings.shopifyTitle}</Text>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>{strings.collectionRateLabel}</Text>
                <Text style={styles.miniValue}>
                  {detail.shopify.collection.rate == null
                    ? '—'
                    : `${detail.shopify.collection.rate.toFixed(0)}%`}
                </Text>
              </View>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>{strings.revenueGapLabel}</Text>
                <Text style={styles.miniValue}>
                  {format(detail.shopify.collection.gap)}
                </Text>
              </View>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>{strings.orderVolumeLabel}</Text>
                <Text style={styles.miniValue}>
                  {detail.shopify.stats.orderCount}
                </Text>
              </View>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>{strings.totalOrderedLabel}</Text>
                <Text style={styles.miniValue}>
                  {format(detail.shopify.stats.totalOrdered)}
                </Text>
              </View>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>{strings.avgOrderValueLabel}</Text>
                <Text style={styles.miniValue}>
                  {format(detail.shopify.stats.avgOrderValue)}
                </Text>
              </View>
              <View style={styles.miniRow}>
                <Text style={styles.miniLabel}>{strings.refundedLabel}</Text>
                <Text style={styles.miniValue}>
                  {detail.shopify.stats.refundedCount} ·{' '}
                  {format(detail.shopify.stats.refundedTotal)}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.shopifyOrdersTitle}</Text>
              <ShopifyOrdersTable
                rows={detail.shopify.orders.slice(0, MAX_DETAIL_ROWS)}
                empty={strings.noData}
                dateHeader={strings.dateHeader}
                orderHeader={strings.orderHeader}
                customerHeader={strings.customerHeader}
                statusHeader={strings.statusHeader}
                amountHeader={strings.amountHeader}
                format={format}
              />
            </View>
          </>
        ) : null}

        <Text style={styles.footer} fixed>
          {strings.footer}
        </Text>
      </Page>
    </Document>
  );
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
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

function RevenueDetail({
  rows,
  empty,
  dateHeader,
  nameHeader,
  counterpartyHeader,
  paymentHeader,
  amountHeader,
  format,
}: {
  rows: ExportRevenueRow[];
  empty: string;
  dateHeader: string;
  nameHeader: string;
  counterpartyHeader: string;
  paymentHeader: string;
  amountHeader: string;
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
        <Text style={styles.cellNarrow}>{dateHeader}</Text>
        <Text style={styles.cell}>{nameHeader}</Text>
        <Text style={styles.cell}>{counterpartyHeader}</Text>
        <Text style={styles.cell}>{paymentHeader}</Text>
        <Text style={styles.cellNarrowRight}>{amountHeader}</Text>
      </View>
      {rows.map((r, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.cellNarrow}>{fmtDate(r.date)}</Text>
          <Text style={styles.cell}>{r.itemName ?? '—'}</Text>
          <Text style={styles.cell}>{r.channel ?? '—'}</Text>
          <Text style={styles.cell}>{r.paymentMethod ?? '—'}</Text>
          <Text style={styles.cellNarrowRight}>{format(r.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

function ExpenseDetail({
  rows,
  empty,
  dateHeader,
  nameHeader,
  counterpartyHeader,
  paymentHeader,
  statusHeader,
  amountHeader,
  paidLabel,
  unpaidLabel,
  format,
}: {
  rows: ExportExpenseRow[];
  empty: string;
  dateHeader: string;
  nameHeader: string;
  counterpartyHeader: string;
  paymentHeader: string;
  statusHeader: string;
  amountHeader: string;
  paidLabel: string;
  unpaidLabel: string;
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
        <Text style={styles.cellNarrow}>{dateHeader}</Text>
        <Text style={styles.cell}>{nameHeader}</Text>
        <Text style={styles.cell}>{counterpartyHeader}</Text>
        <Text style={styles.cell}>{paymentHeader}</Text>
        <Text style={styles.cell}>{statusHeader}</Text>
        <Text style={styles.cellNarrowRight}>{amountHeader}</Text>
      </View>
      {rows.map((r, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.cellNarrow}>{fmtDate(r.date)}</Text>
          <Text style={styles.cell}>{r.name ?? '—'}</Text>
          <Text style={styles.cell}>{r.vendor ?? r.category ?? '—'}</Text>
          <Text style={styles.cell}>{r.paymentMethod ?? '—'}</Text>
          <Text style={styles.cell}>{r.status === 'paid' ? paidLabel : unpaidLabel}</Text>
          <Text style={styles.cellNarrowRight}>{format(r.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

function ShopifyOrdersTable({
  rows,
  empty,
  dateHeader,
  orderHeader,
  customerHeader,
  statusHeader,
  amountHeader,
  format,
}: {
  rows: ExportShopifyOrder[];
  empty: string;
  dateHeader: string;
  orderHeader: string;
  customerHeader: string;
  statusHeader: string;
  amountHeader: string;
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
        <Text style={styles.cellNarrow}>{dateHeader}</Text>
        <Text style={styles.cellNarrow}>{orderHeader}</Text>
        <Text style={styles.cell}>{customerHeader}</Text>
        <Text style={styles.cell}>{statusHeader}</Text>
        <Text style={styles.cellNarrowRight}>{amountHeader}</Text>
      </View>
      {rows.map((r, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.cellNarrow}>{fmtDate(r.date)}</Text>
          <Text style={styles.cellNarrow}>#{r.orderNumber ?? '—'}</Text>
          <Text style={styles.cell}>{r.customer ?? '—'}</Text>
          <Text style={styles.cell}>
            {[r.financialStatus, r.fulfillmentStatus].filter(Boolean).join(' · ') ||
              '—'}
          </Text>
          <Text style={styles.cellNarrowRight}>{format(r.amount)}</Text>
        </View>
      ))}
    </View>
  );
}
