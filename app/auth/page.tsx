'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Auth from '@/components/Auth';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.push('/dashboard');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
					<div className="text-zinc-500 font-mono text-sm animate-pulse">Загрузка...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
			<Auth
				onSuccess={() => {
					router.push('/dashboard');
				}}
			/>
		</div>
	);
}
