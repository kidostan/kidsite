import { LogoutButton } from "@/components/admin/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/admin" className="font-bold text-purple-600">
              CMS
            </a>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <a href="/admin" className="text-gray-600 hover:text-purple-600">
                Дашборд
              </a>
              <a href="/admin/stories" className="text-gray-600 hover:text-purple-600">
                Сказки
              </a>
              <a href="/admin/categories" className="text-gray-600 hover:text-purple-600">
                Категории
              </a>
              <a href="/admin/tags" className="text-gray-600 hover:text-purple-600">
                Теги
              </a>
              <a href="/admin/analytics" className="text-gray-600 hover:text-purple-600">
                Аналитика
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-purple-600">
              Сайт &rarr;
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
