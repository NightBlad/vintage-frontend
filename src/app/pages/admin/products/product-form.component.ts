import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-pills me-2"></i>{{ isEdit ? 'Chỉnh sửa' : 'Thêm' }} sản phẩm</h2>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a routerLink="/admin/products">Sản phẩm</a></li>
                <li class="breadcrumb-item active">{{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }}</li>
              </ol>
            </nav>
          </div>
          <a routerLink="/admin/products" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i>Quay lại
          </a>
        </div>
      </div>

      <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

      <form *ngIf="!loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="row">
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Thông tin cơ bản</h5></div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label fw-medium">Tên sản phẩm <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="model.name" name="name" required>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-medium">Mã sản phẩm <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" [(ngModel)]="model.productCode" name="productCode" required>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-medium">Danh mục</label>
                    <select class="form-select" [(ngModel)]="model.categoryId" name="categoryId">
                      <option [value]="null">-- Chọn danh mục --</option>
                      <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Mô tả</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="model.description" name="description"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Thành phần</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="model.ingredients" name="ingredients"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Cách dùng</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="model.usage" name="usage"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Chống chỉ định</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="model.contraindications" name="contraindications"></textarea>
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Thông tin chi tiết</h5></div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-medium">Nhà sản xuất</label>
                    <input type="text" class="form-control" [(ngModel)]="model.manufacturer" name="manufacturer">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-medium">Xuất xứ</label>
                    <input type="text" class="form-control" [(ngModel)]="model.country" name="country">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-medium">Dạng bào chế</label>
                    <input type="text" class="form-control" [(ngModel)]="model.dosageForm" name="dosageForm">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-medium">Quy cách đóng gói</label>
                    <input type="text" class="form-control" [(ngModel)]="model.packaging" name="packaging">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Giá & Tồn kho</h5></div>
              <div class="card-body">
                <div class="mb-3">
                  <label class="form-label fw-medium">Giá gốc (₫) <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" [(ngModel)]="model.price" name="price" required min="0">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Giá khuyến mãi (₫)</label>
                  <input type="number" class="form-control" [(ngModel)]="model.salePrice" name="salePrice" min="0">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium">Số lượng tồn kho <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" [(ngModel)]="model.stockQuantity" name="stockQuantity" required min="0">
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Hình ảnh</h5></div>
              <div class="card-body">
                <div *ngIf="previewUrl || currentImageUrl" class="mb-3 text-center">
                  <img [src]="previewUrl || currentImageUrl" alt="" class="img-thumbnail" style="max-height:200px">
                </div>
                <input type="file" class="form-control" accept="image/*" (change)="onFileChange($event)">
                <small class="text-muted">JPG, PNG, WEBP - Tối đa 5MB</small>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0">Cài đặt</h5></div>
              <div class="card-body">
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" id="active" [(ngModel)]="model.active" name="active">
                  <label class="form-check-label" for="active">Hiển thị sản phẩm</label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" id="featured" [(ngModel)]="model.featured" name="featured">
                  <label class="form-check-label" for="featured">Sản phẩm nổi bật</label>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="prescription" [(ngModel)]="model.prescriptionRequired" name="prescriptionRequired">
                  <label class="form-check-label" for="prescription">Cần đơn thuốc</label>
                </div>
              </div>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-primary" [disabled]="saving || !f.valid">
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!saving" class="fas fa-save me-2"></i>
                {{ isEdit ? 'Cập nhật' : 'Thêm sản phẩm' }}
              </button>
              <a routerLink="/admin/products" class="btn btn-outline-secondary">Hủy</a>
            </div>
          </div>
        </div>
      </form>

      <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>
    </app-admin-layout>
  `
})
export class ProductFormComponent implements OnInit {
  isEdit = false;
  loading = false;
  saving = false;
  error = '';
  categories: Category[] = [];
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentImageUrl: string | null = null;

  model: any = {
    name: '', productCode: '', description: '', ingredients: '', usage: '',
    contraindications: '', price: 0, salePrice: null, stockQuantity: 0,
    manufacturer: '', country: '', dosageForm: '', packaging: '',
    active: true, featured: false, prescriptionRequired: false, categoryId: null
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(c => this.categories = c);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.productService.getById(+id).subscribe({
        next: p => {
          this.model = {
            name: p.name, productCode: p.productCode, description: p.description || '',
            ingredients: p.ingredients || '', usage: p.usage || '',
            contraindications: p.contraindications || '', price: p.price,
            salePrice: p.salePrice || null, stockQuantity: p.stockQuantity,
            manufacturer: p.manufacturer || '', country: p.country || '',
            dosageForm: p.dosageForm || '', packaging: p.packaging || '',
            active: p.active, featured: p.featured,
            prescriptionRequired: p.prescriptionRequired,
            categoryId: p.category?.id || null
          };
          if (p.imageUrl) {
            this.currentImageUrl = p.imageUrl.startsWith('http')
              ? p.imageUrl
              : `${environment.apiUrl.replace('/api', '')}/uploads/products/${p.imageUrl}`;
          }
          this.loading = false;
        },
        error: () => { this.error = 'Không tìm thấy sản phẩm'; this.loading = false; }
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submit(): void {
    this.saving = true;
    this.error = '';
    const fd = new FormData();
    Object.keys(this.model).forEach(k => {
      if (this.model[k] !== null && this.model[k] !== undefined) {
        fd.append(k, this.model[k]);
      }
    });
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const id = this.route.snapshot.paramMap.get('id');
    const obs = id
      ? this.productService.update(+id, fd)
      : this.productService.create(fd);

    obs.subscribe({
      next: () => this.router.navigate(['/admin/products']),
      error: (err) => {
        this.error = err?.error?.message || 'Lưu sản phẩm thất bại!';
        this.saving = false;
      }
    });
  }
}

