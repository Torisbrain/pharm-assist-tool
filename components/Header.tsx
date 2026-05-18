import Link from 'next/link'

const links = [
  { href: '/', label: 'Verify Drug' },
  { href: '/interactions', label: 'Interactions' },
  { href: '/pharmacies', label: 'Pharmacies' },
]

export default function Header() {
  return (
    <header className="border-b border-green-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-green-800">
          PharmVerify <span className="text-green-600">NG</span>
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-green-800 hover:text-green-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
