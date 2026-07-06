export default function Footer() {
  return (
    <footer className="bg-[#141410] border-t border-[#1c1c16] px-6 py-8 text-center">
      <p className="text-[#a29c8c] text-sm">
        &copy; {new Date().getFullYear()} FightStream. All rights reserved.
      </p>
    </footer>
  )
}
