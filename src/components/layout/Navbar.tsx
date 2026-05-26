export default function Navbar() {
  return (
    <nav className="bg-[#0D0D0D] border-b border-[#1A1A1A] px-6 py-4 flex items-center justify-between">
      <span className="font-bebas text-xl text-white tracking-[1px]">
        MATPEAK
      </span>
      <div className="flex gap-4 items-center">
        <a href="/login" className="font-inter text-[#999999] hover:text-white text-sm transition-colors">Login</a>
        <a href="/signup" className="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] text-sm px-4 py-2 rounded-sm transition-colors">JOIN NOW</a>
      </div>
    </nav>
  )
}
