import { toast } from 'sonner';

export function buildInviteUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

export async function copyInvite(url: string, label = 'Invite link') {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(`${label} copied`, { description: url });
  } catch {
    toast.error('Could not copy. Long-press to copy:', { description: url });
  }
}

export function generateInviteCode(): string {
  return Math.random().toString(36).slice(2, 10);
}
