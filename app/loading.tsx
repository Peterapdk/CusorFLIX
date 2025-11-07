import HeroSkeleton from '@/components/ui/HeroSkeleton';
import CarouselSkeleton from '@/components/ui/CarouselSkeleton';

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSkeleton />
      <div className="relative z-10 -mt-32 space-y-8">
        <CarouselSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
        <CarouselSkeleton />
      </div>
    </main>
  );
}
