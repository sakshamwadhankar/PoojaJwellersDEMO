"use client";

import { useState, useEffect } from "react";
import {
  collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, addDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Review {
  id: string; customer_name: string; rating: number;
  review_text: string; is_visible: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${i <= rating ? "text-amber-400" : "text-neutral-700"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newText.trim()) return setError("Name and Review Text are required.");
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        customer_name: newName.trim(),
        rating: newRating,
        review_text: newText.trim(),
        is_visible: true
      });
      setSuccess("Review added successfully!");
      setNewName(""); setNewRating(5); setNewText("");
      fetchReviews();
    } catch {
      setError("Failed to add review.");
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchReviews() {
    setLoading(true);
    try {
      const q = query(collection(db, "reviews"), orderBy("customer_name"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) })));
    } catch {
      const snap = await getDocs(collection(db, "reviews"));
      setReviews(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, "id">) })));
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchReviews(); }, []);

  async function toggleVisibility(review: Review) {
    const newVal = !review.is_visible;
    await updateDoc(doc(db, "reviews", review.id), { is_visible: newVal });
    setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, is_visible: newVal } : r));
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete review by "${name}"?`)) return;
    await deleteDoc(doc(db, "reviews", id));
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = reviews.filter((r) =>
    filter === "all" ? true : filter === "visible" ? r.is_visible : !r.is_visible
  );

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div className="py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage customer reviews. Toggle visibility without deleting.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Reviews", value: reviews.length, color: "text-gray-900" },
          { label: "Avg Rating", value: avgRating, color: "text-black" },
          { label: "Hidden", value: reviews.filter((r) => !r.is_visible).length, color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 sm:p-5 text-center">
            <div className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 sm:p-6 sticky top-6">
            <h2 className="text-gray-900 font-semibold mb-5">Add New Review</h2>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating (1-5)</label>
                <div className="flex gap-2 items-center">
                  <input type="range" min="1" max="5" value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="w-full" />
                  <span className="font-semibold text-gray-900 w-6 text-center">{newRating}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Text</label>
                <textarea value={newText} onChange={(e) => setNewText(e.target.value)}
                  placeholder="Great service and lovely designs!"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition text-sm resize-none" />
              </div>
              {error && <p className="text-black text-sm bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5">{error}</p>}
              {success && <p className="text-black text-sm bg-gray-100 border border-gray-300 rounded-xl px-4 py-2.5">✓ {success}</p>}
              <button type="submit" disabled={submitting}
                className="w-full py-2.5 bg-black text-white font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? "Adding..." : "Add Review"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-2">
          {/* Filter tabs */}
          <div className="flex gap-2 mb-5">
            {(["all", "visible", "hidden"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f ? "bg-gray-100 text-black border border-gray-300" : "text-gray-500 hover:text-gray-700 border border-transparent"}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {loading
            ? <div className="flex items-center gap-3 text-gray-500"><div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />Loading…</div>
            : filtered.length === 0
              ? <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-10 text-center text-gray-500">No reviews found.</div>
              : <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                  {filtered.map((r) => (
                    <div key={r.id} className={`bg-white border shadow-sm rounded-2xl p-4 sm:p-5 transition-all ${r.is_visible ? "border-gray-200" : "border-gray-300 bg-gray-50 opacity-80"}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 text-black text-sm font-bold flex items-center justify-center flex-shrink-0">
                              {r.customer_name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium text-sm">{r.customer_name}</p>
                              <StarRating rating={r.rating} />
                            </div>
                            {!r.is_visible && (
                              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-black font-medium">Hidden</span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{r.review_text}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Toggle visibility */}
                          <button onClick={() => toggleVisibility(r)} title={r.is_visible ? "Hide review" : "Show review"}
                            className={`p-2 rounded-lg transition-all ${r.is_visible ? "text-black bg-gray-100 hover:bg-gray-200" : "text-gray-400 bg-gray-50 hover:bg-gray-100"}`}>
                            {r.is_visible
                              ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDelete(r.id, r.customer_name)}
                            className="p-2 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
        </div>
      </div>
    </div>
  );
}
