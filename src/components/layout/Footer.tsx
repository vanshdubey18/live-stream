export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#111111] px-6 py-8 text-center">
      <p className="text-[#888888] text-sm">
        &copy; {new Date().getFullYear()} FightStream. All rights reserved.
      </p>
    </footer>
  )
}
