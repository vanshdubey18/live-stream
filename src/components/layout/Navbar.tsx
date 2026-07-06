export default function Navbar() {
  return (
    <nav className="bg-[#141410] border-b border-[#1c1c16] px-6 py-4 flex items-center justify-between">
      <span className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">
        MATPEAK
      </span>
      <div className="flex gap-4 items-center">
        <a href="/login" className="font-mincho text-[#a29c8c] hover:text-[#f0eadc] text-sm transition-colors">Login</a>
        <a href="/signup" className="bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[2px] text-sm px-4 py-2 rounded-sm transition-colors">JOIN NOW</a>
      </div>
    </nav>
  )
}
