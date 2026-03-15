import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Page } from '../../models/models';
import { resolveProductImageUrl } from '../../utils/product-image.util';
@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <h2 class="fw-bold mb-2"><i class="fas fa-search me-2 text-primary"></i>Kết quả tìm kiếm</h2>
        <p class="text-muted mb-4">Từ khóa: <strong>"{{ query }}"</strong> — {{ resultsPage?.totalElements || 0 }} kết quả</p>
        <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>
        <div class="alert alert-info" *ngIf="!loading && !query">
          Vui lòng nhập từ khóa để tìm kiếm sản phẩm.
        </div>
        <div class="row" *ngIf="!loading && resultsPage?.content?.length">
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4" *ngFor="let product of resultsPage!.content">
            <div
              class="card product-card h-100 shadow-sm"
              role="button"
              tabindex="0"
              (click)="viewProduct(product.id)"
              (keydown.enter)="viewProduct(product.id)"
              (keydown.space)="viewProduct(product.id); $event.preventDefault()">
              <div class="product-image">
                <img *ngIf="product.imageUrl" [src]="getImageUrl(product.imageUrl)" [alt]="product.name">
                <i *ngIf="!product.imageUrl" class="fas fa-pills"></i>
              </div>
              <div class="card-body d-flex flex-column">
                <h6 class="fw-bold">{{ product.name }}</h6>
                <p class="text-muted small flex-grow-1">{{ product.description | slice:0:80 }}{{ (product.description?.length||0)>80?'...':'' }}</p>
                <div *ngIf="product.salePrice && product.salePrice > 0">
                  <span class="text-decoration-line-through text-muted small">{{ product.price | number:'1.0-0' }} VNĐ</span>
                  <span class="h6 text-danger fw-bold d-block">{{ product.salePrice | number:'1.0-0' }} VNĐ</span>
                </div>
                <div *ngIf="!product.salePrice || product.salePrice <= 0">
                  <span class="h6 text-primary fw-bold">{{ product.price | number:'1.0-0' }} VNĐ</span>
                </div>
                <div class="d-flex justify-content-between mt-3 align-items-center">
                  <small class="text-muted"><i class="fas fa-boxes me-1"></i>Còn {{ product.stockQuantity }}</small>
                  <button class="btn btn-outline-primary btn-sm" (click)="addToCart(product, $event)" [disabled]="product.stockQuantity<=0">
                    <i class="fas fa-cart-plus me-1"></i>Thêm giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center py-5" *ngIf="!loading && query && !resultsPage?.content?.length">
          <i class="fas fa-search fa-3x text-muted mb-3 d-block"></i>
          <h4 class="text-muted">Không tìm thấy sản phẩm nào</h4>
          <a routerLink="/products" class="btn btn-primary mt-3">Xem tất cả sản phẩm</a>
        </div>
      </div>
    </app-layout>
  `
})
export class SearchResultsComponent implements OnInit {
  query = '';
  resultsPage: Page<Product> | null = null;
  loading = false;
  private searchToken = 0;
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = (params['q'] || '').trim();
      this.search();
    });
  }
  search(): void {
    const keyword = this.query.trim();
    const token = ++this.searchToken;
    if (!keyword) {
      this.loading = false;
      this.resultsPage = null;
      return;
    }
    this.loading = true;
    this.productService.search(keyword).subscribe({
      next: r => {
        if (token !== this.searchToken) return;
        this.resultsPage = r;
        this.loading = false;
      },
      error: () => {
        if (token !== this.searchToken) return;
        this.resultsPage = null;
        this.loading = false;
      }
    });
  }
  getImageUrl(url: string): string {
    return resolveProductImageUrl(url);
  }
  viewProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }
  addToCart(product: Product, event?: Event): void {
    event?.stopPropagation();
    if (!this.authService.isLoggedIn) { this.router.navigate(['/login']); return; }
    this.cartService.addItem(product.id).subscribe();
  }
}
