export default function Navbar() {
  return (
    <nav className="bg-[#0D0D0D] border-b border-[#1A1A1A] px-6 py-4 flex items-center justify-between">
      <span className="text-white font-bold text-xl tracking-tight">
        FIGHT<span className="text-[#FF3B3B]">STREAM</span>
      </span>
      <div className="flex gap-4">
        <a href="/login" className="text-[#999999] hover:text-white text-sm transition-colors">Login</a>
        <a href="/signup" className="bg-[#FF3B3B] text-white text-sm px-4 py-2 rounded hover:bg-red-700 transition-colors">Join Now</a>
      </div>
    </nav>
  )
}
