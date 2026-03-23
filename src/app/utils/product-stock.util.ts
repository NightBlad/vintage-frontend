import { Product } from '../models/models';

export function toFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveAvailableQuantity(source: Pick<Product, 'availableQuantity' | 'stockQuantity'> | null | undefined): number {
  if (!source) return 0;
  const fromAvailable = toFiniteNumber(source.availableQuantity);
  if (fromAvailable !== null) return Math.max(0, fromAvailable);
  const fromStock = toFiniteNumber(source.stockQuantity);
  if (fromStock !== null) return Math.max(0, fromStock);
  return 0;
}

