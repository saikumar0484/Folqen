"use client";
import { motion } from "framer-motion";

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-xl shadow-black/20">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </motion.div>
  );
}
