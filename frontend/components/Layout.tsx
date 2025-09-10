import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow-soft">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold tracking-wide">Mon Portfolio</div>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/cv"
              className={`px-3 py-1.5 rounded-md transition ${
                isActive("/cv")
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              CV
            </Link>
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md transition ${
                isActive("/admin")
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer discret */}
      <footer className="py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} • Portfolio
      </footer>
    </div>
  );
}
