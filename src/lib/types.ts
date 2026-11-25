export type AssetKind = "crypto" | "gift_card";
export type TradeStatus = "pending" | "processing" | "paid" | "rejected";

export interface Asset {
  id: number;
  kind: AssetKind;
  code: string;
  name: string;
  network: string | null;
  unit_label: string;
  icon_key: string;
  buy_rate: number;
  is_active: number;
  min_amount: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  last_login_at: string | null;
  created_at: string;
}

export interface RateHistory {
  id: number;
  asset_id: number;
  asset_code: string;
  change_type: "rate_update" | "status_change";
  previous_rate: number;
  new_rate: number;
  previous_active: number;
  new_active: number;
  changed_by: string;
  changed_by_id: number | null;
  note: string | null;
  created_at: string;
}

export interface Trade {
  id: number;
  reference: string;
  kind: AssetKind;
  asset_id: number;
  asset_code: string;
  asset_name: string;
  amount: number;
  rate_snapshot: number;
  payout_naira: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  payout_method: string;
  account_number: string;
  account_name: string;
  bank_name: string | null;
  note: string | null;
  status: TradeStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  tone: "info" | "success" | "warning";
  is_published: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Overview {
  pending: number;
  processing: number;
  paid: number;
  rejected: number;
  volume_naira: number;
  active_assets: number;
  total_assets: number;
  published_announcements: number;
  recent_trades: Trade[];
  recent_changes: RateHistory[];
}

export interface SessionPayload {
  sub: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export interface PublicTradeInput {
  kind: AssetKind;
  assetId: number;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  payoutMethod: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  note: string;
}
