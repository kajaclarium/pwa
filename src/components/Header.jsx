import "./../styles/header.css";

export default function Header() {
  return (
    <header className="bg-blue-600 shadow-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between py-3 px-4">
        
        {/* Logo */}
        <h1 className="text-white text-xl font-bold tracking-wide">
          PWA App
        </h1>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a href="/" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            Home
          </a>

          <a href="/user" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            User
          </a>

          {/* <a href="/about" className="text-white hover:bg-white/20 px-3 py-1 rounded transition">
            About
          </a> */}
        </nav>
      </div>
    </header>
  );
}
