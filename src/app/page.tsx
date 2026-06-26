import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-100 to-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-900">
            Сказки для детей онлайн
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Читайте бесплатно тысячи сказок для детей любого возраста.
            Иллюстрации, аудио и удобный интерфейс.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/stories"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Читать сказки
            </Link>
            <Link
              href="/categories"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Категории
            </Link>
          </div>
        </div>
      </section>

      {/* Фичи */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Тысячи сказок</h3>
              <p className="text-gray-600">
                Коллекция сказок для детей от 3 до 12 лет. Новые сказки каждую неделю.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎧</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Аудио-сказки</h3>
              <p className="text-gray-600">
                Слушайте сказки в дороге, перед сном или во время прогулки.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Красивые картинки</h3>
              <p className="text-gray-600">
                Иллюстрации к каждой сказке. Яркие и запоминающиеся.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
