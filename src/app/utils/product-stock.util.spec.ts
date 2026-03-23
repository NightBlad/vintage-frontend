import { resolveAvailableQuantity } from './product-stock.util';

describe('resolveAvailableQuantity', () => {
  it('uses availableQuantity when provided', () => {
	expect(resolveAvailableQuantity({ availableQuantity: 8, stockQuantity: 2 })).toBe(8);
  });

  it('falls back to stockQuantity when availableQuantity is missing', () => {
	expect(resolveAvailableQuantity({ stockQuantity: 5 } as any)).toBe(5);
  });

  it('returns 0 when values are missing or invalid', () => {
	expect(resolveAvailableQuantity({} as any)).toBe(0);
	expect(resolveAvailableQuantity({ availableQuantity: -1, stockQuantity: -5 } as any)).toBe(0);
  });
});

