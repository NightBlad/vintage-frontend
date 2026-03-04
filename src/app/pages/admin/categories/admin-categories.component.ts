import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-folder me-2"></i>Quản lý danh mục</h2>
            <p class="text-muted mb-0">Danh sách danh mục sản phẩm</p>
          </div>
          <a routerLink="/admin/categories/add" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>Thêm danh mục
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
                    <th>#</th>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th class="text-center">Số sản phẩm</th>
                    <th class="text-center">Thứ tự</th>
                    <th class="text-center">Trạng thái</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of categories; let i = index">
                    <td>{{ i + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img *ngIf="c.imageUrl" [src]="c.imageUrl" alt="" class="rounded" width="40" height="40" style="object-fit:cover">
                        <i *ngIf="!c.imageUrl" class="fas fa-folder text-warning fs-4"></i>
                        <span class="fw-medium">{{ c.name }}</span>
                      </div>
                    </td>
                    <td class="text-muted">{{ c.description || '—' }}</td>
                    <td class="text-center"><span class="badge bg-info">{{ c.productCount || 0 }}</span></td>
                    <td class="text-center">{{ c.displayOrder || 0 }}</td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="c.active ? 'bg-success' : 'bg-secondary'">
                        {{ c.active ? 'Hoạt động' : 'Ẩn' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <a [routerLink]="['/admin/categories', c.id, 'edit']" class="btn btn-primary btn-sm me-1">
                        <i class="fas fa-edit"></i>
                      </a>
                      <button class="btn btn-danger btn-sm" (click)="deleteCategory(c)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!categories.length">
                    <td colspan="7" class="text-center text-muted py-4">Chưa có danh mục nào</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>
    </app-admin-layout>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: data => { this.categories = data; this.loading = false; },
      error: () => { this.error = 'Tải danh mục thất bại'; this.loading = false; }
    });
  }

  deleteCategory(c: Category): void {
    if (!confirm(`Xóa danh mục "${c.name}"? Các sản phẩm trong danh mục sẽ không bị xóa.`)) return;
    this.categoryService.delete(c.id).subscribe({
      next: () => this.load(),
      error: () => alert('Không thể xóa danh mục này!')
    });
  }
}

