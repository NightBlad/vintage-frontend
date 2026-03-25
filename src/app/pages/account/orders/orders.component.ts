import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { OrderService } from '../../../services/order.service';
import { Order, Page } from '../../../models/models';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from '../../../utils/product-image.util';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <h2 class="fw-bold mb-4"><i class="fas fa-box me-2 text-primary"></i>Đơn hàng của tôi</h2>
        <div class="alert alert-success" *ngIf="successMsg"><i class="fas fa-check-circle me-2"></i>{{ successMsg }}</div>
        <div class="alert alert-danger" *ngIf="errorMsg"><i class="fas fa-exclamation-circle me-2"></i>{{ errorMsg }}</div>
        <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

        <div *ngIf="!loading && ordersPage?.content?.length">
          <div class="card mb-3 shadow-sm" *ngFor="let order of ordersPage!.content">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>#{{ order.orderNumber }}</strong>
                <small class="text-muted ms-2">{{ order.orderDate | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <span class="badge" [ngClass]="getPaymentStatusClass(order.paymentStatus)">{{ getPaymentStatusLabel(order.paymentStatus) }}</span>
                <span class="badge" [ngClass]="getStatusClass(order.status)">{{ getStatusLabel(order.status) }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                  <img [src]="getOrderImageUrl(order)" width="56" height="56" class="rounded" style="object-fit:cover" alt="" (error)="onImageError($event)">
                  <div>
                    <p class="mb-1"><i class="fas fa-shopping-bag me-2 text-muted"></i>{{ order.orderItems?.length || order.itemCount || 0 }} sản phẩm</p>
                    <p class="mb-0"><i class="fas fa-map-marker-alt me-2 text-muted"></i>{{ order.shippingAddress }}</p>
                    <p class="mb-0 mt-1"><small class="text-muted"><i class="fas fa-credit-card me-1"></i>{{ getPaymentMethodLabel(order.paymentMethod) }}</small></p>
                  </div>
                </div>
                <div class="text-end">
                  <div class="h5 text-primary fw-bold mb-2">{{ order.totalAmount | number:'1.0-0' }} VNĐ</div>
                  <div class="d-flex gap-2">
                    <a [routerLink]="['/account/orders', order.id]" class="btn btn-primary btn-sm">
                      <i class="fas fa-eye me-1"></i>Xem
                    </a>
                    <button class="btn btn-outline-danger btn-sm"
                            *ngIf="order.status === 'PENDING' || order.status === 'CONFIRMED'"
                            (click)="cancel(order.id)">
                      <i class="fas fa-times me-1"></i>Hủy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-5" *ngIf="!loading && !ordersPage?.content?.length">
          <i class="fas fa-box-open fa-3x text-muted mb-3 d-block"></i>
          <h4 class="text-muted">Bạn chưa có đơn hàng nào</h4>
          <a routerLink="/products" class="btn btn-primary mt-3">Bắt đầu mua sắm</a>
        </div>
      </div>
    </app-layout>
  `
})
export class OrdersComponent implements OnInit {
  readonly placeholderImage = PRODUCT_PLACEHOLDER_IMAGE;
  ordersPage: Page<Order> | null = null;
  loading = true;
  successMsg = '';
  errorMsg = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: p => { this.ordersPage = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  cancel(id: number): void {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    this.orderService.cancelOrder(id).subscribe({
      next: () => { this.successMsg = 'Đơn hàng đã được hủy.'; this.load(); },
      error: (err: any) => this.errorMsg = err.error?.error || err.error?.message || 'Không thể hủy đơn hàng.'
    });
  }

  getStatusClass(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-warning text-dark', CONFIRMED: 'bg-info', PROCESSING: 'bg-primary',
      SHIPPED: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger'
    };
    return map[s] || 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang xử lý',
      SHIPPED: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy'
    };
    return map[s] || s;
  }

  getPaymentMethodLabel(m: string): string {
    const map: Record<string, string> = {
      COD: 'Thanh toán khi nhận hàng', BANK_TRANSFER: 'Chuyển khoản',
      CREDIT_CARD: 'Thẻ tín dụng', E_WALLET: 'Ví điện tử'
    };
    return map[m] || m;
  }

  getPaymentStatusLabel(s: string): string {
    const map: Record<string, string> = { PAID: 'Đã thanh toán', UNPAID: 'Chưa thanh toán', REFUNDED: 'Đã hoàn tiền' };
    return map[s] || s;
  }

  getPaymentStatusClass(s: string): string {
    const map: Record<string, string> = { PAID: 'bg-success', UNPAID: 'bg-warning text-dark', REFUNDED: 'bg-info' };
    return map[s] || 'bg-secondary';
  }

  getOrderImageUrl(order: any): string {
    const firstItem = order.orderItems?.[0];
    return resolveImageUrl(firstItem?.product?.imageUrl ?? firstItem?.productImage ?? null);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.getAttribute('src') === this.placeholderImage) return;
    img.src = this.placeholderImage;
  }
}
