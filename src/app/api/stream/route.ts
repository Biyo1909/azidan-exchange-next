import { NextRequest } from "next/server";
import { getAssets, getPublishedAnnouncements } from "@/lib/db";
import { onAnnouncements, onRates } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* client disconnected */
        }
      };
      const unsubscribeRates = onRates(() => send("rates", { assets: getAssets(undefined, true) }));
      const unsubscribeAnnouncements = onAnnouncements(() =>
        send("announcements", { announcements: getPublishedAnnouncements() }),
      );
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          /* client disconnected */
        }
      }, 20_000);

      send("connected", { at: Date.now() });
      cleanup = () => {
        clearInterval(ping);
        unsubscribeRates();
        unsubscribeAnnouncements();
      };
    },
    cancel() {
      cleanup();
    },
  });

  request.signal.addEventListener("abort", cleanup);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
