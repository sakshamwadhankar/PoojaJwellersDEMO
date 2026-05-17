"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const BUILT_IN_SUBCATEGORIES = [
  "Diamond",
  "Necklaces",
  "Pendants",
  "Earrings",
  "Bangles",
  "Rings",
  "Bracelets",
  "Other",
];

interface SubCategory {
  id: string;
  name: string;
  isBuiltIn?: boolean;
  created_at?: { seconds?: number } | null;
}

export default function CategoriesPage() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchSubcategories() {
    setLoading(true);
    try {
      let snap;
      try {
        snap = await getDocs(
          query(collection(db, "subcategories"), orderBy("created_at", "desc"))
        );
      } catch {
        snap = await getDocs(collection(db, "subcategories"));
      }
      const custom: SubCategory[] = snap.docs.map((d) => ({
        id: d.id,
        name: (d.data() as { name: string }).name,
        created_at: (d.data() as { created_at?: { seconds?: number } | null })
          .created_at,
      }));
      setSubcategories(custom);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const allCategories: SubCategory[] = [
    ...BUILT_IN_SUBCATEGORIES.map((name) => ({
      id: `builtin-${name}`,
      name,
      isBuiltIn: true,
    })),
    ...subcategories,
  ];

  // de-dupe: if a custom one duplicates a built-in, hide the built-in
  const dedupedCategories = allCategories.filter((cat, _idx, arr) => {
    if (!cat.isBuiltIn) return true;
    return !arr.some(
      (c) =>
        !c.isBuiltIn && c.name.trim().toLowerCase() === cat.name.toLowerCase()
    );
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return setError("Please enter a subcategory name.");

    const duplicate = dedupedCategories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) return setError("This subcategory already exists.");

    setError("");
    setAdding(true);
    try {
      await addDoc(collection(db, "subcategories"), {
        name: trimmed,
        created_at: serverTimestamp(),
      });
      setNewName("");
      setSuccess(`"${trimmed}" added successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      await fetchSubcategories();
      inputRef.current?.focus();
    } catch {
      setError("Failed to add subcategory. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(cat: SubCategory) {
    if (cat.isBuiltIn) return;
    setDeletingId(cat.id);
    try {
      await deleteDoc(doc(db, "subcategories", cat.id));
      setSubcategories((prev) => prev.filter((c) => c.id !== cat.id));
      setConfirmDeleteId(null);
      setSuccess(`"${cat.name}" removed.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to delete subcategory.");
    } finally {
      setDeletingId(null);
    }
  }

  const categoryToDelete = confirmDeleteId
    ? subcategories.find((c) => c.id === confirmDeleteId) ?? null
    : null;

  return (
    <div className="max-w-2xl py-6 pb-28 md:pb-6 mx-auto">
      {/* Confirm Delete Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Remove subcategory?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                &quot;{categoryToDelete.name}&quot;
              </span>
              ? This won&apos;t affect existing items tagged with it, but it
              will no longer appear as an option.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === categoryToDelete.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-red-700 disabled:opacity-50"
                onClick={() => handleDelete(categoryToDelete)}
                disabled={deletingId === categoryToDelete.id}
              >
                {deletingId === categoryToDelete.id ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Create and manage subcategories for organizing your jewellery items. These categories will be available when uploading new items in the Collections section.
        </p>
      </div>

      {/* Add New Subcategory Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
        <h2 className="text-gray-900 font-semibold mb-4">
          Add New Sub Category
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError("");
            }}
            placeholder="e.g. Anklets, Nose Pins…"
            className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          />
          <button
            type="submit"
            disabled={adding}
            className="shrink-0 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding…
              </span>
            ) : (
              "Add"
            )}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            ✓ {success}
          </p>
        )}
      </div>

      {/* Categories Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-gray-900 font-semibold">
            All Sub Categories{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({dedupedCategories.length})
            </span>
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {subcategories.length} custom
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-500 py-4">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {dedupedCategories.map((cat) => (
              <div
                key={cat.id}
                className={`group flex items-center gap-1.5 rounded-full border text-sm font-medium transition-all ${
                  cat.isBuiltIn
                    ? "border-gray-200 bg-gray-50 text-gray-600 px-3.5 py-1.5"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700 pl-3.5 pr-2 py-1.5 hover:border-indigo-300"
                }`}
              >
                <span>{cat.name}</span>
                {cat.isBuiltIn ? (
                  <span
                    className="ml-1 text-[10px] text-gray-400 font-normal leading-none"
                    title="Built-in category (cannot be deleted)"
                  >
                    default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(cat.id)}
                    disabled={deletingId === cat.id}
                    title={`Remove "${cat.name}"`}
                    className="flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:text-red-500 hover:bg-red-100 transition-all disabled:opacity-40"
                  >
                    {deletingId === cat.id ? (
                      <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-3 h-3"
                      >
                        <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-5 text-xs text-gray-400 leading-relaxed">
          <span className="font-medium text-gray-500">Default</span> categories
          are built-in and cannot be removed. Custom categories (shown in
          purple) can be deleted at any time.
        </p>
      </div>
    </div>
  );
}
