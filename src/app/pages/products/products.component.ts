import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category, Page } from '../../models/models';
import { resolveProductImageUrl } from '../../utils/product-image.util';
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <div class="row mb-4">
          <div class="col-12">
            <h2 class="fw-bold"><i class="fas fa-pills me-2 text-primary"></i>Danh Sách Sản Phẩm</h2>
            <p class="text-muted">Khám phá các sản phẩm dược phẩm chức năng chất lượng cao</p>
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-12">
            <h5><i class="fas fa-filter me-2"></i>Lọc theo danh mục:</h5>
            <div class="row g-2 mt-2">
              <div class="col-md-2 col-6">
                <a routerLink="/products" class="category-card d-block" [class.active]="!currentMainCategoryId && !currentSubCategoryId">
                  <i class="fas fa-th-large text-primary fa-2x mb-2"></i>
                  <div class="fw-medium small">Tất cả</div>
                </a>
              </div>
              <div class="col-md-2 col-6" *ngFor="let cat of mainCategories">
                <a [routerLink]="['/products']" [queryParams]="{mainCategoryId: cat.id}"
                   class="category-card d-block" [class.active]="currentMainCategoryId === cat.id && !currentSubCategoryId">
                  <i class="fas fa-pills text-primary fa-2x mb-2"></i>
                  <div class="fw-medium small">{{ cat.name }}</div>
                </a>
              </div>
            </div>
            <div class="row g-2 mt-3" *ngIf="currentMainCategoryId && subCategories.length">
              <div class="col-12">
                <small class="text-muted">Danh mục phụ:</small>
              </div>
              <div class="col-md-2 col-6" *ngFor="let subCat of subCategories">
                <a [routerLink]="['/products']" [queryParams]="{subCategoryId: subCat.id}"
                   class="category-card d-block category-card-sub" [class.active]="currentSubCategoryId === subCat.id">
                  <i class="fas fa-layer-group text-info fa-2x mb-2"></i>
                  <div class="fw-medium small">{{ subCat.name }}</div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert-info" *ngIf="currentMainCategoryId || currentSubCategoryId">
          <i class="fas fa-info-circle me-2"></i>
          Hiện tại đang xem:
          <strong>{{ currentMainCategoryName }}</strong>
          <span *ngIf="currentSubCategoryName"> > {{ currentSubCategoryName }}</span>
          <a href="javascript:void(0)" (click)="clearFilters()" class="ms-2">
            <i class="fas fa-times"></i> Xóa lọc
          </a>
        </div>
        <div class="text-center py-5" *ngIf="loading">
          <div class="spinner-border text-primary"></div>
        </div>
        <div class="row" *ngIf="!loading && productsPage?.content?.length">
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4" *ngFor="let product of productsPage!.content">
            <div
              class="card product-card h-100 shadow-sm"
              role="button"
              tabindex="0"
              (click)="viewProduct(product.id)"
              (keydown.enter)="viewProduct(product.id)"
              (keydown.space)="viewProduct(product.id); $event.preventDefault()">
              <div class="position-relative">
                <div class="product-image">
                  <img *ngIf="product.imageUrl" [src]="getImageUrl(product.imageUrl)" [alt]="product.name">
                  <i *ngIf="!product.imageUrl" class="fas fa-pills"></i>
                </div>
                <span *ngIf="product.featured" class="badge bg-warning position-absolute top-0 end-0 m-2">
                  <i class="fas fa-star me-1"></i>Nổi bật
                </span>
              </div>
              <div class="card-body d-flex flex-column">
                <h6 class="fw-bold">{{ product.name }}</h6>
                <small class="text-muted mb-2">
                  <i class="fas fa-folder me-1"></i>
                  {{ product.mainCategoryName }}
                  <span *ngIf="product.subCategoryName"> > {{ product.subCategoryName }}</span>
                </small>
                <p class="text-muted small flex-grow-1">{{ product.description | slice:0:80 }}{{ (product.description?.length||0)>80?'...':'' }}</p>
                <div class="mt-auto">
                  <div *ngIf="product.salePrice && product.salePrice > 0">
                    <span class="text-decoration-line-through text-muted small">{{ product.price | number:'1.0-0' }} VNĐ</span>
                    <span class="h6 text-danger fw-bold d-block">{{ product.salePrice | number:'1.0-0' }} VNĐ</span>
                  </div>
                  <div *ngIf="!product.salePrice || product.salePrice <= 0">
                    <span class="h6 text-primary fw-bold">{{ product.price | number:'1.0-0' }} VNĐ</span>
                  </div>
                </div>
                <small class="text-muted mt-1" *ngIf="product.manufacturer">
                  <i class="fas fa-industry me-1"></i>{{ product.manufacturer }}
                </small>
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <small class="text-muted"><i class="fas fa-boxes me-1"></i>Còn {{ product.stockQuantity }}</small>
                  <button
                    class="btn btn-outline-primary btn-sm action-btn"
                    (click)="addToCart(product, $event)"
                    [disabled]="product.stockQuantity<=0">
                    <i class="fas fa-cart-plus me-1"></i>Thêm giỏ
                  </button>
                </div>
                <div class="mt-2" *ngIf="product.stockQuantity <= 0">
                  <span class="badge bg-danger w-100"><i class="fas fa-times me-1"></i>Hết hàng</span>
                </div>
                <div class="mt-2" *ngIf="product.stockQuantity > 0 && product.stockQuantity <= 10">
                  <span class="badge bg-warning text-dark w-100"><i class="fas fa-exclamation me-1"></i>Sắp hết</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center py-5" *ngIf="!loading && !productsPage?.content?.length">
          <i class="fas fa-box-open fa-3x text-muted mb-3 d-block"></i>
          <h4 class="text-muted">Chưa có sản phẩm nào</h4>
          <a routerLink="/" class="btn btn-primary mt-3 rounded-pill px-4"><i class="fas fa-home me-2"></i>Về trang chủ</a>
        </div>
        <nav *ngIf="productsPage && productsPage.totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" [class.disabled]="productsPage.first">
              <button class="page-link" (click)="changePage(currentPage - 1)"><i class="fas fa-chevron-left"></i></button>
            </li>
            <li class="page-item" *ngFor="let p of getPages()"
                [class.active]="p === currentPage">
              <button class="page-link" (click)="changePage(p)">{{ p + 1 }}</button>
            </li>
            <li class="page-item" [class.disabled]="productsPage.last">
              <button class="page-link" (click)="changePage(currentPage + 1)"><i class="fas fa-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>
    </app-layout>
  `
})
export class ProductsComponent implements OnInit {
  productsPage: Page<Product> | null = null;
  mainCategories: Category[] = [];
  subCategories: Category[] = [];
  currentPage = 0;
  currentMainCategoryId?: number;
  currentSubCategoryId?: number;
  currentMainCategoryName = '';
  currentSubCategoryName = '';
  loading = true;
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.categoryService.getAll().subscribe(categories => {
      this.mainCategories = categories.filter(c => c.isMainCategory);
    });
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 0;
      this.currentMainCategoryId = params['mainCategoryId'] ? +params['mainCategoryId'] : undefined;
      this.currentSubCategoryId = params['subCategoryId'] ? +params['subCategoryId'] : undefined;
      this.updateCategoryNames();
      this.updateSubCategories();
      this.loadProducts();
    });
  }
  private updateCategoryNames(): void {
    this.currentMainCategoryName = '';
    this.currentSubCategoryName = '';
    if (this.currentMainCategoryId) {
      const mainCat = this.mainCategories.find(c => c.id === this.currentMainCategoryId);
      if (mainCat) this.currentMainCategoryName = mainCat.name;
      if (this.currentSubCategoryId) {
        const subCat = mainCat?.subCategories?.find(c => c.id === this.currentSubCategoryId);
        if (subCat) this.currentSubCategoryName = subCat.name;
      }
    }
  }
  private updateSubCategories(): void {
    this.subCategories = [];
    if (this.currentMainCategoryId) {
      const mainCat = this.mainCategories.find(c => c.id === this.currentMainCategoryId);
      if (mainCat?.subCategories) {
        this.subCategories = mainCat.subCategories;
      }
    }
  }
  loadProducts(): void {
    this.loading = true;
    this.productService.getAll(
      this.currentPage,
      12,
      this.currentMainCategoryId,
      this.currentSubCategoryId
    ).subscribe({
      next: p => { this.productsPage = p; this.loading = false; },
      error: () => this.loading = false
    });
  }
  changePage(page: number): void {
    const params: any = { page };
    if (this.currentMainCategoryId) params.mainCategoryId = this.currentMainCategoryId;
    if (this.currentSubCategoryId) params.subCategoryId = this.currentSubCategoryId;
    this.router.navigate([], { queryParams: params });
  }
  clearFilters(): void {
    this.router.navigate(['/products']);
  }
  getPages(): number[] {
    if (!this.productsPage) return [];
    return Array.from({ length: this.productsPage.totalPages }, (_, i) => i);
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
