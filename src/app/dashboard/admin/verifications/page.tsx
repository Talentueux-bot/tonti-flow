"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ShieldAlert, FileText, CheckCircle2, Clock, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminEmail } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  country: string | null;
  phone: string | null;
  id_document_type: string | null;
  verification_status: string | null;
  verification_submitted_at: string | null;
  documentUrl: string | null;
};

const DOC_LABEL: Record<string, string> = {
  cni: "Carte d'identité",
  passport: "Passeport",
  permis: "Permis de conduire",
};

export default function AdminVerificationsPage() {
  const { profile } = useAuth();
  const admin = isAdminEmail(profile.email);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unlocked = typeof window !== "undefined" && sessionStorage.getItem("tontiflow_admin_ok") === "1";

  const load = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/verifications", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setError(j.error || "Erreur de chargement."); return; }
      setItems(j.items ?? []);
      setError("");
    } catch {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!admin || !unlocked) { setLoading(false); return; }
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [admin, unlocked, load]);

  if (!admin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Accès réservé</h1>
        <Link href="/dashboard" className="inline-block px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <p className="text-sm text-gray-500">Déverrouillez d&apos;abord l&apos;espace administrateur.</p>
        <Link href="/dashboard/admin" className="inline-block px-5 py-2.5 rounded-xl gradient-emerald text-white text-sm font-semibold">
          Aller à l&apos;espace admin
        </Link>
      </div>
    );
  }

  const isApproved = (it: Item) => {
    if (it.verification_status === "approved") return true;
    if (it.verification_submitted_at) {
      return Date.now() - new Date(it.verification_submitted_at).getTime() >= 5 * 60 * 1000;
    }
    return false;
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vérifications des comptes</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Pièces d&apos;identité fournies par les utilisateurs. Validation automatique après 5 min.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><span className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-sm text-gray-400">
          Aucune vérification soumise pour l&apos;instant.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {items.map((it) => {
            const approved = isApproved(it);
            return (
              <div key={it.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {(it.first_name || "") + " " + (it.last_name || "") || "Sans nom"}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      approved ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      {approved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {approved ? "Validé" : "En cours"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {it.date_of_birth ? `Né(e) le ${new Date(it.date_of_birth).toLocaleDateString("fr-FR")}` : "Date de naissance —"}
                    {it.country ? ` · ${it.country}` : ""}
                    {it.phone ? ` · ${it.phone}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {it.id_document_type ? DOC_LABEL[it.id_document_type] ?? it.id_document_type : "Document —"}
                    {it.verification_submitted_at ? ` · soumis le ${new Date(it.verification_submitted_at).toLocaleString("fr-FR")}` : ""}
                  </p>
                </div>
                {it.documentUrl ? (
                  <a
                    href={it.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
                  >
                    <FileText className="w-4 h-4" /> Voir la pièce <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-gray-400">Aucune pièce</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
