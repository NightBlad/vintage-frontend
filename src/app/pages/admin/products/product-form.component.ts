import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { Category, Product } from '../../../models/models';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from '../../../utils/product-image.util';

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
                </div>

                <!-- Category selection (2-level) -->
                <div class="card bg-light border-info mb-3 p-3">
                  <h6 class="fw-bold mb-3"><i class="fas fa-sitemap me-2 text-info"></i>Danh mục sản phẩm</h6>

                  <div class="mb-3">
                    <label class="form-label fw-medium">Danh mục chính <span class="text-danger">*</span></label>
                    <select class="form-select" [(ngModel)]="selectedMainCategoryId" name="mainCategoryId" (change)="onMainCategoryChange()" required>
                      <option [value]="null">-- Chọn danh mục chính --</option>
                      <option *ngFor="let c of mainCategories" [value]="c.id">{{ c.name }}</option>
                    </select>
                    <small class="text-muted">Bắt buộc phải chọn danh mục chính</small>
                  </div>

                  <div class="mb-3" *ngIf="availableSubCategories.length">
                    <label class="form-label fw-medium">Danh mục phụ (tùy chọn)</label>
                    <select class="form-select" [(ngModel)]="selectedSubCategoryId" name="subCategoryId" (change)="onSubCategoryChange()">
                      <option [value]="null">-- Không chọn danh mục phụ --</option>
                      <option *ngFor="let c of availableSubCategories" [value]="c.id">{{ c.name }}</option>
                    </select>
                    <small class="text-muted">Nếu chọn danh mục phụ, sẽ ưu tiên danh mục phụ trong việc lưu</small>
                  </div>

                  <div class="alert alert-info small" *ngIf="selectedMainCategoryId && !availableSubCategories.length">
                    <i class="fas fa-info-circle me-1"></i>Danh mục chính này chưa có danh mục phụ
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
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-image me-2"></i>Ảnh chính</h5></div>
              <div class="card-body">
                <div *ngIf="previewUrl || currentImageUrl" class="mb-3 text-center">
                  <img [src]="previewUrl || currentImageUrl" alt="" class="img-thumbnail" style="max-height:200px" (error)="onImageError($event)">
                </div>
                <input type="file" class="form-control" accept="image/*" (change)="onFileChange($event)">
                <small class="text-muted">JPG, PNG, WEBP - Tối đa 5MB</small>
              </div>
            </div>

            <div class="card shadow-sm mb-4">
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-images me-2"></i>Ảnh bổ sung</h5></div>
              <div class="card-body">
                <div *ngIf="existingAdditionalImages.length > 0 || additionalPreviews.length > 0" class="row g-2 mb-3">
                  <div class="col-4" *ngFor="let img of existingAdditionalImages; let i = index">
                    <div class="position-relative">
                      <img [src]="getImageUrl(img)" alt="" class="img-thumbnail w-100" style="height:100px;object-fit:cover" (error)="onImageError($event)">
                      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" style="padding:2px 6px;font-size:10px" (click)="removeExistingAdditionalImage(i)" title="Xóa ảnh">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-4" *ngFor="let preview of additionalPreviews; let i = index">
                    <div class="position-relative">
                      <img [src]="preview" alt="" class="img-thumbnail w-100" style="height:100px;object-fit:cover">
                      <button type="button" class="btn btn-warning btn-sm position-absolute top-0 end-0 m-1" style="padding:2px 6px;font-size:10px" (click)="removeNewAdditionalImage(i)" title="Xóa ảnh">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <input type="file" class="form-control" accept="image/*" multiple (change)="onAdditionalFilesChange($event)">
                <small class="text-muted">Chọn nhiều ảnh cùng lúc. JPG, PNG, WEBP - Tối đa 5MB mỗi ảnh</small>
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
              <button type="submit" class="btn btn-primary" [disabled]="saving || !f.valid || !selectedMainCategoryId">
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!saving" class="fas fa-save me-2"></i>
                {{ isEdit ? 'Cập nhật' : 'Thêm sản phẩm' }}
              </button>
              <a routerLink="/admin/products" class="btn btn-outline-secondary">Hủy</a>
            </div>

            <div class="alert alert-warning small mt-3" *ngIf="!selectedMainCategoryId">
              <i class="fas fa-exclamation-triangle me-1"></i>Vui lòng chọn danh mục chính
            </div>
          </div>
        </div>
      </form>

      <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>
    </app-admin-layout>
  `
})
export class ProductFormComponent implements OnInit {
  readonly placeholderImage = PRODUCT_PLACEHOLDER_IMAGE;
  isEdit = false;
  loading = false;
  saving = false;
  error = '';

  mainCategories: Category[] = [];
  availableSubCategories: Category[] = [];

  selectedMainCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentImageUrl: string | null = null;

  additionalFiles: File[] = [];
  additionalPreviews: string[] = [];
  existingAdditionalImages: string[] = [];
  removedAdditionalImages: string[] = [];

  model: Partial<Product> = {
    name: '',
    productCode: '',
    description: '',
    ingredients: '',
    usage: '',
    contraindications: '',
    price: 0,
    salePrice: null,
    stockQuantity: 0,
    manufacturer: '',
    country: '',
    dosageForm: '',
    packaging: '',
    active: true,
    featured: false,
    prescriptionRequired: false
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => {
      this.mainCategories = cats.filter(c => c.isMainCategory);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.productService.getById(+id).subscribe({
        next: p => {
          this.model = {
            name: p.name,
            productCode: p.productCode,
            description: p.description || '',
            ingredients: p.ingredients || '',
            usage: p.usage || '',
            contraindications: p.contraindications || '',
            price: p.price,
            salePrice: p.salePrice || null,
            stockQuantity: p.stockQuantity,
            manufacturer: p.manufacturer || '',
            country: p.country || '',
            dosageForm: p.dosageForm || '',
            packaging: p.packaging || '',
            active: p.active,
            featured: p.featured,
            prescriptionRequired: p.prescriptionRequired
          };

          // Set category selections
          if (p.subCategoryId) {
            this.selectedSubCategoryId = p.subCategoryId;
            // Find parent of this subcategory
            const parent = this.mainCategories.find(c =>
              c.subCategories?.some(sub => sub.id === p.subCategoryId)
            );
            if (parent) {
              this.selectedMainCategoryId = parent.id;
              this.updateSubCategories();
            }
          } else if (p.mainCategoryId) {
            this.selectedMainCategoryId = p.mainCategoryId;
            this.updateSubCategories();
          }

          this.currentImageUrl = resolveImageUrl(p.imageUrl);
          this.existingAdditionalImages = p.additionalImages ? [...p.additionalImages] : [];
          this.loading = false;
        },
        error: () => {
          this.error = 'Không tìm thấy sản phẩm';
          this.loading = false;
        }
      });
    }
  }

  onMainCategoryChange(): void {
    this.selectedSubCategoryId = null;
    this.updateSubCategories();
  }

  onSubCategoryChange(): void {
    // Validation: if subcategory is selected, ensure it belongs to current main category
    if (this.selectedSubCategoryId && this.selectedMainCategoryId) {
      const mainCat = this.mainCategories.find(c => c.id === this.selectedMainCategoryId);
      const validSubIds = mainCat?.subCategories?.map(s => s.id) || [];
      if (!validSubIds.includes(this.selectedSubCategoryId)) {
        this.selectedSubCategoryId = null;
      }
    }
  }

  private updateSubCategories(): void {
    this.availableSubCategories = [];
    if (this.selectedMainCategoryId) {
      const mainCat = this.mainCategories.find(c => c.id === this.selectedMainCategoryId);
      if (mainCat?.subCategories) {
        this.availableSubCategories = mainCat.subCategories;
      }
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.getAttribute('src') === this.placeholderImage) return;
    img.src = this.placeholderImage;
  }

  getImageUrl(url: string | null | undefined): string {
    return resolveImageUrl(url);
  }

  onAdditionalFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.additionalFiles.push(file);
        const reader = new FileReader();
        reader.onload = e => {
          this.additionalPreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    input.value = '';
  }

  removeExistingAdditionalImage(index: number): void {
    const removed = this.existingAdditionalImages.splice(index, 1);
    this.removedAdditionalImages.push(...removed);
  }

  removeNewAdditionalImage(index: number): void {
    this.additionalFiles.splice(index, 1);
    this.additionalPreviews.splice(index, 1);
  }

  submit(): void {
    if (!this.selectedMainCategoryId) {
      this.error = 'Vui lòng chọn danh mục chính';
      return;
    }

    // Validate subcategory belongs to selected main category
    if (this.selectedSubCategoryId && this.selectedMainCategoryId) {
      const mainCat = this.mainCategories.find(c => c.id === this.selectedMainCategoryId);
      const isValid = mainCat?.subCategories?.some(s => s.id === this.selectedSubCategoryId);
      if (!isValid) {
        this.error = 'Danh mục phụ không hợp lệ cho danh mục chính này';
        return;
      }
    }

    this.saving = true;
    this.error = '';

    const fd = new FormData();

    // Append all model fields
    Object.keys(this.model).forEach(k => {
      const val = (this.model as any)[k];
      if (val !== null && val !== undefined && val !== '') {
        fd.append(k, String(val));
      }
    });

    // Append category IDs (prioritize subcategory)
    if (this.selectedSubCategoryId) {
      fd.append('subCategoryId', String(this.selectedSubCategoryId));
      fd.append('mainCategoryId', String(this.selectedMainCategoryId));
    } else {
      fd.append('mainCategoryId', String(this.selectedMainCategoryId));
    }

    if (this.selectedFile) {
      fd.append('imageFile', this.selectedFile);
    }

    for (const file of this.additionalFiles) {
      fd.append('additionalImageFiles', file);
    }

    if (this.removedAdditionalImages.length > 0) {
      fd.append('removeAdditionalImages', this.removedAdditionalImages.join(','));
    }

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

