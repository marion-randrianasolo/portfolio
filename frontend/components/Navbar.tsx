import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="font-bold text-xl">Mon Portfolio</div>
        <div className="space-x-6">
          {/* Single page navigation: link directly to the CV and admin pages */}
          <Link href="/cv" className="hover:underline">
            CV
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}