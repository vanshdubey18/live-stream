export default function Footer() {
  return (
    <footer className="bg-[#0D0D0D] border-t border-[#1A1A1A] px-6 py-8 text-center">
      <p className="text-[#999999] text-sm">
        &copy; {new Date().getFullYear()} FightStream. All rights reserved.
      </p>
    </footer>
  )
}
