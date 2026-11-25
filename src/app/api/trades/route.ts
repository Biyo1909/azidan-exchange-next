import { NextRequest } from "next/server";
import { body, fail, number, ok, text } from "@/lib/api";
import { createTrade, getAssetById, getTradeByReference } from "@/lib/db";
import type { PublicTradeInput, TradeStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const data = await body(request);

  const assetId = number(data.assetId);
  const asset = Number.isInteger(assetId) ? getAssetById(assetId) : undefined;
  if (!asset || !asset.is_active) return fail("This asset is not available for trading.", 400);
  if (data.kind !== asset.kind) return fail("Invalid asset category.", 400);

  const amount = number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) return fail("Enter a valid amount.", 400);
  if (amount < asset.min_amount) return fail(`Minimum trade is ${asset.min_amount} ${asset.unit_label}.`, 400);

  const customerName = text(data.customerName, 120);
  const customerEmail = text(data.customerEmail, 180).toLowerCase();
  const customerPhone = text(data.customerPhone, 30);
  const payoutMethod = text(data.payoutMethod, 40);
  const accountNumber = text(data.accountNumber, 30);
  const accountName = text(data.accountName, 120);
  const bankName = text(data.bankName, 120);
  const note = text(data.note, 500);

  if (customerName.length < 3) return fail("Enter your full name.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return fail("Enter a valid email address.", 400);
  if (customerPhone.replace(/\D/g, "").length < 10) return fail("Enter a valid phone number.", 400);
  if (!payoutMethod) return fail("Select a payout method.", 400);
  if (accountNumber.replace(/\D/g, "").length < 10) return fail("Enter a valid account number.", 400);
  if (accountName.length < 3) return fail("Enter the account name.", 400);

  const input: PublicTradeInput = {
    kind: asset.kind,
    assetId: asset.id,
    amount: Number(amount.toFixed(8)),
    customerName,
    customerEmail,
    customerPhone,
    payoutMethod,
    accountNumber,
    accountName,
    bankName,
    note,
  };

  const trade = createTrade(input, asset);
  return ok(
    {
      reference: trade.reference,
      status: trade.status,
      assetName: trade.asset_name,
      amount: trade.amount,
      payoutNaira: trade.payout_naira,
      createdAt: trade.created_at,
    },
    201,
  );
}

export function GET(request: NextRequest) {
  const reference = text(request.nextUrl.searchParams.get("reference"), 40).toUpperCase();
  if (!reference) return fail("A trade reference is required.", 400);
  const trade = getTradeByReference(reference);
  if (!trade) return fail("No trade found for that reference.", 404);

  const payload: Pick<
    typeof trade,
    "reference" | "asset_code" | "asset_name" | "amount" | "rate_snapshot" | "payout_naira" | "status" | "created_at" | "updated_at" | "paid_at"
  > = {
    reference: trade.reference,
    asset_code: trade.asset_code,
    asset_name: trade.asset_name,
    amount: trade.amount,
    rate_snapshot: trade.rate_snapshot,
    payout_naira: trade.payout_naira,
    status: trade.status as TradeStatus,
    created_at: trade.created_at,
    updated_at: trade.updated_at,
    paid_at: trade.paid_at,
  };
  return ok({ trade: payload });
}
