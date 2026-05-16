"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ collections: "—", reviews: "—", reels: "—" });

  useEffect(() => {
    async function loadCounts() {
      try {
        const [c, r, rl] = await Promise.all([
          getCountFromServer(collection(db, "collections")),
          getCountFromServer(collection(db, "reviews")),
          getCountFromServer(collection(db, "reels")),
        ]);
        setCounts({
          collections: String(c.data().count),
          reviews: String(r.data().count),
          reels: String(rl.data().count),
        });
      } catch { /* ignore */ }
    }
    loadCounts();
  }, []);

  const stats = [
    { label: "Jewellery Items", value: counts.collections, icon: "↗" },
    { label: "Customer Reviews", value: counts.reviews, icon: "↗" },
    { label: "Video Reels", value: counts.reels, icon: "↗" },
  ];

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-32 relative group hover:shadow-md transition-all">
            <div className="mt-auto text-3xl sm:text-4xl font-semibold text-gray-900">{stat.value}</div>
            <div className="text-xs font-medium text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
