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
    { label: "Collections", value: counts.collections, sub: "Jewellery items", icon: "🖼️", href: "/dashboard/collections", color: "amber" },
    { label: "Reviews", value: counts.reviews, sub: "Customer reviews", icon: "⭐", href: "/dashboard/reviews", color: "emerald" },
    { label: "Reels", value: counts.reels, sub: "Video reels", icon: "🎬", href: "/dashboard/reels", color: "violet" },
  ];

  const colorMap: Record<string, string> = {
    amber: "text-amber-400",
    emerald: "text-emerald-400",
    violet: "text-violet-400",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400 mt-1">
          Welcome back, <span className="text-amber-400">{user?.email}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <a key={stat.label} href={stat.href}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className={`text-3xl font-bold mb-0.5 ${colorMap[stat.color]}`}>{stat.value}</div>
            <div className="text-neutral-300 text-sm font-medium">{stat.label}</div>
            <div className="text-neutral-600 text-xs mt-0.5">{stat.sub}</div>
          </a>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/dashboard/collections" className="bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150">
            + Upload Jewellery Photo →
          </a>
          <a href="/dashboard/reviews" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150">
            ✓ Manage Reviews →
          </a>
          <a href="/dashboard/reels" className="bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150">
            + Add Instagram Reel →
          </a>
        </div>
      </div>
    </div>
  );
}
