'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
};

interface HeroSectionProps {
  featuredContent?: MediaItem;
}

export default function HeroSection({ featuredContent }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Sample featured content - in real app this would come from props
  const sampleContent: MediaItem = featuredContent || {
    id: 1197137,
    title: "Black Phone 2",
    overview: "Four years after escaping The Grabber, Finney Blake is struggling with his life after captivity. When his sister Gwen begins receiving calls in her dreams from the black phone and seeing disturbing visions of three boys being stalked at a winter camp, the siblings become determined to solve the mystery and confront a killer who has grown more powerful in death and more significant to them than either could imagine.",
    poster_path: "/oe2TOWykcLSGq67XPH4Bb0N1oU3.jpg",
    backdrop_path: "/oe2TOWykcLSGq67XPH4Bb0N1oU3.jpg",
    release_date: "2025-10-15",
    vote_average: 7.1,
    genre_ids: [27, 53] // Horror, Thriller
  };

  const title = sampleContent.title || sampleContent.name || "Featured Content";
  const year = (sampleContent.release_date || sampleContent.first_air_date || "").split('-')[0];
  const genres = ["Horror", "Thriller"]; // Would be mapped from genre_ids in real app

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={`https://image.tmdb.org/t/p/original${sampleContent.backdrop_path || sampleContent.poster_path}`}
          alt={`${title} backdrop`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl space-y-6">
            {/* Badge */}
            <div className="flex items-center space-x-4">
              <span className="text-cinema-orange font-bold text-lg">CINEMAOS</span>
              <span className="text-cinema-white-dim">Movie</span>
            </div>

            {/* Title */}
            <h1 className="text-hero font-bold text-foreground leading-tight">
              {title}
            </h1>

            {/* Rating and Year */}
            <div className="flex items-center space-x-4 text-foreground">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{sampleContent.vote_average.toFixed(1)}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(sampleContent.vote_average / 2) 
                          ? 'text-cinema-yellow' 
                          : 'text-cinema-gray-light'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-xl">{year}</span>
              <div className="flex space-x-2">
                {genres.map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-card rounded text-sm text-card-foreground">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-cinema-white-muted leading-relaxed max-w-xl">
              {sampleContent.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Link
                href={`/watch/movie/${sampleContent.id}`}
                className="btn-primary text-lg px-8 py-4"
              >
                Watch Now
              </Link>
              <Link
                href={`/movie/${sampleContent.id}`}
                className="btn-secondary text-lg px-8 py-4"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-cinema-white-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}