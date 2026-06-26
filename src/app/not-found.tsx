import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600">404</h1>
        <p className="mt-4 text-xl text-gray-600">Страница не найдена</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
