"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useApp } from "@/components/providers";
import { fetchJson } from "@/lib/client";
import { dateTime } from "@/lib/format";
import type { Announcement } from "@/lib/types";

type FormState = { id: number | null; title: string; body: string; tone: "info" | "success" | "warning"; is_published: boolean };
const emptyForm: FormState = { id: null, title: "", body: "", tone: "info", is_published: true };

export default function AdminAnnouncementsPage() {
  const { toast } = useApp();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchJson<{ announcements: Announcement[] }>("/api/admin/announcements");
      setItems(result.announcements);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not load announcements.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!form) return;
    if (form.title.trim().length < 4 || form.body.trim().length < 8) {
      toast("Add a title and message before saving.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = JSON.stringify({ title: form.title, body: form.body, tone: form.tone, is_published: form.is_published });
      if (form.id) {
        await fetchJson(`/api/admin/announcements/${form.id}`, { method: "PATCH", body: payload });
        toast("Announcement updated.", "success");
      } else {
        await fetchJson("/api/admin/announcements", { method: "POST", body: payload });
        toast("Announcement published to the public site.", "success");
      }
      setForm(null);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save announcement.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Announcement) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeleting(item.id);
    try {
      await fetchJson(`/api/admin/announcements/${item.id}`, { method: "DELETE" });
      toast("Announcement deleted.", "success");
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not delete announcement.", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Public notices</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Announcements.</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Publish site-wide notices that appear instantly on the public homepage.</p>
        </div>
        <button onClick={() => setForm({ ...emptyForm })} className="btn btn-primary self-start"><Plus size={15} /> New announcement</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-28" />)}</div>
      ) : items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="panel flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${item.tone === "warning" ? "badge-warning" : item.tone === "success" ? "badge-success" : "badge-info"}`}>{item.tone}</span>
                      <span className={`badge ${item.is_published ? "badge-success" : ""}`}>{item.is_published ? "Live" : "Draft"}</span>
                    </div>
                    <h3 className="mt-3 text-[15px] font-bold">{item.title}</h3>
                  </div>
                  <BellRing size={17} className="shrink-0 text-[var(--muted)]" />
                </div>
                <p className="mt-2 flex-1 text-[12px] leading-relaxed text-[var(--muted)]">{item.body}</p>
                <p className="mt-4 text-[10px] text-[var(--muted)]">By {item.created_by} · {dateTime(item.updated_at)}</p>
                <div className="mt-4 flex gap-2 border-t border-[var(--border)] pt-4">
                  <button
                    onClick={() => setForm({ id: item.id, title: item.title, body: item.body, tone: item.tone, is_published: !!item.is_published })}
                    className="btn btn-secondary min-h-8 flex-1 text-[11px]"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => remove(item)} disabled={deleting === item.id} className="btn btn-danger min-h-8 px-3 text-[11px]" aria-label={`Delete ${item.title}`}>
                    {deleting === item.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="panel flex flex-col items-center px-6 py-16 text-center">
          <BellRing size={24} className="text-[var(--muted)]" />
          <p className="mt-3 text-sm font-bold">No announcements yet</p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">Create your first notice to inform traders on the homepage.</p>
          <button onClick={() => setForm({ ...emptyForm })} className="btn btn-primary mt-5 text-xs">Create announcement</button>
        </div>
      )}

      <AnimatePresence>
        {form && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/65 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setForm(null)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={form.id ? "Edit announcement" : "New announcement"}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="panel relative z-10 w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">{form.id ? "Edit announcement" : "New announcement"}</h3>
                <button onClick={() => setForm(null)} aria-label="Close" className="text-[var(--muted)] hover:text-[var(--text)]"><X size={18} /></button>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="field-label" htmlFor="notice-title">Title</label>
                  <input id="notice-title" className="input" placeholder="e.g. Weekend rate update" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <label className="field-label" htmlFor="notice-body">Message</label>
                  <textarea id="notice-body" className="textarea" placeholder="Tell traders what they need to know…" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="notice-tone">Tone</label>
                    <select id="notice-tone" className="select" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value as FormState["tone"] })}>
                      <option value="info">Information</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="notice-status">Visibility</label>
                    <select id="notice-status" className="select" value={form.is_published ? "live" : "draft"} onChange={(e) => setForm({ ...form, is_published: e.target.value === "live" })}>
                      <option value="live">Publish now</option>
                      <option value="draft">Save as draft</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setForm(null)} className="btn btn-secondary flex-1">Cancel</button>
                <button onClick={save} disabled={saving} className="btn btn-primary flex-1">
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Check size={15} /> Save notice</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
