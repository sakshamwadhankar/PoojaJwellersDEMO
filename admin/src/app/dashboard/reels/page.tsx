"use client";

import { useState, useRef, ChangeEvent } from "react";
import useSWR from "swr";
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Reel {
  id: string; video_url: string; instagram_link: string; display_order: number;
}

const fetchReels = async () => {
  try {
    const q = query(collection(db, "reels"), orderBy("display_order"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reel, "id">) }));
  } catch {
    const snap = await getDocs(collection(db, "reels"));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reel, "id">) }));
  }
};

function SortableReel({ reel, handleDelete }: { reel: Reel, handleDelete: (r: Reel) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: reel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 hover:border-gray-300 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-black mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <video src={reel.video_url} className="w-full h-28 rounded-lg object-cover bg-gray-100 mb-3 border border-gray-200" muted preload="metadata" />
          <div className="space-y-1">
            <a href={reel.instagram_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-black hover:text-gray-600 transition-colors truncate">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              View on Instagram
            </a>
          </div>
        </div>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(reel);
          }}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 flex-shrink-0 mt-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const { data: reels = [], mutate, isLoading } = useSWR("reels", fetchReels);
  
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [reelToDelete, setReelToDelete] = useState<Reel | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Form
  const [instagramLink, setInstagramLink] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return; setFile(f);
  }

  function requestDelete(reel: Reel) {
    setReelToDelete(reel);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reels.length >= 6) return setError("Maximum of 6 reels allowed. Please delete an existing reel to upload a new one.");
    if (!instagramLink.trim()) return setError("Instagram link is required.");
    if (!file) return setError("Please select a video file.");
    setError(""); setSuccess(""); setUploading(true);

    try {
      const storageRef = ref(storage, `reels/${Date.now()}_${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      const finalUrl = await new Promise<string>((resolve, reject) => {
        task.on("state_changed",
          (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref))
        );
      });
      await addDoc(collection(db, "reels"), {
        video_url: finalUrl.trim(),
        instagram_link: instagramLink.trim(),
        display_order: reels.length + 1, // Automatically add to the end
      });
      setSuccess("Reel added!");
      setInstagramLink("");
      setFile(null); setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
      mutate();
    } catch { setError("Failed to add reel. Ensure Firebase Storage is enabled."); }
    finally { setUploading(false); }
  }

  async function handleDelete(reel: Reel) {
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      if (reel.video_url.includes("firebasestorage")) {
        try { await deleteObject(ref(storage, reel.video_url)); } catch { /* ignore */ }
      }
      await deleteDoc(doc(db, "reels", reel.id));
      mutate(reels.filter((r) => r.id !== reel.id), false); // optimistic update
      setSuccess("Reel deleted.");
      setReelToDelete(null);
    } catch {
      setError("Failed to delete reel.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = reels.findIndex((r) => r.id === active.id);
    const newIndex = reels.findIndex((r) => r.id === over.id);

    const newReels = arrayMove(reels, oldIndex, newIndex);
    
    // Optimistic update
    mutate(newReels, false);

    // Save all updated orders to Firebase
    try {
      await Promise.all(
        newReels.map((reel, index) => {
          return updateDoc(doc(db, "reels", reel.id), { display_order: index + 1 });
        })
      );
    } catch (e) {
      console.error("Error updating order", e);
      mutate(); // Revert on failure
    }
  }

  return (
    <div className="py-6 max-w-5xl">
      {reelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete reel?</h3>
            <p className="mt-2 text-sm text-gray-500">
              This action will permanently remove this reel from the admin panel.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setReelToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                onClick={() => handleDelete(reelToDelete)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reels</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage video reels. Upload MP4s (max 6 reels). Drag to reorder.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Reel Form */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 sm:p-6">
          <h2 className="text-gray-900 font-semibold mb-5">Add New Reel</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload MP4 File</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 cursor-pointer hover:border-black transition-colors text-center group">
                {file
                  ? <p className="text-black text-sm font-medium">📹 {file.name}</p>
                  : <><p className="text-gray-500 text-sm group-hover:text-black transition-colors">Click to select video</p>
                      <p className="text-gray-400 text-xs mt-1">MP4 recommended</p></>}
              </div>
              <input ref={fileRef} type="file" accept="video/mp4,video/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram Reel Link</label>
              <input type="url" value={instagramLink} onChange={(e) => setInstagramLink(e.target.value)}
                placeholder="https://instagram.com/reel/..."
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm" />
            </div>

            {uploading && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Uploading…</span><span>{progress}%</span></div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {error && <p className="text-black text-sm bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5">{error}</p>}
            {success && <p className="text-black text-sm bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5">✓ {success}</p>}

            <button type="submit" disabled={uploading || reels.length >= 6}
              className="w-full py-2.5 bg-black text-white font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? "Uploading…" : reels.length >= 6 ? "Limit Reached (6 Max)" : "Add Reel"}
            </button>
          </form>
        </div>

        {/* Reels List */}
        <div>
          <h2 className="text-gray-900 font-semibold mb-4">All Reels <span className="text-gray-400 font-normal text-sm">({reels.length})</span></h2>
          {isLoading
            ? <div className="flex items-center gap-3 text-gray-500"><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />Loading…</div>
            : reels.length === 0
              ? <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-10 text-center text-gray-500">No reels yet.</div>
              : <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={reels.map(r => r.id)} strategy={verticalListSortingStrategy}>
                      {reels.map((reel) => (
                        <SortableReel key={reel.id} reel={reel} handleDelete={requestDelete} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>}
        </div>
      </div>
    </div>
  );
}
