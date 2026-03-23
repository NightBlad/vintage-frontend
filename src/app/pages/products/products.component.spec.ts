import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductsComponent } from './products.component';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/models';

describe('ProductsComponent', () => {
  const defaultProduct: Product = {
    id: 1,
    name: 'Vitamin D3',
    productCode: 'P001',
    price: 100000,
    stockQuantity: 10,
    prescriptionRequired: false,
    active: true,
    featured: false,
    availableQuantity: 10
  };

  let mockProduct: Product = { ...defaultProduct };

  function createComponent() {
    TestBed.configureTestingModule({
      imports: [ProductsComponent, RouterTestingModule],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getAll: () => of({
              content: [mockProduct],
              totalPages: 1,
              totalElements: 1,
              number: 0,
              size: 12,
              first: true,
              last: true
            })
          }
        },
        { provide: CategoryService, useValue: { getAll: () => of([]) } },
        {
          provide: CartService,
          useValue: {
            addItem: () => of({}),
            refreshCount: () => {},
            cartCount$: of(0)
          }
        },
        { provide: AuthService, useValue: { isLoggedIn: true } },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    });

    const fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('disables add-to-cart button when product is out of stock', () => {
    mockProduct = { ...defaultProduct, availableQuantity: 0, stockQuantity: 5 };
    const fixture = createComponent();
    const button = fixture.nativeElement.querySelector('.action-btn') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });

  it('enables add-to-cart button when product has stock', () => {
    mockProduct = { ...defaultProduct, availableQuantity: 3, stockQuantity: 0 };
    const fixture = createComponent();
    const button = fixture.nativeElement.querySelector('.action-btn') as HTMLButtonElement;
    expect(button.disabled).toBeFalse();
  });
});

