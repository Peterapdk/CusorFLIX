import Link from 'next/link';
import type { Route } from 'next';

type Props = {
  href: string | Route;
  title: string;
  subtitle?: string;
};

export default function Card({ href, title, subtitle }: Props) {
  return (
    <Link
      href={href as Route}
      className="block rounded border border-white/10 p-3 hover:border-white/20 transition-colors"
    >
      <div className="font-medium">{title}</div>
      {subtitle && <div className="text-xs text-white/60">{subtitle}</div>}
    </Link>
  );
}
