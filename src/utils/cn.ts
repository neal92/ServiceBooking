import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Combine et fusionne des noms de classes CSS avec une gestion intelligente des classes Tailwind
 * @param inputs - Classes CSS à combiner
 * @returns Classes CSS combinées et optimisées
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}

