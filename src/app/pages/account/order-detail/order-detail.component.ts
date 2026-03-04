import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5" *ngIf="order">
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/">Trang chủ</a></li>
            <li class="breadcrumb-item"><a routerLink="/account/orders">Đơn hàng</a></li>
            <li class="breadcrumb-item active">#{{ order.orderNumber }}</li>
          </ol>
        </nav>
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold"><i class="fas fa-receipt me-2 text-primary"></i>Chi tiết đơn hàng</h2>
          <span class="badge fs-6 px-3 py-2" [ngClass]="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span>
        </div>

        <div class="row g-4">
          <div class="col-lg-8">
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h6 class="mb-0"><i class="fas fa-list me-2"></i>Sản phẩm đã đặt</h6></div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="table-light">
                    <tr><th>Sản phẩm</th><th class="text-center">SL</th><th class="text-end">Đơn giá</th><th class="text-end">Thành tiền</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of order.orderItems">
                      <td><strong>{{ item.productName }}</strong><br><small class="text-muted">{{ item.productCode }}</small></td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">{{ item.unitPrice | number:'1.0-0' }} VNĐ</td>
                      <td class="text-end fw-bold text-primary">{{ item.subtotal | number:'1.0-0' }} VNĐ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card shadow-sm mb-4">
              <div class="card-header"><h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Thông tin đơn hàng</h6></div>
              <div class="card-body">
                <p><strong>Mã đơn:</strong> #{{ order.orderNumber }}</p>
                <p><strong>Ngày đặt:</strong> {{ order.orderDate | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>Thanh toán:</strong> {{ order.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng' : 'Chuyển khoản' }}</p>
                <p><strong>Trạng thái TT:</strong>
                  <span class="badge" [ngClass]="order.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                  </span>
                </p>
                <hr>
                <p><strong>Người nhận:</strong> {{ order.customerName }}</p>
                <p><strong>SĐT:</strong> {{ order.customerPhone }}</p>
                <p><strong>Địa chỉ:</strong> {{ order.shippingAddress }}</p>
                <p *ngIf="order.notes"><strong>Ghi chú:</strong> {{ order.notes }}</p>
                <hr>
                <div class="d-flex justify-content-between fw-bold h5">
                  <span>Tổng cộng:</span>
                  <span class="text-primary">{{ order.totalAmount | number:'1.0-0' }} VNĐ</span>
                </div>
              </div>
            </div>
            <a routerLink="/account/orders" class="btn btn-outline-secondary w-100">
              <i class="fas fa-arrow-left me-2"></i>Quay lại
            </a>
          </div>
        </div>
      </div>
      <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>
    </app-layout>
  `
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(private orderService: OrderService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.orderService.getById(id).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-warning text-dark', CONFIRMED: 'bg-info', SHIPPING: 'bg-primary',
      DELIVERED: 'bg-success', CANCELLED: 'bg-danger'
    };
    return map[s] || 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy'
    };
    return map[s] || s;
  }
}
