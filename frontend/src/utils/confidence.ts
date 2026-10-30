/**
 * Confidence formatting and threshold evaluation (Backend threshold: 0.65)
 */

export const BACKEND_CONFIDENCE_THRESHOLD = 0.65;

export function formatConfidencePercent(confidence: number): string {
  const normalized = Math.min(Math.max(confidence, 0), 1);
  return `${Math.round(normalized * 100)}%`;
}

export function isConfidenceAccepted(confidence: number): boolean {
  return confidence >= BACKEND_CONFIDENCE_THRESHOLD;
}

export interface ConfidenceColorSet {
  bg: string;
  text: string;
  bar: string;
  border: string;
}

export function getConfidenceStyle(confidence: number): ConfidenceColorSet {
  if (confidence >= 0.85) {
    return {
      bg: 'bg-[#E4F2D8]',
      text: 'text-[#21431A]',
      bar: 'bg-[#658241]',
      border: 'border-[#BFD3A3]',
    };
  }
  if (confidence >= BACKEND_CONFIDENCE_THRESHOLD) {
    return {
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#78350F]',
      bar: 'bg-[#D97706]',
      border: 'border-[#FDE68A]',
    };
  }
  return {
    bg: 'bg-[#FEE2E2]',
    text: 'text-[#991B1B]',
    bar: 'bg-[#DC2626]',
    border: 'border-[#FECACA]',
  };
}

