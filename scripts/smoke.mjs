/* End-to-end API smoke test. Run with the server already listening on :3000. */
const base = process.env.AZIDAN_BASE_URL || "http://localhost:3000";
const json = (path, init = {}, cookie) =>
  fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers || {}),
    },
  });

const expect = (condition, message) => {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`OK: ${message}`);
};

const assetsResponse = await json("/api/assets");
const { assets } = await assetsResponse.json();
expect(assetsResponse.ok && assets.length >= 15, `public assets loaded (${assets.length})`);

const loginResponse = await json("/api/admin/login", {
  method: "POST",
  body: JSON.stringify({ username: "admin", password: "Azidan@2026" }),
});
const setCookie = loginResponse.headers.get("set-cookie") || "";
const cookie = setCookie.match(/azidan_admin=[^;]+/)?.[0] || "";
expect(loginResponse.ok && cookie.length > 0, "admin login issued a session cookie");

const meResponse = await json("/api/admin/me", {}, cookie);
expect(meResponse.ok, "admin session authenticated");

const usdt = assets.find((asset) => asset.code === "USDT");
const newRate = usdt.buy_rate + 1;
const patchResponse = await json(`/api/admin/assets/${usdt.id}`, {
  method: "PATCH",
  body: JSON.stringify({ buy_rate: newRate, note: "Smoke test" }),
}, cookie);
expect(patchResponse.ok, "rate updated by admin");

const afterResponse = await json("/api/assets");
const { assets: after } = await afterResponse.json();
expect(after.find((asset) => asset.code === "USDT").buy_rate === newRate, "public rate reflects the change immediately");

const historyResponse = await json(`/api/admin/rate-history?assetId=${usdt.id}`, {}, cookie);
const { history } = await historyResponse.json();
expect(history.some((entry) => entry.note === "Smoke test" && entry.changed_by === "admin"), "rate change written to audit history");

await json(`/api/admin/assets/${usdt.id}`, {
  method: "PATCH",
  body: JSON.stringify({ buy_rate: usdt.buy_rate, note: "Restore rate" }),
}, cookie);

// Verify the live stream pushes a rate event to connected public clients.
const streamController = new AbortController();
const streamResponse = await fetch(`${base}/api/stream`, { signal: streamController.signal });
expect(streamResponse.ok && (streamResponse.headers.get("content-type") || "").includes("text/event-stream"), "SSE stream connected");
const reader = streamResponse.body.getReader();
const decoder = new TextDecoder();
let streamBuffer = "";
const waitForRates = (async () => {
  while (!streamBuffer.includes("event: rates")) {
    const { value, done } = await reader.read();
    if (done) throw new Error("SSE stream closed before rate event");
    streamBuffer += decoder.decode(value, { stream: true });
  }
})();
await new Promise((resolve) => setTimeout(resolve, 250));
await json(`/api/admin/assets/${usdt.id}`, {
  method: "PATCH",
  body: JSON.stringify({ buy_rate: usdt.buy_rate + 2, note: "SSE test" }),
}, cookie);
await Promise.race([
  waitForRates,
  new Promise((_, reject) => setTimeout(() => reject(new Error("SSE rate event timed out")), 5000)),
]);
expect(streamBuffer.includes("event: rates"), "rate change pushed over SSE immediately");
streamController.abort();
await json(`/api/admin/assets/${usdt.id}`, {
  method: "PATCH",
  body: JSON.stringify({ buy_rate: usdt.buy_rate, note: "Restore after SSE test" }),
}, cookie);

const tradeResponse = await json("/api/trades", {
  method: "POST",
  body: JSON.stringify({
    kind: "crypto",
    assetId: usdt.id,
    amount: 100,
    customerName: "Smoke Test",
    customerEmail: "smoke@example.com",
    customerPhone: "+2348012345678",
    payoutMethod: "Bank transfer",
    accountNumber: "0123456789",
    accountName: "Smoke Test",
    bankName: "Access Bank",
    note: "",
  }),
});
const trade = await tradeResponse.json();
expect(tradeResponse.ok && trade.reference?.startsWith("AZD-"), `trade submitted (${trade.reference})`);
expect(trade.payoutNaira === 100 * usdt.buy_rate, "server-computed payout matches database rate");

const trackResponse = await json(`/api/trades?reference=${trade.reference}`);
const { trade: tracked } = await trackResponse.json();
expect(trackResponse.ok && tracked.status === "pending", "public tracker returns pending trade");

const listResponse = await json("/api/admin/trades", {}, cookie);
const { trades } = await listResponse.json();
const created = trades.find((entry) => entry.reference === trade.reference);
expect(Boolean(created), "admin trade list contains new trade");

const paidResponse = await json(`/api/admin/trades/${created.id}`, {
  method: "PATCH",
  body: JSON.stringify({ status: "paid", admin_note: "Smoke test settlement" }),
}, cookie);
expect(paidResponse.ok, "admin marked trade paid");

const finalResponse = await json(`/api/trades?reference=${trade.reference}`);
const { trade: finalTrade } = await finalResponse.json();
expect(finalTrade.status === "paid", "public tracker shows paid status");

const noticeResponse = await json("/api/admin/announcements", {
  method: "POST",
  body: JSON.stringify({ title: "Smoke test notice", body: "Temporary notice for automated verification.", tone: "info", is_published: true }),
}, cookie);
const { announcement } = await noticeResponse.json();
expect(noticeResponse.ok && announcement.id > 0, "announcement created");

const publicNotices = await (await json("/api/announcements")).json();
expect(publicNotices.announcements.some((item) => item.id === announcement.id), "announcement appears publicly");

await json(`/api/admin/announcements/${announcement.id}`, { method: "DELETE" }, cookie);
console.log("\nAll smoke checks passed.");
