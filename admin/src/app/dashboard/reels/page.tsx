"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface Reel {
  id: string; video_url: string; instagram_link: string; display_order: number;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Form
  const [videoUrl, setVideoUrl] = useState("");
  const [instagramLink, setInstagramLink] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [file, setFile] = useState<File | null>(null);

  async function fetchReels() {
    setLoading(true);
    try {
      const q = query(collection(db, "reels"), orderBy("display_order"));
      const snap = await getDocs(q);
      setReels(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reel, "id">) })));
    } catch {
      const snap = await getDocs(collection(db, "reels"));
      setReels(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reel, "id">) })));
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchReels(); }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!instagramLink.trim()) return setError("Instagram link is required.");
    if (uploadMode === "url" && !videoUrl.trim()) return setError("Video URL is required.");
    if (uploadMode === "file" && !file) return setError("Please select a video file.");
    setError(""); setSuccess(""); setUploading(true);

    try {
      let finalUrl = videoUrl;
      if (uploadMode === "file" && file) {
        const storageRef = ref(storage, `reels/${Date.now()}_${file.name}`);
        const task = uploadBytesResumable(storageRef, file);
        finalUrl = await new Promise<string>((resolve, reject) => {
          task.on("state_changed",
            (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
            reject,
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          );
        });
      }
      await addDoc(collection(db, "reels"), {
        video_url: finalUrl.trim(),
        instagram_link: instagramLink.trim(),
        display_order: Number(displayOrder),
      });
      setSuccess("Reel added!");
      setVideoUrl(""); setInstagramLink(""); setDisplayOrder(reels.length + 2);
      setFile(null); setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
      fetchReels();
    } catch { setError("Failed to add reel. Ensure Firebase Storage is enabled."); }
    finally { setUploading(false); }
  }

  async function handleDelete(reel: Reel) {
    if (!confirm("Delete this reel?")) return;
    try {
      if (reel.video_url.includes("firebasestorage")) {
        try { await deleteObject(ref(storage, reel.video_url)); } catch { /* ignore */ }
      }
      await deleteDoc(doc(db, "reels", reel.id));
      setReels((p) => p.filter((r) => r.id !== reel.id));
    } catch { alert("Failed to delete."); }
  }

  async function handleOrderChange(reel: Reel, newOrder: number) {
    await updateDoc(doc(db, "reels", reel.id), { display_order: newOrder });
    setReels((prev) => prev.map((r) => r.id === reel.id ? { ...r, display_order: newOrder } : r)
      .sort((a, b) => a.display_order - b.display_order));
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reels</h1>
        <p className="text-neutral-400 mt-1 text-sm">Manage video reels. Upload MP4s or paste direct video URLs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Reel Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-5">Add New Reel</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Upload mode toggle */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Video Source</label>
              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                {(["url", "file"] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setUploadMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${uploadMode === m ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "text-neutral-500 hover:text-neutral-300"}`}>
                    {m === "url" ? "🔗 Paste URL" : "📹 Upload MP4"}
                  </button>
                ))}
              </div>
            </div>

            {uploadMode === "url" ? (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Video URL (.mp4)</label>
                <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/reel.mp4"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition text-sm" />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Upload MP4 File</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-6 cursor-pointer hover:border-violet-500/40 transition-colors text-center group">
                  {file
                    ? <p className="text-violet-400 text-sm font-medium">📹 {file.name}</p>
                    : <><p className="text-neutral-500 text-sm group-hover:text-violet-400 transition-colors">Click to select video</p>
                        <p className="text-neutral-600 text-xs mt-1">MP4 recommended</p></>}
                </div>
                <input ref={fileRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={handleFileChange} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Instagram Reel Link</label>
              <input type="url" value={instagramLink} onChange={(e) => setInstagramLink(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Display Order</label>
              <input type="number" min={1} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition text-sm" />
              <p className="text-neutral-600 text-xs mt-1">Lower number = shows first</p>
            </div>

            {uploading && (
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-1"><span>Uploading…</span><span>{progress}%</span></div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
            {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">✓ {success}</p>}

            <button type="submit" disabled={uploading}
              className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? "Uploading…" : "Add Reel"}
            </button>
          </form>
        </div>

        {/* Reels List */}
        <div>
          <h2 className="text-white font-semibold mb-5">All Reels <span className="text-neutral-500 font-normal text-sm">({reels.length})</span></h2>
          {loading
            ? <div className="flex items-center gap-3 text-neutral-400"><div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />Loading…</div>
            : reels.length === 0
              ? <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-neutral-500">No reels yet.</div>
              : <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {reels.map((reel) => (
                    <div key={reel.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Video preview */}
                          <video src={reel.video_url} className="w-full h-28 rounded-lg object-cover bg-black/50 mb-3" muted preload="metadata" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-500">Order:</span>
                              <input type="number" min={1} defaultValue={reel.display_order}
                                onBlur={(e) => handleOrderChange(reel, Number(e.target.value))}
                                className="w-16 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-violet-500/60" />
                            </div>
                            <a href={reel.instagram_link} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors truncate">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                              </svg>
                              View on Instagram
                            </a>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(reel)}
                          className="p-2 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>}
        </div>
      </div>
    </div>
  );
}
