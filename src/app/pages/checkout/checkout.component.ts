import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CartSummary } from '../../models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <nav aria-label="breadcrumb" class="mb-4">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a routerLink="/">Trang chủ</a></li>
            <li class="breadcrumb-item"><a routerLink="/cart">Giỏ hàng</a></li>
            <li class="breadcrumb-item active">Thanh toán</li>
          </ol>
        </nav>
        <h2 class="fw-bold"><i class="fas fa-credit-card me-2 text-primary"></i>Thanh toán đơn hàng</h2>

        <div class="alert alert-danger" *ngIf="errorMsg"><i class="fas fa-exclamation-circle me-2"></i>{{ errorMsg }}</div>

        <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

        <form (ngSubmit)="placeOrder()" #f="ngForm" *ngIf="!loading && cart">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="card mb-4">
                <div class="card-header"><h5 class="mb-0"><i class="fas fa-shipping-fast me-2"></i>Thông tin giao hàng</h5></div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Họ tên người nhận *</label>
                      <input type="text" class="form-control" required [(ngModel)]="form.fullName" name="fullName">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Số điện thoại *</label>
                      <input type="tel" class="form-control" required [(ngModel)]="form.phone" name="phone">
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-bold">Địa chỉ giao hàng *</label>
                      <textarea class="form-control" rows="3" required [(ngModel)]="form.address" name="address"></textarea>
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-bold">Ghi chú</label>
                      <textarea class="form-control" rows="2" [(ngModel)]="form.notes" name="notes"></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-header"><h5 class="mb-0"><i class="fas fa-credit-card me-2"></i>Phương thức thanh toán</h5></div>
                <div class="card-body">
                  <div class="form-check mb-3">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="cod" value="COD" [(ngModel)]="form.paymentMethod">
                    <label class="form-check-label" for="cod">
                      <i class="fas fa-money-bill-wave me-2 text-success"></i><strong>Thanh toán khi nhận hàng (COD)</strong>
                      <div class="text-muted small">Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng</div>
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentMethod" id="bank" value="BANK_TRANSFER" [(ngModel)]="form.paymentMethod">
                    <label class="form-check-label" for="bank">
                      <i class="fas fa-university me-2 text-primary"></i><strong>Chuyển khoản ngân hàng</strong>
                      <div class="text-muted small">Chuyển khoản trước, giao hàng sau khi xác nhận thanh toán</div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-lg-4">
              <div class="card shadow-sm">
                <div class="card-header"><h5 class="mb-0"><i class="fas fa-receipt me-2"></i>Đơn hàng của bạn</h5></div>
                <div class="card-body">
                  <div class="mb-3" *ngFor="let item of cart.items">
                    <div class="d-flex justify-content-between">
                      <span class="text-truncate me-2">{{ item.productName }} x{{ item.quantity }}</span>
                      <span class="text-nowrap">{{ item.subtotal | number:'1.0-0' }} VNĐ</span>
                    </div>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Tiền sản phẩm:</span>
                    <span>{{ cart.totalAmount | number:'1.0-0' }} VNĐ</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2">
                    <span>Phí vận chuyển:</span>
                    <span [class.text-success]="shippingFee === 0">
                      {{ shippingFee === 0 ? '0 VNĐ (Miễn phí)' : (shippingFee | number:'1.0-0') + ' VNĐ' }}
                    </span>
                  </div>
                  <div class="small text-success mb-2" *ngIf="shippingFee === 0">
                    Miễn phí ship cho đơn trên {{ freeShippingThreshold | number:'1.0-0' }} VNĐ.
                  </div>
                  <div class="d-flex justify-content-between mb-3" *ngIf="shippingFee > 0">
                    <span class="small text-muted">Mua thêm {{ amountToFreeShipping | number:'1.0-0' }} VNĐ để được miễn phí ship</span>
                  </div>
                  <div class="d-flex justify-content-between fw-bold h5">
                    <span>Tổng thanh toán:</span>
                    <span class="text-primary">{{ grandTotal | number:'1.0-0' }} VNĐ</span>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 mt-3 btn-lg" [disabled]="f.invalid || submitting">
                    <span class="spinner-border spinner-border-sm me-2" *ngIf="submitting"></span>
                    <i class="fas fa-check-circle me-2" *ngIf="!submitting"></i>Đặt hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </app-layout>
  `
})
export class CheckoutComponent implements OnInit {
  cart: CartSummary | null = null;
  loading = true;
  submitting = false;
  errorMsg = '';
  form = { fullName: '', phone: '', address: '', notes: '', paymentMethod: 'COD' };

  get freeShippingThreshold(): number {
    return this.cart?.freeShippingThreshold ?? 500000;
  }

  get shippingFee(): number {
    if (!this.cart) return 0;
    if (typeof this.cart.shippingFee === 'number') return this.cart.shippingFee;
    return this.cart.totalAmount > this.freeShippingThreshold ? 0 : 30000;
  }

  get grandTotal(): number {
    if (!this.cart) return 0;
    if (typeof this.cart.grandTotal === 'number') return this.cart.grandTotal;
    return this.cart.totalAmount + this.shippingFee;
  }

  get amountToFreeShipping(): number {
    if (!this.cart) return 0;
    return Math.max(0, this.freeShippingThreshold - this.cart.totalAmount);
  }

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.form.fullName = user.fullName;
    }
    this.cartService.getCart().subscribe({
      next: (c: CartSummary) => { this.cart = c; this.loading = false; if (!c.items.length) this.router.navigate(['/cart']); },
      error: () => this.loading = false
    });
  }

  placeOrder(): void {
    this.submitting = true;
    this.orderService.placeOrder(this.form).subscribe({
      next: (order: any) => {
        this.submitting = false;
        const orderId = order?.id ?? order?.orderId;
        this.router.navigate(orderId ? ['/account/orders', orderId] : ['/account/orders']);
      },
      error: (err: any) => {
        this.submitting = false;
        this.errorMsg = err.error?.error || err.error?.message || 'Có lỗi xảy ra khi đặt hàng.';
      }
    });
  }
}
