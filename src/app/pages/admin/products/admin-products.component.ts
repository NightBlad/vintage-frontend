import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { ProductService } from '../../../services/product.service';
import { Product, Page } from '../../../models/models';
import { resolveProductImageUrl } from '../../../utils/product-image.util';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-pills me-2"></i>Quản lý sản phẩm</h2>
            <p class="text-muted mb-0">Danh sách tất cả sản phẩm dược phẩm</p>
          </div>
          <a routerLink="/admin/products/add" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>Thêm sản phẩm
          </a>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-primary"></div>
          </div>

          <div *ngIf="!loading">
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th width="60">Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Mã SP</th>
                    <th>Danh mục</th>
                    <th class="text-end">Giá</th>
                    <th class="text-center">Tồn kho</th>
                    <th class="text-center">Trạng thái</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of page?.content">
                    <td>
                      <img *ngIf="p.imageUrl" [src]="getImageUrl(p.imageUrl)" class="rounded" width="45" height="45" style="object-fit:cover" alt="">
                      <div *ngIf="!p.imageUrl" class="bg-light rounded d-flex align-items-center justify-content-center" style="width:45px;height:45px">
                        <i class="fas fa-pills text-muted"></i>
                      </div>
                    </td>
                    <td>
                      <div class="fw-medium">{{ p.name }}</div>
                      <small class="text-muted">{{ p.manufacturer }}</small>
                    </td>
                    <td><code>{{ p.productCode }}</code></td>
                    <td>{{ p.category?.name || '—' }}</td>
                    <td class="text-end">
                      <span *ngIf="p.salePrice" class="text-danger fw-bold">{{ p.salePrice | number:'1.0-0' }} ₫</span>
                      <span [class]="p.salePrice ? 'text-muted text-decoration-line-through ms-1 small' : 'fw-bold text-primary'">
                        {{ p.price | number:'1.0-0' }} ₫
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="p.stockQuantity <= 10 ? 'bg-danger' : p.stockQuantity <= 50 ? 'bg-warning text-dark' : 'bg-success'">
                        {{ p.stockQuantity }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="p.active ? 'bg-success' : 'bg-secondary'">
                        {{ p.active ? 'Hoạt động' : 'Ẩn' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <a [routerLink]="['/admin/products', p.id, 'edit']" class="btn btn-primary btn-sm me-1">
                        <i class="fas fa-edit"></i>
                      </a>
                      <button class="btn btn-danger btn-sm" (click)="deleteProduct(p)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!page?.content?.length">
                    <td colspan="8" class="text-center text-muted py-4">Chưa có sản phẩm nào</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav *ngIf="page && page.totalPages > 1" class="mt-3">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="page.first">
                  <button class="page-link" (click)="loadPage(currentPage - 1)"><i class="fas fa-chevron-left"></i></button>
                </li>
                <li class="page-item" *ngFor="let n of getPages()" [class.active]="n === currentPage">
                  <button class="page-link" (click)="loadPage(n)">{{ n + 1 }}</button>
                </li>
                <li class="page-item" [class.disabled]="page.last">
                  <button class="page-link" (click)="loadPage(currentPage + 1)"><i class="fas fa-chevron-right"></i></button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `
})
export class AdminProductsComponent implements OnInit {
  page: Page<Product> | null = null;
  loading = true;
  currentPage = 0;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(p: number): void {
    this.loading = true;
    this.currentPage = p;
    this.productService.adminGetAll(p, 10).subscribe({
      next: data => { this.page = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return;
    this.productService.delete(p.id).subscribe({
      next: () => this.loadPage(this.currentPage),
      error: () => alert('Không thể xóa sản phẩm này!')
    });
  }

  getPages(): number[] {
    if (!this.page) return [];
    return Array.from({ length: this.page.totalPages }, (_, i) => i);
  }

  getImageUrl(url: string): string {
    return resolveProductImageUrl(url);
  }
}

