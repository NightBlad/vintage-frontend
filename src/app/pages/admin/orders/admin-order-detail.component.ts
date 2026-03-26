import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/models';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-file-invoice me-2"></i>Chi tiết đơn hàng</h2>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a routerLink="/admin/orders">Đơn hàng</a></li>
                <li class="breadcrumb-item active">#{{ order?.orderNumber }}</li>
              </ol>
            </nav>
          </div>
          <a routerLink="/admin/orders" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i>Quay lại
          </a>
        </div>
      </div>

      <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

      <ng-container *ngIf="!loading && order">
        <div class="row">
          <!-- Order Info -->
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Đơn hàng #{{ order.orderNumber }}</h5>
                <span class="badge fs-6" [ngClass]="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table">
                    <thead class="table-light">
                      <tr><th>Sản phẩm</th><th class="text-center">SL</th><th class="text-end">Đơn giá</th><th class="text-end">Thành tiền</th></tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of order.orderItems">
                        <td>
                          <div class="fw-medium">{{ item.productName }}</div>
                          <small class="text-muted">{{ item.productCode }}</small>
                        </td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">{{ item.unitPrice | number:'1.0-0' }} ₫</td>
                        <td class="text-end fw-bold">{{ item.subtotal | number:'1.0-0' }} ₫</td>
                      </tr>
                    </tbody>
                    <tfoot class="table-light">
                      <tr><td colspan="3" class="text-end">Tạm tính:</td><td class="text-end">{{ (order.totalAmount - order.shippingFee + order.discount) | number:'1.0-0' }} ₫</td></tr>
                      <tr *ngIf="order.shippingFee"><td colspan="3" class="text-end">Phí vận chuyển:</td><td class="text-end">{{ order.shippingFee | number:'1.0-0' }} ₫</td></tr>
                      <tr *ngIf="order.discount"><td colspan="3" class="text-end text-success">Giảm giá:</td><td class="text-end text-success">-{{ order.discount | number:'1.0-0' }} ₫</td></tr>
                      <tr><td colspan="3" class="text-end fw-bold fs-5">Tổng cộng:</td><td class="text-end fw-bold fs-5 text-primary">{{ order.totalAmount | number:'1.0-0' }} ₫</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="card shadow-sm mb-4" *ngIf="order.notes">
              <div class="card-header"><h6 class="mb-0"><i class="fas fa-sticky-note me-2"></i>Ghi chú</h6></div>
              <div class="card-body">{{ order.notes }}</div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="col-lg-4">
            <!-- Customer Info -->
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h6 class="mb-0"><i class="fas fa-user me-2"></i>Thông tin khách hàng</h6></div>
              <div class="card-body">
                <div class="mb-2"><strong>Họ tên:</strong> {{ order.customerName }}</div>
                <div class="mb-2"><strong>SĐT:</strong> {{ order.customerPhone }}</div>
                <div class="mb-2" *ngIf="order.customerEmail"><strong>Email:</strong> {{ order.customerEmail }}</div>
                <div><strong>Địa chỉ:</strong> {{ order.shippingAddress }}</div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h6 class="mb-0"><i class="fas fa-credit-card me-2"></i>Thanh toán</h6></div>
              <div class="card-body">
                <div class="mb-2">
                  <strong>Phương thức:</strong>
                  <span class="ms-2">{{ order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : order.paymentMethod }}</span>
                </div>
                <div class="mb-2">
                  <strong>Trạng thái:</strong>
                  <span class="badge ms-2" [ngClass]="order.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                  </span>
                </div>

                <!-- Payment status update -->
                <div class="mt-3">
                  <label class="form-label mb-1">Cập nhật trạng thái thanh toán</label>
                  <select class="form-select form-select-sm mb-2" [(ngModel)]="selectedPaymentStatus">
                    <option value="UNPAID">Chưa thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                  </select>
                  <button class="btn btn-sm btn-outline-primary w-100" (click)="updatePaymentStatus()" [disabled]="updatingPayment || selectedPaymentStatus === order.paymentStatus">
                    <span *ngIf="updatingPayment" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!updatingPayment" class="fas fa-money-check-alt me-2"></i>
                    Cập nhật thanh toán
                  </button>
                </div>
              </div>
            </div>

            <!-- Update Status -->
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h6 class="mb-0"><i class="fas fa-edit me-2"></i>Cập nhật trạng thái</h6></div>
              <div class="card-body">
                <select class="form-select mb-3" [(ngModel)]="selectedStatus">
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="SHIPPING">Đang giao</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
                <button class="btn btn-primary w-100" (click)="updateStatus()" [disabled]="updating || selectedStatus === order.status">
                  <span *ngIf="updating" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!updating" class="fas fa-check me-2"></i>
                  Cập nhật
                </button>
                <div class="alert alert-success mt-2 py-2" *ngIf="successMsg">{{ successMsg }}</div>
              </div>
            </div>

            <!-- Order Date -->
            <div class="card shadow-sm">
              <div class="card-body text-muted text-center small">
                <i class="fas fa-clock me-1"></i>Ngày đặt: {{ order.orderDate | date:'dd/MM/yyyy HH:mm' }}
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <div class="alert alert-danger" *ngIf="error">{{ error }}</div>
    </app-admin-layout>
  `
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | null = null;
  private orderId: number | null = null;
  loading = true;
  updating = false;
  selectedStatus = '';
  error = '';
  successMsg = '';

  // new state for payment update
  selectedPaymentStatus = '';
  updatingPayment = false;

  constructor(private orderService: OrderService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId = +id;
      this.loadOrder();
    }
  }

  private loadOrder(): void {
    if (!this.orderId) return;
    this.orderService.adminGetById(this.orderId).subscribe({
      next: o => {
        this.order = o;
        this.selectedStatus = this.normalizeStatusForSelect(o.status);
        // init payment status select
        this.selectedPaymentStatus = o.paymentStatus || 'UNPAID';
        this.loading = false;
      },
      error: () => {
        this.error = 'Không tìm thấy đơn hàng';
        this.loading = false;
      }
    });
  }

  private normalizeStatusForSelect(status: string): string {
    return status === 'SHIPPED' ? 'SHIPPING' : status;
  }

  updateStatus(): void {
    if (!this.order) return;
    this.updating = true;
    this.successMsg = '';
    this.error = ''; // clear previous error when starting update
    this.orderService.updateStatus(this.order.id, this.selectedStatus).subscribe({
      next: () => {
        this.updating = false;
        this.successMsg = 'Cập nhật trạng thái thành công!';
        this.error = ''; // ensure error is cleared on success
        this.loadOrder();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.error = 'Cập nhật thất bại!'; this.updating = false; }
    });
  }

  // new method: update payment status
  updatePaymentStatus(): void {
    if (!this.order) return;

    // Only allow marking as PAID when order is DELIVERED
    if (this.selectedPaymentStatus === 'PAID' && this.order.status !== 'DELIVERED') {
      this.error = 'Chỉ đơn hàng đã giao mới được chuyển sang trạng thái đã thanh toán.';
      this.successMsg = '';
      return;
    }

    this.updatingPayment = true;
    this.successMsg = '';
    this.error = '';
    this.orderService.updatePaymentStatus(this.order.id, this.selectedPaymentStatus).subscribe({
      next: () => {
        this.updatingPayment = false;
        this.successMsg = 'Cập nhật trạng thái thanh toán thành công!';
        this.error = '';
        this.loadOrder();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => {
        this.updatingPayment = false;
        this.error = 'Cập nhật trạng thái thanh toán thất bại!';
      }
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'bg-warning text-dark', CONFIRMED: 'bg-info',
      SHIPPING: 'bg-primary', SHIPPED: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger'
    };
    return m[s] || 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao', SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy'
    };
    return m[s] || s;
  }
}
