import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models/models';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from '../../utils/product-image.util';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <!-- Hero Section -->
      <section class="hero-section text-white py-5">
        <div class="container">
          <div class="row align-items-center py-5">
            <div class="col-lg-6 fade-in-up">
              <h1 class="display-4 fw-bold mb-4">
                <i class="fas fa-heartbeat text-warning me-3"></i>Vintage Pharmacy
              </h1>
              <p class="lead mb-4">Chuyên cung cấp dược phẩm chức năng chất lượng cao, đảm bảo an toàn và hiệu quả cho sức khỏe của bạn và gia đình.</p>
              <div class="d-flex flex-wrap gap-3">
                <a routerLink="/products" class="btn btn-warning btn-lg rounded-pill px-4">
                  <i class="fas fa-pills me-2"></i>Xem sản phẩm
                </a>
                <a routerLink="/about" class="btn btn-outline-light btn-lg rounded-pill px-4">
                  <i class="fas fa-info-circle me-2"></i>Tìm hiểu thêm
                </a>
              </div>
            </div>
            <div class="col-lg-6 text-center">
              <i class="fas fa-clinic-medical text-warning" style="font-size:15rem;opacity:0.15"></i>
            </div>
          </div>
        </div>
      </section>
      <!-- Features -->
      <section class="py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <h2 class="display-5 fw-bold text-primary"><i class="fas fa-star me-2"></i>Tại sao chọn chúng tôi?</h2>
            <p class="lead text-muted">Cam kết mang đến những sản phẩm tốt nhất cho sức khỏe của bạn</p>
          </div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 text-center shadow-sm">
                <div class="card-body p-4">
                  <i class="fas fa-shield-alt fa-3x text-success mb-3"></i>
                  <h5 class="fw-bold">Chất lượng đảm bảo</h5>
                  <p class="text-muted">Tất cả sản phẩm được kiểm định chất lượng nghiêm ngặt từ các nhà sản xuất uy tín.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 text-center shadow-sm">
                <div class="card-body p-4">
                  <i class="fas fa-shipping-fast fa-3x text-primary mb-3"></i>
                  <h5 class="fw-bold">Giao hàng nhanh chóng</h5>
                  <p class="text-muted">Đội ngũ giao hàng chuyên nghiệp, cam kết giao hàng trong 24h tại nội thành.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card h-100 text-center shadow-sm">
                <div class="card-body p-4">
                  <i class="fas fa-user-md fa-3x text-info mb-3"></i>
                  <h5 class="fw-bold">Tư vấn chuyên nghiệp</h5>
                  <p class="text-muted">Đội ngũ dược sĩ giàu kinh nghiệm sẵn sàng tư vấn và hỗ trợ 24/7.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- Featured Products -->
      <section class="py-5 bg-light">
        <div class="container">
          <div class="row text-center mb-5">
            <h2 class="display-5 fw-bold text-primary"><i class="fas fa-fire me-2"></i>Sản phẩm nổi bật</h2>
            <p class="lead text-muted">Những sản phẩm được khách hàng tin tưởng và lựa chọn nhiều nhất</p>
          </div>
          <div class="row g-4" *ngIf="featuredProducts.length > 0">
            <div class="col-lg-3 col-md-6" *ngFor="let product of featuredProducts">
              <div
                class="card product-card h-100 shadow-sm"
                role="button"
                tabindex="0"
                (click)="viewProduct(product.id)"
                (keydown.enter)="viewProduct(product.id)"
                (keydown.space)="viewProduct(product.id); $event.preventDefault()">
                <div class="position-relative">
                  <div class="product-image">
                    <img [src]="getImageUrl(product.imageUrl)" [alt]="product.name" (error)="onImageError($event)">
                  </div>
                  <span class="badge bg-warning position-absolute top-0 end-0 m-2">
                    <i class="fas fa-star me-1"></i>Nổi bật
                  </span>
                </div>
                <div class="card-body d-flex flex-column">
                  <h6 class="fw-bold">{{ product.name }}</h6>
                  <p class="text-muted small flex-grow-1">{{ product.description | slice:0:80 }}{{ (product.description?.length || 0) > 80 ? '...' : '' }}</p>
                  <div class="mt-auto">
                    <div *ngIf="product.salePrice && product.salePrice > 0">
                      <span class="text-decoration-line-through text-muted small">{{ product.price | number:'1.0-0' }} VNĐ</span>
                      <span class="h6 text-danger fw-bold d-block">{{ product.salePrice | number:'1.0-0' }} VNĐ</span>
                    </div>
                    <div *ngIf="!product.salePrice || product.salePrice <= 0">
                      <span class="h6 text-primary fw-bold">{{ product.price | number:'1.0-0' }} VNĐ</span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-3">
                    <small class="text-muted"><i class="fas fa-boxes me-1"></i>Còn {{ product.stockQuantity }}</small>
                    <button
                      class="btn btn-outline-primary btn-sm action-btn"
                      (click)="addToCart(product, $event)"
                      [disabled]="product.stockQuantity <= 0">
                      <i class="fas fa-cart-plus me-1"></i>Thêm giỏ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-4">
            <a routerLink="/products" class="btn btn-primary btn-lg rounded-pill px-5">
              <i class="fas fa-th me-2"></i>Xem tất cả sản phẩm
            </a>
          </div>
        </div>
      </section>
      <!-- Categories -->
      <section class="py-5" *ngIf="categories.length > 0">
        <div class="container">
          <div class="row text-center mb-5">
            <h2 class="display-5 fw-bold text-primary"><i class="fas fa-th-large me-2"></i>Danh mục sản phẩm</h2>
          </div>
          <div class="row g-3 justify-content-center">
            <div class="col-md-2 col-6" *ngFor="let cat of categories">
              <a [routerLink]="['/products']" [queryParams]="{mainCategoryId: cat.id}" class="category-card d-block">
                <i class="fas fa-pills text-primary fa-2x mb-2"></i>
                <div class="fw-medium">{{ cat.name }}</div>
              </a>
            </div>
          </div>
        </div>
      </section>
    </app-layout>
  `
})
export class HomeComponent implements OnInit {
  readonly placeholderImage = PRODUCT_PLACEHOLDER_IMAGE;
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.productService.getFeatured().subscribe(p => this.featuredProducts = p);
    this.categoryService.getAll().subscribe(c => this.categories = c);
  }
  getImageUrl(url: string | null | undefined): string {
    return resolveImageUrl(url);
  }
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.getAttribute('src') === this.placeholderImage) return;
    img.src = this.placeholderImage;
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
