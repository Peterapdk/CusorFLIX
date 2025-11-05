import Link from 'next/link';

type Props = {
  href: string;
  title: string;
  subtitle?: string;
};

export default function Card({ href, title, subtitle }: Props) {
  return (
    <Link
      href={href}
      className="block rounded border border-white/10 p-3 hover:border-white/20"
    >
      <div className="font-medium">{title}</div>
      {subtitle && <div className="text-xs text-white/60">{subtitle}</div>}
    </Link>
  );
}


