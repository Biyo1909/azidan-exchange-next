import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "./security";
import type {
  AdminUser,
  Announcement,
  Asset,
  AssetKind,
  Overview,
  PublicTradeInput,
  RateHistory,
  Trade,
  TradeStatus,
} from "./types";

const globalForDb = globalThis as unknown as { __azidanDb?: DatabaseSync };

function databasePath(): string {
  const configured = process.env.AZIDAN_DB_PATH || "./data/azidan.db";
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

type SqlValue = string | number | bigint | null;

function all<T>(db: DatabaseSync, sql: string, ...params: SqlValue[]): T[] {
  return db.prepare(sql).all(...params) as unknown as T[];
}

function one<T>(db: DatabaseSync, sql: string, ...params: SqlValue[]): T | undefined {
  return db.prepare(sql).get(...params) as unknown as T | undefined;
}

function exec(db: DatabaseSync, sql: string, ...params: SqlValue[]): void {
  db.prepare(sql).run(...params);
}

export function getDb(): DatabaseSync {
  if (globalForDb.__azidanDb) return globalForDb.__azidanDb;

  const file = databasePath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      last_login_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL CHECK (kind IN ('crypto', 'gift_card')),
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      network TEXT,
      unit_label TEXT NOT NULL,
      icon_key TEXT NOT NULL,
      buy_rate REAL NOT NULL CHECK (buy_rate > 0),
      is_active INTEGER NOT NULL DEFAULT 1,
      min_amount REAL NOT NULL DEFAULT 0.01,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      asset_code TEXT NOT NULL,
      change_type TEXT NOT NULL CHECK (change_type IN ('rate_update', 'status_change')),
      previous_rate REAL NOT NULL,
      new_rate REAL NOT NULL,
      previous_active INTEGER NOT NULL,
      new_active INTEGER NOT NULL,
      changed_by TEXT NOT NULL,
      changed_by_id INTEGER,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL,
      asset_id INTEGER NOT NULL,
      asset_code TEXT NOT NULL,
      asset_name TEXT NOT NULL,
      amount REAL NOT NULL,
      rate_snapshot REAL NOT NULL,
      payout_naira REAL NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      payout_method TEXT NOT NULL,
      account_number TEXT NOT NULL,
      account_name TEXT NOT NULL,
      bank_name TEXT,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'rejected')),
      admin_note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tone TEXT NOT NULL DEFAULT 'info' CHECK (tone IN ('info', 'success', 'warning')),
      is_published INTEGER NOT NULL DEFAULT 1,
      published_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      created_by TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_public ON assets(kind, is_active, sort_order);
    CREATE INDEX IF NOT EXISTS idx_history_asset ON rate_history(asset_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_trades_reference ON trades(reference);
    CREATE INDEX IF NOT EXISTS idx_announcements_public ON announcements(is_published, published_at DESC);
  `);

  seed(db);
  globalForDb.__azidanDb = db;
  return db;
}

const seedAssets: Array<Omit<Asset, "id" | "created_at" | "updated_at">> = [
  { kind: "crypto", code: "BTC", name: "Bitcoin", network: "Bitcoin", unit_label: "BTC", icon_key: "BTC", buy_rate: 14850000, is_active: 1, min_amount: 0.001, sort_order: 1 },
  { kind: "crypto", code: "ETH", name: "Ethereum", network: "ERC-20", unit_label: "ETH", icon_key: "ETH", buy_rate: 528000, is_active: 1, min_amount: 0.01, sort_order: 2 },
  { kind: "crypto", code: "USDT", name: "Tether", network: "TRC-20 / ERC-20", unit_label: "USDT", icon_key: "USDT", buy_rate: 1520, is_active: 1, min_amount: 10, sort_order: 3 },
  { kind: "crypto", code: "BNB", name: "BNB", network: "BEP-20", unit_label: "BNB", icon_key: "BNB", buy_rate: 92100, is_active: 1, min_amount: 0.05, sort_order: 4 },
  { kind: "crypto", code: "SOL", name: "Solana", network: "Solana", unit_label: "SOL", icon_key: "SOL", buy_rate: 22400, is_active: 1, min_amount: 0.5, sort_order: 5 },
  { kind: "crypto", code: "XRP", name: "XRP", network: "XRP Ledger", unit_label: "XRP", icon_key: "XRP", buy_rate: 2140, is_active: 1, min_amount: 10, sort_order: 6 },
  { kind: "crypto", code: "LTC", name: "Litecoin", network: "Litecoin", unit_label: "LTC", icon_key: "LTC", buy_rate: 13600, is_active: 1, min_amount: 0.5, sort_order: 7 },
  { kind: "crypto", code: "DOGE", name: "Dogecoin", network: "Dogecoin", unit_label: "DOGE", icon_key: "DOGE", buy_rate: 38.5, is_active: 1, min_amount: 100, sort_order: 8 },
  { kind: "crypto", code: "ADA", name: "Cardano", network: "Cardano", unit_label: "ADA", icon_key: "ADA", buy_rate: 780, is_active: 1, min_amount: 20, sort_order: 9 },
  { kind: "crypto", code: "AVAX", name: "Avalanche", network: "Avalanche C-Chain", unit_label: "AVAX", icon_key: "AVAX", buy_rate: 5200, is_active: 1, min_amount: 0.5, sort_order: 10 },
  { kind: "gift_card", code: "APPLE", name: "Apple Gift Card", network: "USD · Any region", unit_label: "$1 face value", icon_key: "APPLE", buy_rate: 1480, is_active: 1, min_amount: 10, sort_order: 11 },
  { kind: "gift_card", code: "AMAZON", name: "Amazon Gift Card", network: "USD · Any region", unit_label: "$1 face value", icon_key: "AMAZON", buy_rate: 1420, is_active: 1, min_amount: 10, sort_order: 12 },
  { kind: "gift_card", code: "STEAM", name: "Steam Wallet Card", network: "USD · Global", unit_label: "$1 face value", icon_key: "STEAM", buy_rate: 1390, is_active: 1, min_amount: 10, sort_order: 13 },
  { kind: "gift_card", code: "GOOGLEPLAY", name: "Google Play Card", network: "USD · Global", unit_label: "$1 face value", icon_key: "GOOGLEPLAY", buy_rate: 1350, is_active: 1, min_amount: 10, sort_order: 14 },
  { kind: "gift_card", code: "ITUNES", name: "iTunes Gift Card", network: "USD · Any region", unit_label: "$1 face value", icon_key: "ITUNES", buy_rate: 1400, is_active: 1, min_amount: 10, sort_order: 15 },
  { kind: "gift_card", code: "WALMART", name: "Walmart Gift Card", network: "USD · US", unit_label: "$1 face value", icon_key: "WALMART", buy_rate: 1250, is_active: 1, min_amount: 20, sort_order: 16 },
  { kind: "gift_card", code: "EBAY", name: "eBay Gift Card", network: "USD · US", unit_label: "$1 face value", icon_key: "EBAY", buy_rate: 1180, is_active: 1, min_amount: 20, sort_order: 17 },
  { kind: "gift_card", code: "NORDSTROM", name: "Nordstrom Gift Card", network: "USD · US", unit_label: "$1 face value", icon_key: "NORDSTROM", buy_rate: 1100, is_active: 0, min_amount: 50, sort_order: 18 },
];

function seed(db: DatabaseSync): void {
  const now = new Date().toISOString();

  const adminCount = one<{ count: number }>(db, "SELECT COUNT(*) as count FROM admin_users")?.count ?? 0;
  if (adminCount === 0) {
    exec(
      db,
      `INSERT INTO admin_users (username, email, password_hash, full_name, role, created_at)
       VALUES (?, ?, ?, ?, 'super_admin', ?)`,
      process.env.ADMIN_USERNAME || "admin",
      process.env.ADMIN_EMAIL || "admin@azidanexchange.com",
      hashPassword(process.env.ADMIN_PASSWORD || "Azidan@2026"),
      process.env.ADMIN_NAME || "AZIDAN Administrator",
      now,
    );
  }

  const assetCount = one<{ count: number }>(db, "SELECT COUNT(*) as count FROM assets")?.count ?? 0;
  if (assetCount === 0) {
    const insert = db.prepare(
      `INSERT INTO assets (kind, code, name, network, unit_label, icon_key, buy_rate, is_active, min_amount, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const asset of seedAssets) {
      insert.run(
        asset.kind,
        asset.code,
        asset.name,
        asset.network,
        asset.unit_label,
        asset.icon_key,
        asset.buy_rate,
        asset.is_active,
        asset.min_amount,
        asset.sort_order,
        now,
        now,
      );
    }
  }

  const announcementCount = one<{ count: number }>(db, "SELECT COUNT(*) as count FROM announcements")?.count ?? 0;
  if (announcementCount === 0) {
    exec(
      db,
      `INSERT INTO announcements (title, body, tone, is_published, published_at, created_at, updated_at, created_by)
       VALUES (?, ?, 'success', 1, ?, ?, ?, 'system')`,
      "Instant Naira settlements now live",
      "Paid trades are processed in minutes. Submit your trade with accurate payout details to avoid delays.",
      now,
      now,
      now,
    );
  }
}

/* ------------------------------ Public reads ------------------------------ */

export function getAssets(kind?: AssetKind, activeOnly = false): Asset[] {
  const db = getDb();
  const where: string[] = [];
  const params: SqlValue[] = [];
  if (kind) {
    where.push("kind = ?");
    params.push(kind);
  }
  if (activeOnly) where.push("is_active = 1");
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return all<Asset>(db, `SELECT * FROM assets ${clause} ORDER BY sort_order ASC`, ...params);
}

export function getAssetById(id: number): Asset | undefined {
  return one<Asset>(getDb(), "SELECT * FROM assets WHERE id = ?", id);
}

export function getPublishedAnnouncements(limit = 5): Announcement[] {
  return all<Announcement>(
    getDb(),
    "SELECT * FROM announcements WHERE is_published = 1 ORDER BY COALESCE(published_at, created_at) DESC LIMIT ?",
    limit,
  );
}

export function getTradeByReference(reference: string): Trade | undefined {
  return one<Trade>(getDb(), "SELECT * FROM trades WHERE reference = ?", reference.toUpperCase());
}

/* ------------------------------ Admin reads ------------------------------- */

export function getAllAnnouncements(): Announcement[] {
  return all<Announcement>(getDb(), "SELECT * FROM announcements ORDER BY created_at DESC");
}

export function getRateHistory(assetId?: number, limit = 100): RateHistory[] {
  const db = getDb();
  if (assetId) {
    return all<RateHistory>(db, "SELECT * FROM rate_history WHERE asset_id = ? ORDER BY created_at DESC, id DESC LIMIT ?", assetId, limit);
  }
  return all<RateHistory>(db, "SELECT * FROM rate_history ORDER BY created_at DESC, id DESC LIMIT ?", limit);
}

export function getTrades(status?: TradeStatus | "all", limit = 200): Trade[] {
  const db = getDb();
  if (status && status !== "all") {
    return all<Trade>(db, "SELECT * FROM trades WHERE status = ? ORDER BY created_at DESC LIMIT ?", status, limit);
  }
  return all<Trade>(db, "SELECT * FROM trades ORDER BY created_at DESC LIMIT ?", limit);
}

export function getAdminByUsername(username: string): (AdminUser & { password_hash: string }) | undefined {
  return one<AdminUser & { password_hash: string }>(
    getDb(),
    "SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?)",
    username,
  );
}

export function getAdminById(id: number): AdminUser | undefined {
  return one<AdminUser>(getDb(), "SELECT id, username, email, full_name, role, last_login_at, created_at FROM admin_users WHERE id = ?", id);
}

export function touchAdminLogin(id: number): void {
  exec(getDb(), "UPDATE admin_users SET last_login_at = ? WHERE id = ?", new Date().toISOString(), id);
}

export function getOverview(): Overview {
  const db = getDb();
  const counts = one<Record<string, number>>(
    db,
    `SELECT
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
     FROM trades`,
  );
  const volume = one<{ total: number | null }>(db, "SELECT SUM(payout_naira) AS total FROM trades WHERE status IN ('paid', 'processing')");
  const assets = one<{ active: number; total: number }>(db, "SELECT SUM(is_active) AS active, COUNT(*) AS total FROM assets");
  const notices = one<{ count: number }>(db, "SELECT COUNT(*) AS count FROM announcements WHERE is_published = 1");
  return {
    pending: counts?.pending ?? 0,
    processing: counts?.processing ?? 0,
    paid: counts?.paid ?? 0,
    rejected: counts?.rejected ?? 0,
    volume_naira: volume?.total ?? 0,
    active_assets: assets?.active ?? 0,
    total_assets: assets?.total ?? 0,
    published_announcements: notices?.count ?? 0,
    recent_trades: all<Trade>(db, "SELECT * FROM trades ORDER BY created_at DESC LIMIT 6"),
    recent_changes: all<RateHistory>(db, "SELECT * FROM rate_history ORDER BY created_at DESC, id DESC LIMIT 6"),
  };
}

/* -------------------------------- Mutations ------------------------------- */

export interface AssetUpdate {
  buy_rate?: number;
  is_active?: number;
  note?: string;
}

export function updateAsset(id: number, update: AssetUpdate, admin: { id: number; username: string }): Asset | undefined {
  const db = getDb();
  const current = getAssetById(id);
  if (!current) return undefined;

  const newRate = update.buy_rate ?? current.buy_rate;
  const newActive = update.is_active ?? current.is_active;
  const now = new Date().toISOString();
  const transaction = db.prepare(
    "UPDATE assets SET buy_rate = ?, is_active = ?, updated_at = ? WHERE id = ?",
  );
  const history = db.prepare(
    `INSERT INTO rate_history
      (asset_id, asset_code, change_type, previous_rate, new_rate, previous_active, new_active, changed_by, changed_by_id, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  db.exec("BEGIN IMMEDIATE");
  try {
    transaction.run(newRate, newActive, now, id);
    if (newRate !== current.buy_rate) {
      history.run(id, current.code, "rate_update", current.buy_rate, newRate, current.is_active, newActive, admin.username, admin.id, update.note || null, now);
    }
    if (newActive !== current.is_active) {
      history.run(id, current.code, "status_change", current.buy_rate, newRate, current.is_active, newActive, admin.username, admin.id, update.note || null, now);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return getAssetById(id);
}

function makeReference(): string {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomBytes(5).toString("hex").toUpperCase().slice(0, 6);
  return `AZD-${day}-${suffix}`;
}

export function createTrade(input: PublicTradeInput, asset: Asset): Trade {
  const db = getDb();
  const now = new Date().toISOString();
  let reference = makeReference();
  while (getTradeByReference(reference)) reference = makeReference();

  exec(
    db,
    `INSERT INTO trades
      (reference, kind, asset_id, asset_code, asset_name, amount, rate_snapshot, payout_naira,
       customer_name, customer_email, customer_phone, payout_method, account_number, account_name,
       bank_name, note, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    reference,
    asset.kind,
    asset.id,
    asset.code,
    asset.name,
    input.amount,
    asset.buy_rate,
    Number((input.amount * asset.buy_rate).toFixed(2)),
    input.customerName,
    input.customerEmail,
    input.customerPhone,
    input.payoutMethod,
    input.accountNumber,
    input.accountName,
    input.bankName || null,
    input.note || null,
    now,
    now,
  );
  return getTradeByReference(reference)!;
}

export function updateTradeStatus(id: number, status: TradeStatus, adminNote: string): Trade | undefined {
  const db = getDb();
  const trade = one<Trade>(db, "SELECT * FROM trades WHERE id = ?", id);
  if (!trade) return undefined;
  const now = new Date().toISOString();
  exec(
    db,
    "UPDATE trades SET status = ?, admin_note = ?, updated_at = ?, paid_at = ? WHERE id = ?",
    status,
    adminNote || trade.admin_note,
    now,
    status === "paid" ? (trade.paid_at || now) : trade.paid_at,
    id,
  );
  return one<Trade>(db, "SELECT * FROM trades WHERE id = ?", id);
}

export type AnnouncementInput = {
  title: string;
  body: string;
  tone: "info" | "success" | "warning";
  is_published: number;
};

export function createAnnouncement(input: AnnouncementInput, admin: string): Announcement {
  const db = getDb();
  const now = new Date().toISOString();
  const publishedAt = input.is_published ? now : null;
  const result = db
    .prepare(
      `INSERT INTO announcements (title, body, tone, is_published, published_at, created_at, updated_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(input.title, input.body, input.tone, input.is_published, publishedAt, now, now, admin);
  return one<Announcement>(db, "SELECT * FROM announcements WHERE id = ?", Number(result.lastInsertRowid))!;
}

export function updateAnnouncement(id: number, input: AnnouncementInput): Announcement | undefined {
  const db = getDb();
  const current = one<Announcement>(db, "SELECT * FROM announcements WHERE id = ?", id);
  if (!current) return undefined;
  const now = new Date().toISOString();
  const publishedAt = input.is_published ? (current.published_at || now) : null;
  exec(
    db,
    "UPDATE announcements SET title = ?, body = ?, tone = ?, is_published = ?, published_at = ?, updated_at = ? WHERE id = ?",
    input.title,
    input.body,
    input.tone,
    input.is_published,
    publishedAt,
    now,
    id,
  );
  return one<Announcement>(db, "SELECT * FROM announcements WHERE id = ?", id);
}

export function deleteAnnouncement(id: number): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
  return result.changes > 0;
}
