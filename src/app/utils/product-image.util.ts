import { environment } from '../../environments/environment';

export const PRODUCT_PLACEHOLDER_IMAGE = 'assets/images/placeholder-product.png';

export function resolveImageUrl(raw: string | null | undefined): string {
  const normalized = raw?.trim() ?? '';
  if (!normalized) return PRODUCT_PLACEHOLDER_IMAGE;
  if (/^(https?:\/\/|data:|\/\/)/i.test(normalized)) return normalized;

  const envConfig = environment as { apiBaseOrigin?: string; apiUrl: string };
  const baseOrigin = (envConfig.apiBaseOrigin || '').trim() || envConfig.apiUrl.replace(/\/api(?:\/v\d+)?$/, '');
  if (normalized.startsWith('/')) return `${baseOrigin}${normalized}`;
  return `${baseOrigin}/uploads/${normalized}`;
}

// Backward-compatible alias for existing imports.
export function resolveProductImageUrl(url?: string | null): string {
  return resolveImageUrl(url);
}
