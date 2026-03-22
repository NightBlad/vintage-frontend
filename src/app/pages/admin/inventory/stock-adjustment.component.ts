import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { InventoryService } from '../../../services/inventory.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-boxes-stacked me-2"></i>Điều chỉnh tồn kho</h2>
            <p class="text-muted mb-0">Dành cho nhân viên kho nhập / xuất / điều chỉnh hàng</p>
          </div>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4">
              <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                <div class="mb-3">
                  <label class="form-label fw-medium">Sản phẩm</label>
                  <select class="form-select" formControlName="productId">
                    <option value="">-- Chọn sản phẩm --</option>
                    <option *ngFor="let p of products" [value]="p.id">{{ p.name }}</option>
                  </select>
                  <div class="text-danger small mt-1" *ngIf="submitted && form.controls['productId'].invalid">
                    Vui lòng chọn sản phẩm.
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Kho</label>
                  <select class="form-select" formControlName="warehouseId">
                    <option value="">-- Chọn kho --</option>
                    <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
                  </select>
                  <div class="text-danger small mt-1" *ngIf="submitted && form.controls['warehouseId'].invalid">
                    Vui lòng chọn kho.
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label fw-medium">Số lượng</label>
                      <input type="number" class="form-control" formControlName="quantity" min="1">
                      <div class="text-danger small mt-1" *ngIf="submitted && form.controls['quantity'].errors">
                        <span *ngIf="form.controls['quantity'].errors['required']">Vui lòng nhập số lượng.</span>
                        <span *ngIf="form.controls['quantity'].errors['min']">Số lượng phải lớn hơn 0.</span>
                        <span *ngIf="form.controls['quantity'].errors['exceedsStock']">Số lượng xuất không được vượt quá tồn kho hiện tại ({{ currentStock }}).</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label fw-medium">Loại giao dịch</label>
                      <select class="form-select" formControlName="type">
                        <option value="IN">Nhập hàng (IN)</option>
                        <option value="OUT">Xuất hàng (OUT)</option>
                        <option value="ADJUST">Điều chỉnh (ADJUST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="mb-3" *ngIf="form.value.type === 'OUT' && stockLoaded">
                  <small class="text-muted">Tồn kho hiện tại: <strong>{{ currentStock }}</strong></small>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-medium">Ghi chú</label>
                  <textarea class="form-control" rows="3" formControlName="note" placeholder="Ví dụ: nhập lô mới, hủy hàng hỏng, kiểm kê lại..."></textarea>
                </div>

                <button class="btn btn-primary w-100" type="submit" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Lưu giao dịch tồn kho
                </button>

                <div *ngIf="successMessage" class="alert alert-success mt-3">
                  {{ successMessage }}
                </div>
                <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                  {{ errorMessage }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `
})
export class StockAdjustmentComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  products: any[] = [];
  warehouses: any[] = [];
  currentStock = 0;
  stockLoaded = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      productId: ['', Validators.required],
      warehouseId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      type: ['IN', Validators.required],
      note: ['']
    });

    this.loadProducts();
    this.loadWarehouses();

    this.form.get('productId')?.valueChanges.subscribe(() => this.loadStock());
    this.form.get('warehouseId')?.valueChanges.subscribe(() => this.loadStock());
    this.form.get('type')?.valueChanges.subscribe(() => this.updateQuantityValidator());
  }

  private loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (res) => {
        // getAll() returns Page<Product>, use its content array
        this.products = (res as any).content || [];
      },
      error: (err: any) => console.error(err)
    });
  }

  private loadWarehouses(): void {
    // Giả sử API kho sẽ được thêm sau, tạm hard-code danh sách mẫu
    this.warehouses = [
      { id: 1, name: 'Kho chính' },
      { id: 2, name: 'Kho chi nhánh' }
    ];
  }

  private loadStock(): void {
    const productId = this.form.get('productId')?.value;
    if (!productId) {
      this.currentStock = 0;
      this.stockLoaded = false;
      return;
    }
    this.stockLoaded = false;
    this.inventoryService.getStockStatus(productId).subscribe({
      next: res => {
        this.currentStock = res?.quantity ?? 0;
        this.stockLoaded = true;
        this.updateQuantityValidator();
      },
      error: () => {
        this.currentStock = 0;
        this.stockLoaded = true;
        this.updateQuantityValidator();
      }
    });
  }

  private updateQuantityValidator(): void {
    const qtyCtrl = this.form.get('quantity');
    if (!qtyCtrl) return;

    const validators = [Validators.required, Validators.min(1)];

    if (this.form.value.type === 'OUT' && this.stockLoaded) {
      qtyCtrl.setValidators([
        ...validators,
        (control) => {
          const val = control.value;
          if (val && val > this.currentStock) {
            return { exceedsStock: true };
          }
          return null;
        }
      ]);
    } else {
      qtyCtrl.setValidators(validators);
    }

    qtyCtrl.updateValueAndValidity({ emitEvent: false });
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = null;
    this.errorMessage = null;

    if (this.form.invalid) {
      return;
    }

    if (this.form.value.type === 'OUT' && this.form.value.quantity > this.currentStock) {
      this.form.get('quantity')?.setErrors({ exceedsStock: true });
      return;
    }

    this.loading = true;
    const payload = this.form.value;

    this.inventoryService.updateStock(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Đã lưu giao dịch tồn kho thành công.';
        this.form.reset({ type: 'IN', quantity: 1, note: '' });
        this.submitted = false;
        this.currentStock = 0;
        this.stockLoaded = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Không thể lưu giao dịch. Vui lòng thử lại.';
      }
    });
  }
}
