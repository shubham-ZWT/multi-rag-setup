import Link from "next/link";

export default function Navbar() {
  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];
  return (
    <nav className="fixed top-0 inset-x-0 z-50 text-white">
      <div className="max-w-7xl mx-auto mt-4 px-4 py-3 rounded-full flex bg-white/5 backdrop-blur-2xl justify-between items-center border border-white/10 shadow-lg shadow-black/10">
        <div className="text-xl font-bold">
          <Link href="/">Botify</Link>
        </div>
        <div className="flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-blue-400 transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
