import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</h1>
      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Page not found</p>
      <Link href="/" className="mt-6 text-sm text-blue-600 hover:underline dark:text-blue-400">
        Go home
      </Link>
    </div>
  );
}
