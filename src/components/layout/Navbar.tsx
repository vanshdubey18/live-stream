export default function Navbar() {
  return (
    <nav className="bg-[#0a0a0a] border-b border-[#111111] px-6 py-4 flex items-center justify-between">
      <span className="text-white font-bold text-xl tracking-tight">
        FIGHT<span className="text-[#DC2626]">STREAM</span>
      </span>
      <div className="flex gap-4">
        <a href="/login" className="text-[#888888] hover:text-white text-sm transition-colors">Login</a>
        <a href="/signup" className="bg-[#DC2626] text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors">Join Now</a>
      </div>
    </nav>
  )
}
