import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/models';

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
            <div class="card-header">
              <h5 class="mb-0">
                Thông tin danh mục
                <span *ngIf="model.parentId" class="badge bg-info ms-2">Danh mục phụ</span>
                <span *ngIf="!model.parentId && isEdit" class="badge bg-primary ms-2">Danh mục chính</span>
                <span *ngIf="!model.parentId && !isEdit" class="badge bg-primary ms-2">Tạo danh mục chính</span>
              </h5>
            </div>
            <div class="card-body">
              <form (ngSubmit)="submit()" #f="ngForm">
                <!-- Parent category selector (for new subcategories) -->
                <div class="mb-3" *ngIf="!isEdit">
                  <label class="form-label fw-medium">Loại danh mục</label>
                  <select class="form-control" [(ngModel)]="selectedParentId" name="parentId" (change)="onParentChange()">
                    <option [value]="null">Danh mục chính (không có danh mục cha)</option>
                    <option *ngFor="let cat of mainCategories" [value]="cat.id">
                      Danh mục phụ của: {{ cat.name }}
                    </option>
                  </select>
                  <small class="text-muted d-block mt-1">
                    <i class="fas fa-info-circle me-1"></i>
                    {{ selectedParentId ? 'Đang tạo danh mục phụ' : 'Đang tạo danh mục chính' }}
                  </small>
                </div>

                <!-- Parent category display (for editing) -->
                <div class="mb-3" *ngIf="isEdit && model.parentId">
                  <label class="form-label fw-medium">Danh mục cha</label>
                  <input type="text" class="form-control" [value]="getParentCategoryName()" disabled>
                </div>

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

  model: Partial<Category> = {
    name: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    active: true,
    parentId: null,
    isMainCategory: true
  };

  mainCategories: Category[] = [];
  selectedParentId: number | null = null;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load main categories for parent selection
    this.categoryService.getMainCategories().subscribe(cats => {
      this.mainCategories = cats;
    });

    // Check if parentId is passed in query params
    this.route.queryParams.subscribe(params => {
      if (params['parentId']) {
        this.selectedParentId = +params['parentId'];
        this.model.parentId = this.selectedParentId;
        this.model.isMainCategory = false;
      }
    });

    // Load category if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.categoryService.getById(+id).subscribe({
        next: c => {
          this.model = {
            name: c.name,
            description: c.description || '',
            imageUrl: c.imageUrl || '',
            displayOrder: c.displayOrder || 0,
            active: c.active,
            parentId: c.parentId || null,
            isMainCategory: c.isMainCategory
          };
          this.loading = false;
        },
        error: () => {
          this.error = 'Không tìm thấy danh mục';
          this.loading = false;
        }
      });
    }
  }

  onParentChange(): void {
    if (this.selectedParentId) {
      this.model.parentId = this.selectedParentId;
      this.model.isMainCategory = false;
    } else {
      this.model.parentId = null;
      this.model.isMainCategory = true;
    }
  }

  getParentCategoryName(): string {
    const id = this.model.parentId;
    if (!id) return '';
    const parent = this.mainCategories.find(c => c.id === id);
    return parent?.name || '';
  }

  submit(): void {
    if (!this.model.name || !this.model.name.trim()) {
      this.error = 'Vui lòng nhập tên danh mục';
      return;
    }

    this.saving = true;
    this.error = '';

    // Prepare payload
    const payload: Partial<Category> = {
      name: this.model.name,
      description: this.model.description || '',
      imageUrl: this.model.imageUrl || '',
      displayOrder: this.model.displayOrder || 0,
      active: this.model.active ?? true,
      parentId: this.model.parentId || null
    };

    const id = this.route.snapshot.paramMap.get('id');
    const obs = id
      ? this.categoryService.update(+id, payload)
      : this.categoryService.create(payload);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/categories']),
      error: (err) => {
        this.error = err?.error?.message || 'Lưu danh mục thất bại!';
        this.saving = false;
      }
    });
  }
}

