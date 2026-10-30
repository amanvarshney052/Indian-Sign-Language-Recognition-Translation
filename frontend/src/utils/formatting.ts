/**
 * Formatting utilities for timestamps, durations, and ISL token representations
 */

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 30) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatExactDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

/**
 * Pretty-print technical ISL token names (e.g. I_ME_MINE_MY -> I / Me)
 */
export function formatSignLabel(token: string): string {
  if (!token) return '';
  if (token === 'I_ME_MINE_MY') return 'I / Me / My';
  if (token === 'COLLEGE_SCHOOL') return 'College / School';
  if (token === 'LIGHT ON') return 'Light On';
  if (token === 'LIGHT OFF') return 'Light Off';
  if (token === 'DO NOT AGREE') return 'Do Not Agree';
  if (token === 'PHONE NUMBER') return 'Phone Number';

  // If uppercase snake_case or all caps
  if (token === token.toUpperCase() && token.length > 2) {
    return token
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return token;
}

export function cleanSentenceDisplay(tokens: string[]): string {
  if (!tokens || tokens.length === 0) return '';
  return tokens.map(formatSignLabel).join(' ');
}

