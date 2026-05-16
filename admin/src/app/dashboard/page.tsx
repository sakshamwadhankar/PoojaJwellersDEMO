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

      {/* Quick Actions / Recent Activity */}
      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="space-y-4">
          <a href="/dashboard/collections" className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">Upload Jewellery</p>
                <div className="flex text-gray-400 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">Add new products to your catalog</p>
              <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
                <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg> Today</span>
              </div>
            </div>
          </a>

          <a href="/dashboard/reviews" className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">Manage Reviews</p>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">Moderate customer testimonials</p>
            </div>
          </a>

          <a href="/dashboard/reels" className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-black flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">Add Instagram Reel</p>
              </div>
              <p className="text-xs text-gray-400 mb-2 truncate">Showcase products via video</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
