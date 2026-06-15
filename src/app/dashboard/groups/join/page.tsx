"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Search, Users, ArrowRight } from "lucide-react";
import { findGroupByCode, joinGroupByCode, formatAmount, type GroupPreview } from "@/lib/db";
import { useAuth } from "@/components/auth/AuthProvider";

export default function JoinGroupPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean.length < 8) {
      toast.error("Le code doit contenir 8 caractères.");
      return;
    }
    setSearching(true);
    setNotFound(false);
    setPreview(null);
    try {
      const found = await findGroupByCode(clean);
      if (found) setPreview(found);
      else setNotFound(true);
    } catch {
      toast.error("Erreur lors de la recherche.");
    } finally {
      setSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!preview) return;
    setJoining(true);
    try {
      const groupId = await joinGroupByCode(code.trim().toUpperCase(), profile.fullName);
      toast.success("Vous avez rejoint la tontine 🎉");
      router.push(`/dashboard/groups/${groupId}`);
    } catch {
      toast.error("Impossible de rejoindre la tontine.");
      setJoining(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/groups" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rejoindre une tontine</h1>
          <p className="text-sm text-gray-500">Entrez le code à 8 caractères reçu</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Code de la tontine</label>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setPreview(null); setNotFound(false); }}
            maxLength={8}
            placeholder="Ex : K7M2P9QX"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-mono text-xl font-bold tracking-[0.3em] uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={searching || code.trim().length < 8}
          className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {searching ? (
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <><Search className="w-4 h-4" /> Rechercher</>
          )}
        </button>
      </form>

      {notFound && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center text-sm text-orange-700">
          Aucune tontine ne correspond à ce code. Vérifiez et réessayez.
        </div>
      )}

      {preview && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl">{preview.emoji}</div>
            <div>
              <h2 className="font-bold text-gray-900">{preview.name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {preview.member_count}/{preview.max_members} membres · {formatAmount(preview.amount, preview.currency)}
              </p>
            </div>
          </div>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-3 rounded-xl gradient-emerald text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {joining ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>Rejoindre cette tontine <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
