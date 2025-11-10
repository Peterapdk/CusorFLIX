import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  
  // Redirect to discovery page with search query
  if (q) {
    redirect(`/discovery?q=${encodeURIComponent(q)}`);
  } else {
    redirect('/discovery');
  }
}