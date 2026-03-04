import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-folder me-2"></i>{{ isEdit ? 'Chỉnh sửa' : 'Thêm' }} danh mục</h2>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a routerLink="/admin/categories">Danh mục</a></li>
                <li class="breadcrumb-item active">{{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }}</li>
              </ol>
            </nav>
          </div>
          <a routerLink="/admin/categories" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i>Quay lại
          </a>
        </div>
      </div>

      <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

      <div class="row justify-content-center" *ngIf="!loading">
        <div class="col-lg-6">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="mb-0">Thông tin danh mục</h5></div>
            <div class="card-body">
              <form (ngSubmit)="submit()" #f="ngForm">
                <div class="mb-3">
                  <label class="form-label fw-medium">Tên danh mục <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="model.name" name="name" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Mô tả</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="model.description" name="description"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">URL hình ảnh</label>
                  <input type="text" class="form-control" [(ngModel)]="model.imageUrl" name="imageUrl" placeholder="https://...">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Thứ tự hiển thị</label>
                  <input type="number" class="form-control" [(ngModel)]="model.displayOrder" name="displayOrder" min="0">
                </div>
                <div class="mb-4">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="active" [(ngModel)]="model.active" name="active">
                    <label class="form-check-label" for="active">Hiển thị danh mục</label>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="saving || !f.valid">
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!saving" class="fas fa-save me-2"></i>
                    {{ isEdit ? 'Cập nhật' : 'Thêm danh mục' }}
                  </button>
                  <a routerLink="/admin/categories" class="btn btn-outline-secondary">Hủy</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `
})
export class CategoryFormComponent implements OnInit {
  isEdit = false;
  loading = false;
  saving = false;
  error = '';

  model: any = { name: '', description: '', imageUrl: '', displayOrder: 0, active: true };

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.categoryService.getById(+id).subscribe({
        next: c => {
          this.model = {
            name: c.name, description: c.description || '',
            imageUrl: c.imageUrl || '', displayOrder: c.displayOrder || 0, active: c.active
          };
          this.loading = false;
        },
        error: () => { this.error = 'Không tìm thấy danh mục'; this.loading = false; }
      });
    }
  }

  submit(): void {
    this.saving = true;
    this.error = '';
    const id = this.route.snapshot.paramMap.get('id');
    const obs = id
      ? this.categoryService.update(+id, this.model)
      : this.categoryService.create(this.model);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/categories']),
      error: (err) => {
        this.error = err?.error?.message || 'Lưu danh mục thất bại!';
        this.saving = false;
      }
    });
  }
}

