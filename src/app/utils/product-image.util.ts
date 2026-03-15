import { environment } from '../../environments/environment';
const API_SUFFIX_REGEX = /\/api(?:\/v\d+)?$/;
export function resolveProductImageUrl(url?: string | null): string {
  if (!url) return '';
  const raw = url.trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const baseUrl = environment.apiUrl.replace(API_SUFFIX_REGEX, '');
  // Keep existing relative paths from backend, only prepend host.
  if (raw.startsWith('/')) return `${baseUrl}${raw}`;
  if (raw.startsWith('uploads/')) return `${baseUrl}/${raw}`;
  if (raw.includes('/')) return `${baseUrl}/${raw}`;
  // Fallback for APIs that return only the image filename.
  return `${baseUrl}/uploads/products/${raw}`;
}
