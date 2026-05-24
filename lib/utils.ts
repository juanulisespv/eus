import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina múltiples nombres de clase condicionales y resuelve conflictos de TailwindCSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default cn;
