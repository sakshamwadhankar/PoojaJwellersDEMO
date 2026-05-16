"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { getMetadata, listAll, ref as storageRef } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

interface StorageSummary {
  collectionsBytes: number;
  collectionsFiles: number;
  reelsBytes: number;
  reelsFiles: number;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function getFolderUsage(path: string): Promise<{ bytes: number; files: number }> {
  const folder = storageRef(storage, path);
  const listing = await listAll(folder);
  const nestedUsage = await Promise.all(listing.prefixes.map(async (prefix) => getFolderUsage(prefix.fullPath)));
  const metadata = await Promise.all(listing.items.map(async (item) => getMetadata(item)));

  return {
    bytes:
      metadata.reduce((sum, item) => sum + (item.size || 0), 0) +
      nestedUsage.reduce((sum, item) => sum + item.bytes, 0),
    files: metadata.length + nestedUsage.reduce((sum, item) => sum + item.files, 0),
  };
}

export default function DashboardPage() {
  const [counts, setCounts] = useState({ collections: "-", reviews: "-", reels: "-" });
  const [storageSummary, setStorageSummary] = useState<StorageSummary | null>(null);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [collectionsCount, reviewsCount, reelsCount, collectionsUsage, reelsUsage] = await Promise.all([
          getCountFromServer(collection(db, "collections")),
          getCountFromServer(collection(db, "reviews")),
          getCountFromServer(collection(db, "reels")),
          getFolderUsage("collections").catch(() => ({ bytes: 0, files: 0 })),
          getFolderUsage("reels").catch(() => ({ bytes: 0, files: 0 })),
        ]);

        setCounts({
          collections: String(collectionsCount.data().count),
          reviews: String(reviewsCount.data().count),
          reels: String(reelsCount.data().count),
        });
        setStorageSummary({
          collectionsBytes: collectionsUsage.bytes,
          collectionsFiles: collectionsUsage.files,
          reelsBytes: reelsUsage.bytes,
          reelsFiles: reelsUsage.files,
        });
      } catch {
        setStorageError("Unable to load Firebase usage right now.");
      }
    }

    loadDashboardData();
  }, []);

  const stats = [
    { label: "Jewellery Items", value: counts.collections },
    { label: "Customer Reviews", value: counts.reviews },
    { label: "Video Reels", value: counts.reels },
  ];

  const totalStorageBytes = (storageSummary?.collectionsBytes || 0) + (storageSummary?.reelsBytes || 0);
  const usageCards = [
    {
      label: "Catalog Storage",
      value: storageSummary ? formatBytes(storageSummary.collectionsBytes) : "-",
      meta: storageSummary ? `${storageSummary.collectionsFiles} file${storageSummary.collectionsFiles === 1 ? "" : "s"}` : "Loading...",
    },
    {
      label: "Reels Storage",
      value: storageSummary ? formatBytes(storageSummary.reelsBytes) : "-",
      meta: storageSummary ? `${storageSummary.reelsFiles} file${storageSummary.reelsFiles === 1 ? "" : "s"}` : "Loading...",
    },
  ];

  return (
    <div className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Dashboard</h2>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex h-32 flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="mt-auto text-3xl font-semibold text-gray-900 sm:text-4xl">{stat.value}</div>
            <div className="mt-1 text-xs font-medium text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <section className="rounded-[2rem] border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Firebase Usage</h3>
            <p className="mt-1 text-xs text-gray-500">Storage used by catalog images and reel videos.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-right">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">Total</p>
            <p className="mt-1 text-xl font-semibold text-black sm:text-2xl">
              {storageSummary ? formatBytes(totalStorageBytes) : "..."}
            </p>
          </div>
        </div>

        {storageError ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            {storageError}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {usageCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
                <p className="mt-1 text-xs text-gray-500">{card.meta}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
