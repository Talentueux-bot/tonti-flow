import Link from "next/link";
import { Zap, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* Background blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-50 opacity-60 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-12">
          <div className="w-9 h-9 rounded-xl gradient-emerald flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Tonti<span className="text-emerald-600">Flow</span>
          </span>
        </Link>

        {/* 404 illustration */}
        <div className="mb-8">
          <p className="text-[120px] font-bold leading-none bg-gradient-to-br from-emerald-400 to-teal-600 bg-clip-text text-transparent select-none">
            404
          </p>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Retournez à l&apos;accueil pour continuer.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white gradient-emerald hover:opacity-90 transition-opacity shadow-lg shadow-emerald-200"
          >
            <Home className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
