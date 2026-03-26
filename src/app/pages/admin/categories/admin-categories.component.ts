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
            <p class="text-muted mb-0">Danh sách danh mục sản phẩm (2 cấp)</p>
          </div>
          <a routerLink="/admin/categories/add" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>Thêm danh mục chính
          </a>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-primary"></div>
          </div>

          <div *ngIf="!loading">
            <div class="category-tree">
              <div *ngIf="mainCategories.length; else noCategories">
                <div *ngFor="let mainCat of mainCategories" class="category-group mb-4">
                  <!-- Main Category Row -->
                  <div class="row align-items-center main-category-row border-bottom pb-2 mb-2">
                    <div class="col-md-6">
                      <div class="d-flex align-items-center gap-2">
                        <i class="fas fa-folder text-warning fs-5" style="width:40px"></i>
                        <div>
                          <span class="fw-bold">{{ mainCat.name }}</span>
                          <small class="text-muted d-block">Danh mục chính</small>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-2">
                      <span class="badge bg-info">{{ mainCat.productCount || 0 }} SP</span>
                    </div>
                    <div class="col-md-2">
                      <span class="badge" [ngClass]="mainCat.active ? 'bg-success' : 'bg-secondary'">
                        {{ mainCat.active ? 'Hoạt động' : 'Ẩn' }}
                      </span>
                    </div>
                    <div class="col-md-2 text-end">
                      <a [routerLink]="['/admin/categories', mainCat.id, 'edit']" class="btn btn-primary btn-sm me-1">
                        <i class="fas fa-edit"></i>
                      </a>
                      <button class="btn btn-danger btn-sm" (click)="deleteCategory(mainCat)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Sub Categories -->
                  <div *ngIf="mainCat.subCategories && mainCat.subCategories.length" class="ms-4 ps-3 border-start">
                    <div *ngFor="let subCat of mainCat.subCategories" class="row align-items-center sub-category-row py-2 border-bottom">
                      <div class="col-md-6">
                        <div class="d-flex align-items-center gap-2">
                          <i class="fas fa-layer-group text-info fs-6" style="width:40px"></i>
                          <div>
                            <span>{{ subCat.name }}</span>
                            <small class="text-muted d-block">Danh mục phụ</small>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-2">
                        <span class="badge bg-info">{{ subCat.productCount || 0 }} SP</span>
                      </div>
                      <div class="col-md-2">
                        <span class="badge" [ngClass]="subCat.active ? 'bg-success' : 'bg-secondary'">
                          {{ subCat.active ? 'Hoạt động' : 'Ẩn' }}
                        </span>
                      </div>
                      <div class="col-md-2 text-end">
                        <a [routerLink]="['/admin/categories', subCat.id, 'edit']" class="btn btn-primary btn-sm me-1">
                          <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-danger btn-sm" (click)="deleteCategory(subCat)">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Add sub category button -->
                    <div class="row mt-2">
                      <div class="col-md-6">
                        <a [routerLink]="['/admin/categories/add']" [queryParams]="{parentId: mainCat.id}" class="btn btn-outline-primary btn-sm">
                          <i class="fas fa-plus-circle me-1"></i>Thêm danh mục phụ
                        </a>
                      </div>
                    </div>
                  </div>

                  <!-- Add sub category button (if no subs yet) -->
                  <div *ngIf="!mainCat.subCategories || !mainCat.subCategories.length" class="ms-4 ps-3 py-2">
                    <a [routerLink]="['/admin/categories/add']" [queryParams]="{parentId: mainCat.id}" class="btn btn-outline-primary btn-sm">
                      <i class="fas fa-plus-circle me-1"></i>Thêm danh mục phụ
                    </a>
                  </div>
                </div>
              </div>

              <ng-template #noCategories>
                <div class="text-center text-muted py-4">
                  <i class="fas fa-inbox fa-3x mb-2 d-block opacity-50"></i>
                  Chưa có danh mục nào
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>
    </app-admin-layout>
  `,
  styles: [`
    .category-group { background: #f9fafb; border-radius: 8px; padding: 1rem; }
    .main-category-row { font-weight: 500; }
    .sub-category-row { background: white; border-radius: 4px; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  mainCategories: Category[] = [];
  loading = true;
  error = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    // Dùng API admin để có productCount
    this.categoryService.getAllAdmin().subscribe({
      next: data => {
        this.mainCategories = data.filter(c => c.isMainCategory);
        this.loading = false;
      },
      error: () => {
        this.error = 'Tải danh mục thất bại';
        this.loading = false;
      }
    });
  }

  deleteCategory(c: Category): void {
    const msg = c.isMainCategory
      ? `Xóa danh mục chính "${c.name}"? Danh mục phụ sẽ không bị xóa.`
      : `Xóa danh mục phụ "${c.name}"? Các sản phẩm sẽ không bị xóa.`;

    if (!confirm(msg)) return;

    this.categoryService.delete(c.id).subscribe({
      next: () => this.load(),
      error: () => alert('Không thể xóa danh mục này!')
    });
  }
}
