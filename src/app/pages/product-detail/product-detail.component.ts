import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/models';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from '../../utils/product-image.util';
import { InventoryService } from '../../services/inventory.service';
import { resolveAvailableQuantity } from '../../utils/product-stock.util';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5" *ngIf="product">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/">Trang chủ</a></li>
            <li class="breadcrumb-item"><a routerLink="/products">Sản phẩm</a></li>
            <li class="breadcrumb-item" *ngIf="product.mainCategoryId">
              <a [routerLink]="['/products']" [queryParams]="{mainCategoryId: product.mainCategoryId}">{{ product.mainCategoryName }}</a>
            </li>
            <li class="breadcrumb-item" *ngIf="product.subCategoryId">
              <a [routerLink]="['/products']" [queryParams]="{subCategoryId: product.subCategoryId}">{{ product.subCategoryName }}</a>
            </li>
            <li class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <div class="row">
          <!-- Image Carousel -->
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm p-3">
              <!-- Main display image -->
              <div class="product-main-image mb-3" style="height:380px;display:flex;align-items:center;justify-content:center;background:#f8f9fa;border-radius:8px;overflow:hidden;">
                <img [src]="getImageUrl(allImages[activeImageIndex])" [alt]="product.name" class="img-fluid rounded" style="max-height:100%;max-width:100%;object-fit:contain;" (error)="onImageError($event)">
              </div>

              <!-- Thumbnail navigation -->
              <div *ngIf="allImages.length > 1" class="d-flex align-items-center gap-2">
                <button class="btn btn-outline-secondary btn-sm" (click)="prevImage()" [disabled]="activeImageIndex === 0">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <div class="d-flex gap-2 overflow-auto flex-grow-1 py-1" style="scrollbar-width:thin;">
                  <div *ngFor="let img of allImages; let i = index"
                       class="flex-shrink-0 border rounded cursor-pointer"
                       [class.border-primary]="i === activeImageIndex"
                       [class.border-2]="i === activeImageIndex"
                       style="width:64px;height:64px;cursor:pointer;overflow:hidden;"
                       (click)="activeImageIndex = i">
                    <img [src]="getImageUrl(img)" alt="" style="width:100%;height:100%;object-fit:cover;" (error)="onImageError($event)">
                  </div>
                </div>
                <button class="btn btn-outline-secondary btn-sm" (click)="nextImage()" [disabled]="activeImageIndex === allImages.length - 1">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              <div class="mt-3">
                <span *ngIf="product.featured" class="badge bg-warning text-dark me-2"><i class="fas fa-star me-1"></i>Sản phẩm nổi bật</span>
                <span *ngIf="availableStock <= 0" class="badge bg-danger me-2"><i class="fas fa-times me-1"></i>Hết hàng</span>
                <span *ngIf="availableStock > 0" class="badge bg-success"><i class="fas fa-check me-1"></i>Còn hàng</span>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="col-lg-6">
            <h1 class="h2 fw-bold mb-1">{{ product.name }}</h1>

            <!-- Rating summary -->
            <div class="mb-2">
              <ng-container *ngIf="!reviewsLoading">
                <ng-container *ngIf="reviewCount > 0; else noReviewSummary">
                  <span class="me-2">
                    <i *ngFor="let s of [1,2,3,4,5]"
                       class="fas"
                       [ngClass]="s <= rounded(averageRating) ? 'fa-star text-warning' : 'fa-star text-secondary'"></i>
                  </span>
                  <span class="fw-semibold">{{ averageRating | number:'1.1-1' }} / 5,0</span>
                  <span class="text-muted ms-1">({{ reviewCount }} đánh giá)</span>
                </ng-container>
                <ng-template #noReviewSummary>
                  <span class="text-muted"><i class="fas fa-star me-1"></i>Chưa có đánh giá nào</span>
                </ng-template>
              </ng-container>
            </div>

            <p class="text-muted"><i class="fas fa-barcode me-2"></i>Mã: <strong>{{ product.productCode }}</strong></p>
            <p>
              <i class="fas fa-tags me-2"></i>Danh mục:
              <span *ngIf="product.mainCategoryId">
                <a [routerLink]="['/products']" [queryParams]="{mainCategoryId: product.mainCategoryId}">{{ product.mainCategoryName }}</a>
                <span *ngIf="product.subCategoryId"> > <a [routerLink]="['/products']" [queryParams]="{subCategoryId: product.subCategoryId}">{{ product.subCategoryName }}</a></span>
              </span>
            </p>

            <!-- Price -->
            <div class="card bg-light p-3 mb-4">
              <div *ngIf="product.salePrice && product.salePrice > 0">
                <span class="text-decoration-line-through text-muted h5">{{ product.price | number:'1.0-0' }} VNĐ</span>
                <div class="text-danger h3 fw-bold">{{ product.salePrice | number:'1.0-0' }} VNĐ</div>
                <small class="text-success"><i class="fas fa-tag me-1"></i>Tiết kiệm: {{ (product.price - product.salePrice!) | number:'1.0-0' }} VNĐ</small>
              </div>
              <div *ngIf="!product.salePrice || product.salePrice <= 0">
                <div class="text-primary h3 fw-bold">{{ product.price | number:'1.0-0' }} VNĐ</div>
              </div>
            </div>

            <!-- Stock -->
            <div class="mb-2">
              <div *ngIf="stockChecked && availableStock > 0" class="text-success">
                <i class="fas fa-check-circle me-2"></i>Còn hàng ({{ availableStock }} sản phẩm trong kho)
              </div>
              <div *ngIf="stockChecked && availableStock === 0" class="text-danger">
                <i class="fas fa-times-circle me-2"></i>Sản phẩm này hiện đang hết hàng
              </div>
              <div *ngIf="!stockChecked" class="text-muted">
                <i class="fas fa-circle-notch fa-spin me-2"></i>Đang kiểm tra tồn kho...
              </div>
            </div>

            <!-- Quantity + Add -->
            <div class="d-flex align-items-center gap-3 mb-2" *ngIf="authService.isLoggedIn">
              <div class="input-group" style="width:130px">
                <button class="btn btn-outline-secondary" (click)="decQty()"><i class="fas fa-minus"></i></button>
                <input type="number" class="form-control text-center quantity-input" [(ngModel)]="qty" min="1" [max]="availableStock || 1">
                <button class="btn btn-outline-secondary" (click)="incQty()"><i class="fas fa-plus"></i></button>
              </div>
              <button
                class="btn btn-primary btn-lg"
                [disabled]="availableStock === 0 || !stockChecked"
                [title]="availableStock === 0 ? 'Sản phẩm hiện hết hàng' : 'Thêm vào giỏ hàng'"
                (click)="addToCart()">
                <i class="fas fa-cart-plus me-2"></i>Thêm vào giỏ hàng
              </button>
            </div>
            <div *ngIf="!authService.isLoggedIn" class="mb-4">
              <a routerLink="/login" class="btn btn-primary btn-lg">
                <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập để mua hàng
              </a>
            </div>

            <div *ngIf="addSuccess" class="alert alert-success"><i class="fas fa-check-circle me-2"></i>Đã thêm vào giỏ hàng!</div>
            <div *ngIf="toastMessage" class="alert" [ngClass]="toastType === 'error' ? 'alert-danger' : 'alert-warning'">
              {{ toastMessage }}
            </div>

            <!-- Details -->
            <div class="row text-muted small">
              <div class="col-6" *ngIf="product.manufacturer"><i class="fas fa-industry me-1"></i>{{ product.manufacturer }}</div>
              <div class="col-6" *ngIf="product.country"><i class="fas fa-globe me-1"></i>{{ product.country }}</div>
              <div class="col-6" *ngIf="product.dosageForm"><i class="fas fa-capsules me-1"></i>{{ product.dosageForm }}</div>
              <div class="col-6" *ngIf="product.packaging"><i class="fas fa-box me-1"></i>{{ product.packaging }}</div>
            </div>
          </div>
        </div>

        <!-- Description & reviews tabs -->
        <div class="row mt-5">
          <div class="col-12">
            <ul class="nav nav-tabs" id="productTabs">
              <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='desc'" (click)="activeTab='desc'">Mô tả</button></li>
              <li class="nav-item" *ngIf="product.ingredients"><button class="nav-link" [class.active]="activeTab==='ing'" (click)="activeTab='ing'">Thành phần</button></li>
              <li class="nav-item" *ngIf="product.usage"><button class="nav-link" [class.active]="activeTab==='use'" (click)="activeTab='use'">Cách dùng</button></li>
              <li class="nav-item" *ngIf="product.contraindications"><button class="nav-link" [class.active]="activeTab==='contra'" (click)="activeTab='contra'">Chống chỉ định</button></li>
              <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='reviews'" (click)="activeTab='reviews'">Đánh giá ({{ reviewCount }})</button></li>
            </ul>
            <div class="card border-top-0 p-4">
              <div *ngIf="activeTab==='desc'" [innerHTML]="product.description || 'Chưa có mô tả.'"></div>
              <div *ngIf="activeTab==='ing'" [innerHTML]="product.ingredients"></div>
              <div *ngIf="activeTab==='use'" [innerHTML]="product.usage"></div>
              <div *ngIf="activeTab==='contra'" [innerHTML]="product.contraindications"></div>

              <!-- Reviews tab content -->
              <div *ngIf="activeTab==='reviews'">
                <div *ngIf="reviewsLoading" class="text-muted">
                  <i class="fas fa-circle-notch fa-spin me-2"></i>Đang tải đánh giá...
                </div>
                <div *ngIf="!reviewsLoading && reviewCount === 0" class="text-muted">
                  <i class="fas fa-star me-1"></i>Chưa có đánh giá nào cho sản phẩm này.
                </div>
                <div *ngIf="!reviewsLoading && reviewCount > 0" class="list-group">
                  <div *ngFor="let r of reviews" class="list-group-item">
                    <div class="d-flex justify-content-between mb-1">
                      <div>
                        <strong>{{ r.user?.fullName || r.user?.username || 'Khách hàng' }}</strong>
                        <span class="ms-2">
                          <i *ngFor="let s of [1,2,3,4,5]"
                             class="fas"
                             [ngClass]="s <= r.rating ? 'fa-star text-warning' : 'fa-star text-secondary'"
                             style="font-size:0.8rem;"></i>
                        </span>
                      </div>
                      <small class="text-muted">{{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}</small>
                    </div>
                    <div *ngIf="r.comment" class="mt-1">
                      {{ r.comment }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Similar products -->
        <div class="row mt-5" *ngIf="relatedProducts && relatedProducts.length">
          <div class="col-12">
            <h4 class="fw-bold mb-3"><i class="fas fa-random me-2 text-primary"></i>Sản phẩm tương tự</h4>
          </div>
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4" *ngFor="let p of relatedProducts">
            <div class="card h-100 shadow-sm product-card" role="button" (click)="goToProduct(p.id)">
              <div class="product-image position-relative">
                <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" (error)="onImageError($event)">
                <span *ngIf="p.featured" class="badge bg-warning position-absolute top-0 end-0 m-2">
                  <i class="fas fa-star me-1"></i>Nổi bật
                </span>
              </div>
              <div class="card-body d-flex flex-column">
                <h6 class="fw-bold mb-1">{{ p.name }}</h6>
                <small class="text-muted mb-2">
                  {{ p.mainCategoryName }}<span *ngIf="p.subCategoryName"> > {{ p.subCategoryName }}</span>
                </small>
                <div class="mt-auto">
                  <div *ngIf="p.salePrice && p.salePrice > 0">
                    <span class="text-decoration-line-through text-muted small">{{ p.price | number:'1.0-0' }} VNĐ</span>
                    <div class="text-danger fw-bold">{{ p.salePrice | number:'1.0-0' }} VNĐ</div>
                  </div>
                  <div *ngIf="!p.salePrice || p.salePrice <= 0">
                    <div class="text-primary fw-bold">{{ p.price | number:'1.0-0' }} VNĐ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center py-5" *ngIf="loading">
        <div class="spinner-border text-primary"></div>
      </div>
      <div class="text-center py-5" *ngIf="!loading && !product">
        <i class="fas fa-box-open fa-3x text-muted mb-3 d-block"></i>
        <h4 class="text-muted">Không tìm thấy sản phẩm</h4>
        <a routerLink="/products" class="btn btn-primary mt-3">Xem tất cả sản phẩm</a>
      </div>
    </app-layout>
  `
})
export class ProductDetailComponent implements OnInit {
  readonly placeholderImage = PRODUCT_PLACEHOLDER_IMAGE;
  product: Product | null = null;
  loading = true;
  qty = 1;
  activeTab = 'desc';
  addSuccess = false;
  availableStock = 0;
  stockChecked = false;
  toastMessage: string | null = null;
  toastType: 'error' | 'warning' | null = null;
  allImages: (string | undefined)[] = [];
  activeImageIndex = 0;
  averageRating = 0;
  reviewCount = 0;
  reviews: any[] = [];
  reviewsLoading = true;
  relatedProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private inventoryService: InventoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: (p: any) => {
        this.product = p as Product;
        this.relatedProducts = (p.relatedProducts || []).slice(0, 4);
        this.buildImageList(p);
        this.availableStock = resolveAvailableQuantity(p);
        this.stockChecked = true;
        if (this.qty > this.availableStock && this.availableStock > 0) {
          this.qty = this.availableStock;
        }
        this.loading = false;
        this.checkStock();
        this.loadReviews(p.id);
      },
      error: () => this.loading = false
    });
  }

  private loadReviews(productId: number): void {
    this.reviewsLoading = true;
    this.productService.getReviews(productId).subscribe({
      next: res => {
        this.averageRating = res.averageRating || 0;
        this.reviewCount = res.reviewCount || 0;
        this.reviews = res.reviews || [];
        this.reviewsLoading = false;
      },
      error: () => {
        this.averageRating = 0;
        this.reviewCount = 0;
        this.reviews = [];
        this.reviewsLoading = false;
      }
    });
  }

  private checkStock(): void {
    if (!this.product) {
      return;
    }
    this.stockChecked = false;
    this.inventoryService.getStockStatus(this.product.id).subscribe({
      next: res => {
        const qty = Number(res?.quantity);
        if (Number.isFinite(qty)) {
          this.availableStock = Math.max(0, qty);
        } else {
          this.availableStock = resolveAvailableQuantity(this.product);
        }
        this.stockChecked = true;
        if (this.qty > this.availableStock) {
          this.qty = this.availableStock || 1;
        }
      },
      error: () => {
        this.availableStock = resolveAvailableQuantity(this.product);
        this.stockChecked = true;
      }
    });
  }

  private buildImageList(p: Product): void {
    this.allImages = [];
    if (p.imageUrl) {
      this.allImages.push(p.imageUrl);
    }
    if (p.additionalImages && p.additionalImages.length > 0) {
      this.allImages.push(...p.additionalImages);
    }
    if (this.allImages.length === 0) {
      this.allImages.push(undefined);
    }
    this.activeImageIndex = 0;
  }

  prevImage(): void {
    if (this.activeImageIndex > 0) this.activeImageIndex--;
  }

  nextImage(): void {
    if (this.activeImageIndex < this.allImages.length - 1) this.activeImageIndex++;
  }

  decQty(): void {
    if (this.qty > 1) this.qty--;
  }

  incQty(): void {
    if (this.availableStock && this.qty < this.availableStock) this.qty++;
  }

  getImageUrl(url: string | null | undefined): string {
    return resolveImageUrl(url);
  }
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.getAttribute('src') === this.placeholderImage) return;
    img.src = this.placeholderImage;
  }

  addToCart(): void {
    if (!this.product || !this.stockChecked) return;

    if (this.availableStock === 0) {
      this.showToast('Sản phẩm này hiện đang hết hàng', 'error');
      return;
    }

    if (this.qty > this.availableStock) {
      this.showToast(`Chỉ còn ${this.availableStock} sản phẩm trong kho`, 'warning');
      this.qty = this.availableStock;
      return;
    }

    this.cartService.addItem(this.product.id, this.qty).subscribe(() => {
      this.addSuccess = true;
      this.showToast(null, null); // clear toast if any
      setTimeout(() => this.addSuccess = false, 3000);
      this.checkStock();
    }, err => {
      this.showToast(this.extractErrorMessage(err, 'Không thể thêm vào giỏ hàng.'), 'error');
      this.checkStock();
    });
  }

  private extractErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.error || fallback;
  }

  private showToast(message: string | null, type: 'error' | 'warning' | null): void {
    this.toastMessage = message;
    this.toastType = type;
    if (message) {
      setTimeout(() => {
        this.toastMessage = null;
        this.toastType = null;
      }, 3000);
    }
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  rounded(value: number): number {
    return Math.round(value || 0);
  }
}
