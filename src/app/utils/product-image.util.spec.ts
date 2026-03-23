import { environment } from '../../environments/environment';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from './product-image.util';

describe('resolveImageUrl', () => {
  const baseOrigin = environment.apiBaseOrigin || environment.apiUrl.replace(/\/api(?:\/v\d+)?$/, '');

  it('returns placeholder for null', () => {
    expect(resolveImageUrl(null)).toBe(PRODUCT_PLACEHOLDER_IMAGE);
  });

  it('returns placeholder for blank string', () => {
    expect(resolveImageUrl('   ')).toBe(PRODUCT_PLACEHOLDER_IMAGE);
  });

  it('resolves relative filename using /uploads prefix', () => {
    expect(resolveImageUrl('products/a.png')).toBe(`${baseOrigin}/uploads/products/a.png`);
  });

  it('resolves rooted path against apiBaseOrigin', () => {
    expect(resolveImageUrl('/uploads/products/a.png')).toBe(`${baseOrigin}/uploads/products/a.png`);
  });

  it('returns absolute https URL unchanged', () => {
    const absoluteUrl = 'https://cdn.example.com/a.png';
    expect(resolveImageUrl(absoluteUrl)).toBe(absoluteUrl);
  });
});

