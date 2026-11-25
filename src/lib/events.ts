import { EventEmitter } from "node:events";

type Bus = EventEmitter & { __azidan?: EventEmitter };

const globalBus = globalThis as unknown as { __azidanBus?: Bus };

function bus(): EventEmitter {
  if (!globalBus.__azidanBus) {
    const emitter = new EventEmitter();
    emitter.setMaxListeners(0);
    globalBus.__azidanBus = emitter;
  }
  return globalBus.__azidanBus;
}

export function onRates(listener: () => void): () => void {
  bus().on("rates", listener);
  return () => bus().off("rates", listener);
}

export function onAnnouncements(listener: () => void): () => void {
  bus().on("announcements", listener);
  return () => bus().off("announcements", listener);
}

export function emitRates(): void {
  bus().emit("rates");
}

export function emitAnnouncements(): void {
  bus().emit("announcements");
}
