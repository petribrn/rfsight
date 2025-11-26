export const formatUptime = (seconds: number | undefined | null): string => {
  if (!seconds || seconds < 0) return '—';

  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && parts.length === 0) parts.push(`${s}s`);

  return parts.join(' ');
}

export const formatLatency = (ms: number | undefined | null): string => {
  if (ms === null || ms === undefined || ms < 0) return '—';

  if (ms < 1000) return `${ms} ms`;

  const sec = (ms / 1000).toFixed(1);

  return `${sec}s`;
}
