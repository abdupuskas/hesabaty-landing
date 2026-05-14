import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/business';
import {
  parseRangeKey,
  resolveDateRange,
  monthToDateRange,
  parseMonth,
} from '@/lib/date-range';

export async function GET(request: NextRequest) {
  const business = await getCurrentBusiness();
  if (!business) return new NextResponse('Unauthorized', { status: 401 });

  const monthParam = request.nextUrl.searchParams.get('month');
  const monthRange = monthToDateRange(monthParam);
  const range = monthRange
    ? {
        key: 'this-month' as const,
        startISO: monthRange.startISO,
        endISO: monthRange.endISO,
      }
    : resolveDateRange(parseRangeKey(request.nextUrl.searchParams.get('range')));
  const filenameLabel = parseMonth(monthParam) ? String(monthParam) : range.key;
  const supabase = await createClient();

  const revQuery = supabase
    .from('revenue_entries')
    .select(
      'amount, item_name, quantity, payment_method, shipping_provider, status, collected_at, note, sales_channels ( name )'
    )
    .eq('business_id', business.id)
    .order('collected_at', { ascending: false, nullsFirst: false });
  const expQuery = supabase
    .from('expenses')
    .select(
      'amount, name, vendor, payment_method, paid_at, due_date, is_recurring, note, expense_categories ( name )'
    )
    .eq('business_id', business.id)
    .order('paid_at', { ascending: false, nullsFirst: false });

  if (range.startISO) revQuery.gte('collected_at', range.startISO);
  if (range.endISO) revQuery.lt('collected_at', range.endISO);
  if (range.startISO) expQuery.gte('paid_at', range.startISO);
  if (range.endISO) expQuery.lt('paid_at', range.endISO);

  const [rev, exp] = await Promise.all([revQuery, expQuery]);

  const lines: string[] = [];
  lines.push(
    [
      'type',
      'date',
      'amount_egp',
      'name',
      'counterparty',
      'category_or_channel',
      'payment_method',
      'status',
      'note',
    ]
      .map(csvCell)
      .join(',')
  );

  for (const row of rev.data ?? []) {
    const r = row as {
      amount: number;
      item_name: string | null;
      payment_method: string | null;
      shipping_provider: string | null;
      status: string;
      collected_at: string | null;
      note: string | null;
      sales_channels: { name: string } | null;
    };
    lines.push(
      [
        'revenue',
        r.collected_at ?? '',
        (r.amount / 100).toFixed(2),
        r.item_name ?? '',
        r.shipping_provider ?? '',
        r.sales_channels?.name ?? '',
        r.payment_method ?? '',
        r.status ?? '',
        r.note ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
  }

  for (const row of exp.data ?? []) {
    const r = row as {
      amount: number;
      name: string | null;
      vendor: string | null;
      payment_method: string | null;
      paid_at: string | null;
      due_date: string | null;
      note: string | null;
      expense_categories: { name: string } | null;
    };
    lines.push(
      [
        'expense',
        r.paid_at ?? r.due_date ?? '',
        (r.amount / 100).toFixed(2),
        r.name ?? '',
        r.vendor ?? '',
        r.expense_categories?.name ?? '',
        r.payment_method ?? '',
        r.paid_at ? 'paid' : 'unpaid',
        r.note ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
  }

  const body = '﻿' + lines.join('\r\n');
  const filename = `hesabaty-${filenameLabel}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
