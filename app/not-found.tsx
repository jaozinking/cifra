import { AlertOctagon } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
			<AlertOctagon className="w-16 h-16 text-red-500 mb-4" />
			<h1 className="text-2xl font-bold text-white mb-2">Страница не найдена</h1>
			<p className="text-zinc-400 mb-8">
				Запрашиваемая страница не существует или была удалена.
			</p>
			<Link
				href="/"
				className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
			>
				Перейти на главную
			</Link>
		</div>
	);
}
