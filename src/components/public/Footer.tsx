import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Link href="/" className="text-lg font-bold text-purple-600">
              Сказки Онлайн
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Бесплатные сказки для детей
            </p>
          </div>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/stories" className="hover:text-purple-600">Сказки</Link>
            <Link href="/categories" className="hover:text-purple-600">Категории</Link>
            <Link href="/tags" className="hover:text-purple-600">Теги</Link>
            <Link href="/privacy" className="hover:text-purple-600">Политика конфиденциальности</Link>
          </nav>
        </div>
        <div className="text-center text-sm text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} Сказки Онлайн
        </div>
      </div>
    </footer>
  );
}
