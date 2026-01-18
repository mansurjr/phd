import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Check if string is a YouTube URL
export function isYouTubeUrl(text: string): boolean {
  return /youtube\.com|youtu\.be/.test(text);
}

// Clean UI display name (remove incremental numbers like (1), (2) from end)
export function formatDisplayName(name: string | null | undefined): string {
  if (!name) return '';
  return name.replace(/\s*\(\d+\)$/, '');
}
