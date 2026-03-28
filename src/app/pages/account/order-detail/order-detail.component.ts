import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { Order, OrderItem } from '../../../models/models';
import { PRODUCT_PLACEHOLDER_IMAGE, resolveImageUrl } from '../../../utils/product-image.util';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent, FormsModule],
  template: `
    <app-layout>
      <div class="container my-5" *ngIf="order">
        <div class="alert alert-success" *ngIf="successMsg"><i class="fas fa-check-circle me-2"></i>{{ successMsg }}</div>
        <div class="alert alert-danger" *ngIf="errorMsg"><i class="fas fa-exclamation-circle me-2"></i>{{ errorMsg }}</div>

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
                    <tr>
                      <th width="72">Ảnh</th>
                      <th>Sản phẩm</th>
                      <th class="text-center">SL</th>
                      <th class="text-end">Đơn giá</th>
                      <th class="text-end">Thành tiền</th>
                      <th *ngIf="order.status === 'DELIVERED'" class="text-center">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of order.orderItems">
                      <td>
                        <img [src]="getItemImageUrl(item)" width="52" height="52" class="rounded" style="object-fit:cover" alt="" (error)="onImageError($event)">
                      </td>
                      <td>
                        <strong>{{ item.productName || item.product?.name }}</strong>
                        <br><small class="text-muted">{{ item.productCode || item.product?.productCode }}</small>
                      </td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">{{ (item.unitPrice || item.price) | number:'1.0-0' }} VNĐ</td>
                      <td class="text-end fw-bold text-primary">{{ (item.subtotal || item.totalPrice) | number:'1.0-0' }} VNĐ</td>
                      <td *ngIf="order.status === 'DELIVERED'" class="text-center">
                        <button class="btn btn-sm btn-outline-primary" (click)="openReviewForm(item)">
                          <i class="fas fa-star me-1"></i>Đánh giá
                        </button>
                      </td>
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
                <p><strong>Thanh toán:</strong> {{ getPaymentMethodLabel(order.paymentMethod) }}</p>
                <p><strong>Trạng thái TT:</strong>
                  <span class="badge" [ngClass]="getPaymentStatusClass(order.paymentStatus)">
                    {{ getPaymentStatusLabel(order.paymentStatus) }}
                  </span>
                </p>
                <hr>
                <p><strong>Người nhận:</strong> {{ order.customerName }}</p>
                <p><strong>SĐT:</strong> {{ order.customerPhone }}</p>
                <p><strong>Địa chỉ:</strong> {{ order.shippingAddress }}</p>
                <p *ngIf="order.notes"><strong>Ghi chú:</strong> {{ order.notes }}</p>
                <hr>
                <div class="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{{ getSubtotal() | number:'1.0-0' }} VNĐ</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span *ngIf="order.shippingFee > 0">{{ order.shippingFee | number:'1.0-0' }} VNĐ</span>
                  <span *ngIf="!order.shippingFee || order.shippingFee === 0" class="text-success fw-bold">Miễn phí</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between fw-bold h5">
                  <span>Tổng cộng:</span>
                  <span class="text-primary">{{ order.totalAmount | number:'1.0-0' }} VNĐ</span>
                </div>
              </div>
            </div>

            <button class="btn btn-danger w-100 mb-3"
                    *ngIf="order.status === 'PENDING' || order.status === 'CONFIRMED'"
                    [disabled]="cancelling"
                    (click)="cancelOrder()">
              <span class="spinner-border spinner-border-sm me-2" *ngIf="cancelling"></span>
              <i class="fas fa-times me-2" *ngIf="!cancelling"></i>Hủy đơn hàng
            </button>

            <a routerLink="/account/orders" class="btn btn-outline-secondary w-100">
              <i class="fas fa-arrow-left me-2"></i>Quay lại danh sách đơn hàng
            </a>
          </div>
        </div>
      </div>
      <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

      <!-- Simple review modal -->
      <div class="modal fade show d-block" tabindex="-1" role="dialog" *ngIf="reviewingItem">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                Đánh giá sản phẩm
                <small class="text-muted d-block">
                  {{ reviewingItem?.productName || reviewingItem?.product?.name }}
                </small>
              </h5>
              <button type="button" class="btn-close" (click)="closeReviewForm()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Số sao</label>
                <div class="d-flex gap-1">
                  <i *ngFor="let s of [1,2,3,4,5]"
                     class="fas"
                     [ngClass]="s <= reviewForm.rating ? 'fa-star text-warning' : 'fa-star text-secondary'"
                     style="cursor:pointer"
                     (click)="setRating(s)"></i>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Nhận xét</label>
                <textarea class="form-control" rows="3"
                          [(ngModel)]="reviewForm.comment"
                          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeReviewForm()">Đóng</button>
              <button class="btn btn-primary"
                      [disabled]="submittingReview || !reviewForm.rating"
                      (click)="submitReview()">
                <span *ngIf="submittingReview" class="spinner-border spinner-border-sm me-2"></span>
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" *ngIf="reviewingItem"></div>
    </app-layout>
  `
})
export class OrderDetailComponent implements OnInit {
  readonly placeholderImage = PRODUCT_PLACEHOLDER_IMAGE;
  order: any = null;
  loading = true;
  cancelling = false;
  successMsg = '';
  errorMsg = '';

  reviewingItem: OrderItem | null = null;
  submittingReview = false;
  reviewForm = {
    rating: 0,
    comment: ''
  };

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.orderService.getById(id).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => this.loading = false
    });
  }

  cancelOrder(): void {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    this.cancelling = true;
    this.errorMsg = '';
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: () => {
        this.cancelling = false;
        this.successMsg = 'Đơn hàng đã được hủy thành công.';
        this.order.status = 'CANCELLED';
      },
      error: (err: any) => {
        this.cancelling = false;
        this.errorMsg = err.error?.error || err.error?.message || 'Không thể hủy đơn hàng.';
      }
    });
  }

  getSubtotal(): number {
    if (!this.order?.orderItems) return 0;
    return this.order.orderItems.reduce((sum: number, item: any) =>
      sum + (item.subtotal || item.totalPrice || 0), 0);
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
      COD: 'Tiền mặt khi nhận hàng', BANK_TRANSFER: 'Chuyển khoản ngân hàng',
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

  getItemImageUrl(item: any): string {
    return resolveImageUrl(item?.product?.imageUrl ?? item?.productImage ?? null);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img || img.getAttribute('src') === this.placeholderImage) return;
    img.src = this.placeholderImage;
  }

  openReviewForm(item: OrderItem): void {
    this.reviewingItem = item;
    this.reviewForm = { rating: 0, comment: '' };
  }

  closeReviewForm(): void {
    this.reviewingItem = null;
    this.submittingReview = false;
  }

  setRating(r: number): void {
    this.reviewForm.rating = r;
  }

  submitReview(): void {
    if (!this.reviewingItem || !this.order) return;
    if (!this.reviewForm.rating) return;

    this.submittingReview = true;
    this.errorMsg = '';
    this.successMsg = '';

    const productId = this.reviewingItem.product?.id ?? (this.reviewingItem as any).productId;
    if (!productId) {
      this.submittingReview = false;
      this.errorMsg = 'Không xác định được sản phẩm để đánh giá.';
      return;
    }

    const payload = {
      orderId: this.order.id,
      orderItemId: (this.reviewingItem as any).id,
      rating: this.reviewForm.rating,
      comment: this.reviewForm.comment?.trim() || ''
    };

    this.productService.createReview(productId, payload).subscribe({
      next: () => {
        this.submittingReview = false;
        this.successMsg = 'Cảm ơn bạn đã đánh giá sản phẩm!';
        this.closeReviewForm();
      },
      error: (err) => {
        this.submittingReview = false;
        this.errorMsg = err?.error?.message || err?.error?.error || 'Không thể gửi đánh giá. Vui lòng thử lại.';
      }
    });
  }
}
