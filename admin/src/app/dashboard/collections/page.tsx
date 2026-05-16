"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface JewelleryItem {
  id: string; caption: string; category: string; material?: string;
  image_url: string; is_top_6: boolean;
}

export default function CollectionsPage() {
  const [items, setItems] = useState<JewelleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Diamond");
  const [material, setMaterial] = useState("Gold");
  const [isTop6, setIsTop6] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("Diamond");
  const [editMaterial, setEditMaterial] = useState("Gold");
  const [editIsTop6, setEditIsTop6] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<JewelleryItem | null>(null);

  function startEdit(item: JewelleryItem) {
    setEditingId(item.id);
    setEditCaption(item.caption);
    setEditCategory(item.category);
    setEditMaterial(item.material || "Gold");
    setEditIsTop6(item.is_top_6);
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    try {
      await updateDoc(doc(db, "collections", editingId), {
        caption: editCaption.trim(),
        category: editCategory,
        material: editMaterial,
        is_top_6: editIsTop6,
      });
      setItems(items.map(i => i.id === editingId ? { ...i, caption: editCaption.trim(), category: editCategory, material: editMaterial, is_top_6: editIsTop6 } : i));
      setEditingId(null);
    } catch {
      alert("Failed to update item.");
    }
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const q = query(collection(db, "collections"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JewelleryItem, "id">) })));
    } catch {
      const snap = await getDocs(collection(db, "collections"));
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JewelleryItem, "id">) })));
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchItems(); }, []);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please select an image.");
    if (!caption.trim()) return setError("Caption is required.");
    setError(""); setSuccess(""); setUploading(true);
    try {
      const storageRef = ref(storage, `collections/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      const downloadURL = await new Promise<string>((resolve, reject) => {
        uploadTask.on("state_changed",
          (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
          reject,
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
        );
      });
      await addDoc(collection(db, "collections"), {
        caption: caption.trim(), category, material, image_url: downloadURL,
        is_top_6: isTop6, created_at: serverTimestamp(),
      });
      setSuccess("Item added successfully!");
      setCaption(""); setCategory("Diamond"); setMaterial("Gold"); setIsTop6(false);
      setFile(null); setPreview(null); setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
      fetchItems();
    } catch { setError("Upload failed. Ensure Firebase Storage is enabled."); }
    finally { setUploading(false); }
  }

  function requestDelete(item: JewelleryItem) {
    setItemToDelete(item);
  }

  async function handleDelete(item: JewelleryItem) {
    setDeleting(true);
    setError("");
    setSuccess("");
    try {
      try { await deleteObject(ref(storage, item.image_url)); } catch { /* ignore */ }
      await deleteDoc(doc(db, "collections", item.id));
      setItems((p) => p.filter((i) => i.id !== item.id));
      setItemToDelete(null);
      setSuccess("Item deleted successfully!");
    } catch {
      setError("Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="py-6 max-w-6xl">
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete item?</h3>
            <p className="mt-2 text-sm text-gray-500">
              This will permanently remove "{itemToDelete.caption}" from the collection.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setItemToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                onClick={() => handleDelete(itemToDelete)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
        <p className="text-gray-500 mt-1 text-sm">Upload jewellery photos and manage the homepage showcase.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-gray-900 font-semibold mb-5">Add New Item</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jewellery Photo</label>
              <div onClick={() => fileRef.current?.click()}
                className="relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-black transition-colors group bg-gray-50">
                {preview
                  ? <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
                  : <div className="flex flex-col items-center justify-center h-40 text-gray-400 group-hover:text-black transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Click to upload image</span>
                      <span className="text-xs mt-1 text-gray-500">JPG, PNG, WEBP</span>
                    </div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Caption</label>
              <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Heritage Polki Choker"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Main Category (Material)</label>
              <div className="flex flex-wrap gap-2">
                {["Gold", "Silver", "Platinum"].map((mat) => (
                  <button key={mat} type="button" onClick={() => setMaterial(mat)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      material === mat
                        ? "bg-gray-100 border-gray-300 text-black"
                        : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"}`}>
                    {mat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub Category</label>
              <div className="flex flex-wrap gap-2">
                {["Diamond", "Necklaces", "Pendants", "Earrings", "Bangles", "Rings", "Bracelets", "Other"].map((cat) => (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      category === cat
                        ? "bg-gray-100 border-gray-300 text-black"
                        : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Feature on Homepage</p>
                <p className="text-xs text-gray-500">Show in the Top 6 showcase</p>
              </div>
              <button type="button" onClick={() => setIsTop6(!isTop6)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isTop6 ? "bg-black" : "bg-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isTop6 ? "translate-x-6" : "translate-x-1"}`} />
              </button>
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
            <button type="submit" disabled={uploading}
              className="w-full py-2.5 bg-black text-white font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? "Uploading…" : "Add to Collection"}
            </button>
          </form>
        </div>

        {/* Items List */}
        <div>
          <h2 className="text-gray-900 font-semibold mb-4">All Items <span className="text-gray-400 font-normal text-sm">({items.length})</span></h2>
          {loading
            ? <div className="flex items-center gap-3 text-gray-500"><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />Loading…</div>
            : items.length === 0
              ? <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center text-gray-500 shadow-sm">No items yet. Add your first piece!</div>
              : <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-colors shadow-sm group">
                      <img src={item.image_url} alt={item.caption}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-50"
                        onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' fill='%23e5e7eb'%3E%3Crect width='56' height='56'/%3E%3C/svg%3E"; }} />
                      {editingId === item.id ? (
                        <div className="flex-1 min-w-0 space-y-2">
                          <input type="text" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black text-gray-900 bg-white" />
                          <div className="flex flex-wrap items-center gap-3">
                            <select value={editMaterial} onChange={(e) => setEditMaterial(e.target.value)} className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black text-gray-900 bg-white">
                              {["Gold", "Silver", "Platinum"].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black text-gray-900 bg-white">
                              {["Diamond", "Necklaces", "Pendants", "Earrings", "Bangles", "Rings", "Bracelets", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                              <input type="checkbox" checked={editIsTop6} onChange={(e) => setEditIsTop6(e.target.checked)} className="rounded text-black focus:ring-black" /> Top 6
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium truncate">{item.caption}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {(() => {
                              const mat = item.material || (["Gold", "Silver", "Platinum"].includes(item.category) ? item.category : "Gold");
                              return (
                                <>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">{mat}</span>
                                  {item.category && item.category !== mat && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-800 border border-slate-200">{item.category}</span>
                                  )}
                                </>
                              );
                            })()}
                            {item.is_top_6 && <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white font-medium">Top 6</span>}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {editingId === item.id ? (
                          <>
                            <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Save">✓</button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg" title="Cancel">✕</button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => startEdit(item)} className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => requestDelete(item)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>}
        </div>
      </div>
    </div>
  );
}
