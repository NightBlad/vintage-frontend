import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/models';
import { environment } from '../../../environments/environment';

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
            <li class="breadcrumb-item" *ngIf="product.category">
              <a [routerLink]="['/products']" [queryParams]="{categoryId: product.category.id}">{{ product.category.name }}</a>
            </li>
            <li class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <div class="row">
          <!-- Image -->
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm p-3">
              <div class="product-image" style="height:350px;">
                <img *ngIf="product.imageUrl" [src]="getImageUrl(product.imageUrl)" [alt]="product.name" class="img-fluid rounded">
                <i *ngIf="!product.imageUrl" class="fas fa-pills" style="font-size:6rem;color:#cbd5e1"></i>
              </div>
              <div class="mt-3">
                <span *ngIf="product.featured" class="badge bg-warning text-dark me-2"><i class="fas fa-star me-1"></i>Sản phẩm nổi bật</span>
                <span *ngIf="product.stockQuantity <= 0" class="badge bg-danger me-2"><i class="fas fa-times me-1"></i>Hết hàng</span>
                <span *ngIf="product.stockQuantity > 0 && product.stockQuantity <= 10" class="badge bg-warning text-dark"><i class="fas fa-exclamation me-1"></i>Sắp hết hàng</span>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="col-lg-6">
            <h1 class="h2 fw-bold mb-3">{{ product.name }}</h1>
            <p class="text-muted"><i class="fas fa-barcode me-2"></i>Mã: <strong>{{ product.productCode }}</strong></p>
            <p *ngIf="product.category">
              <i class="fas fa-tags me-2"></i>Danh mục:
              <a [routerLink]="['/products']" [queryParams]="{categoryId: product.category.id}">{{ product.category.name }}</a>
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
            <div class="mb-4">
              <div *ngIf="product.stockQuantity > 0" class="text-success">
                <i class="fas fa-check-circle me-2"></i>Còn hàng ({{ product.stockQuantity }} sản phẩm)
              </div>
              <div *ngIf="product.stockQuantity <= 0" class="text-danger">
                <i class="fas fa-times-circle me-2"></i>Tạm hết hàng
              </div>
            </div>

            <!-- Quantity + Add -->
            <div class="d-flex align-items-center gap-3 mb-4" *ngIf="authService.isLoggedIn">
              <div class="input-group" style="width:130px">
                <button class="btn btn-outline-secondary" (click)="decQty()"><i class="fas fa-minus"></i></button>
                <input type="number" class="form-control text-center" [(ngModel)]="qty" min="1" [max]="product.stockQuantity">
                <button class="btn btn-outline-secondary" (click)="incQty()"><i class="fas fa-plus"></i></button>
              </div>
              <button class="btn btn-primary btn-lg" [disabled]="product.stockQuantity <= 0" (click)="addToCart()">
                <i class="fas fa-cart-plus me-2"></i>Thêm vào giỏ hàng
              </button>
            </div>
            <div *ngIf="!authService.isLoggedIn" class="mb-4">
              <a routerLink="/login" class="btn btn-primary btn-lg">
                <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập để mua hàng
              </a>
            </div>

            <div *ngIf="addSuccess" class="alert alert-success"><i class="fas fa-check-circle me-2"></i>Đã thêm vào giỏ hàng!</div>

            <!-- Details -->
            <div class="row text-muted small">
              <div class="col-6" *ngIf="product.manufacturer"><i class="fas fa-industry me-1"></i>{{ product.manufacturer }}</div>
              <div class="col-6" *ngIf="product.country"><i class="fas fa-globe me-1"></i>{{ product.country }}</div>
              <div class="col-6" *ngIf="product.dosageForm"><i class="fas fa-capsules me-1"></i>{{ product.dosageForm }}</div>
              <div class="col-6" *ngIf="product.packaging"><i class="fas fa-box me-1"></i>{{ product.packaging }}</div>
            </div>
          </div>
        </div>

        <!-- Description tabs -->
        <div class="row mt-5">
          <div class="col-12">
            <ul class="nav nav-tabs" id="productTabs">
              <li class="nav-item"><button class="nav-link" [class.active]="activeTab==='desc'" (click)="activeTab='desc'">Mô tả</button></li>
              <li class="nav-item" *ngIf="product.ingredients"><button class="nav-link" [class.active]="activeTab==='ing'" (click)="activeTab='ing'">Thành phần</button></li>
              <li class="nav-item" *ngIf="product.usage"><button class="nav-link" [class.active]="activeTab==='use'" (click)="activeTab='use'">Cách dùng</button></li>
              <li class="nav-item" *ngIf="product.contraindications"><button class="nav-link" [class.active]="activeTab==='contra'" (click)="activeTab='contra'">Chống chỉ định</button></li>
            </ul>
            <div class="card border-top-0 p-4">
              <div *ngIf="activeTab==='desc'" [innerHTML]="product.description || 'Chưa có mô tả.'"></div>
              <div *ngIf="activeTab==='ing'" [innerHTML]="product.ingredients"></div>
              <div *ngIf="activeTab==='use'" [innerHTML]="product.usage"></div>
              <div *ngIf="activeTab==='contra'" [innerHTML]="product.contraindications"></div>
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
  product: Product | null = null;
  loading = true;
  qty = 1;
  activeTab = 'desc';
  addSuccess = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getById(id).subscribe({
      next: p => { this.product = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  decQty(): void {
    if (this.qty > 1) this.qty--;
  }

  incQty(): void {
    if (this.product && this.qty < this.product.stockQuantity) this.qty++;
  }

  getImageUrl(url: string): string {
    return url.startsWith('http') ? url : `${environment.apiUrl.replace('/api/v1', '')}${url}`;
  }

  addToCart(): void {
    if (!this.product) return;
    this.cartService.addItem(this.product.id, this.qty).subscribe(() => {
      this.addSuccess = true;
      setTimeout(() => this.addSuccess = false, 3000);
    });
  }
}

