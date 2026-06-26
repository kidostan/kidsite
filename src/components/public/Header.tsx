import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-purple-600">
          Сказки Онлайн
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/stories" className="text-gray-600 hover:text-purple-600 transition-colors">
            Сказки
          </Link>
          <Link href="/categories" className="text-gray-600 hover:text-purple-600 transition-colors">
            Категории
          </Link>
          <Link href="/tags" className="text-gray-600 hover:text-purple-600 transition-colors">
            Теги
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <form action="/stories" method="GET" className="hidden md:block">
            <input
              type="text"
              name="q"
              placeholder="Поиск сказок..."
              className="border border-gray-300 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-purple-500 w-48"
            />
          </form>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-purple-600"
          >
            CMS
          </Link>
        </div>
      </div>
    </header>
  );
}
