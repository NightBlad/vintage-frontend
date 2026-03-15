import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem, CartResponse } from '../../models/models';
import { resolveProductImageUrl } from '../../utils/product-image.util';
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <h2 class="fw-bold mb-3"><i class="fas fa-shopping-cart me-2 text-primary"></i>Giỏ hàng của bạn</h2>
        <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>
        <ng-container *ngIf="!loading">
          <div class="row" *ngIf="!isCartEmpty">
            <div class="col-lg-8">
              <div class="card shadow-sm">
                <div class="card-header"><h5 class="mb-0">Sản phẩm ({{ displayTotalItems }})</h5></div>
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table align-middle mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Sản phẩm</th>
                          <th class="text-center">SL</th>
                          <th class="text-end">Đơn giá</th>
                          <th class="text-end">Tổng</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of cartItems">
                          <td>
                            <div class="d-flex align-items-center gap-2">
                              <img *ngIf="item.imageUrl" [src]="getImageUrl(item.imageUrl)" width="50" height="50" style="object-fit:cover;border-radius:6px" alt="">
                              <div>
                                <div class="fw-medium">{{ item.productName }}</div>
                                <small class="text-muted">#{{ item.productId }}</small>
                              </div>
                            </div>
                          </td>
                          <td class="text-center">
                            <div class="input-group input-group-sm" style="width:100px">
                              <button
                                class="btn btn-outline-secondary"
                                (click)="updateQty(item.productId, item.quantity - 1)"
                                [disabled]="item.quantity <= 1 || isUpdating(item.productId) || isCartMutating">
                                <i class="fas fa-minus"></i>
                              </button>
                              <input type="text" class="form-control text-center" [value]="item.quantity" readonly aria-label="So luong">
                              <button
                                class="btn btn-outline-secondary"
                                (click)="updateQty(item.productId, item.quantity + 1)"
                                [disabled]="item.quantity >= item.stockQuantity || isUpdating(item.productId) || isCartMutating">
                                <i class="fas fa-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td class="text-end">{{ item.price | currency:'VND':'symbol':'1.0-0':'vi' }}</td>
                          <td class="text-end fw-bold text-primary">{{ item.subtotal | currency:'VND':'symbol':'1.0-0':'vi' }}</td>
                          <td>
                            <button
                              class="btn btn-outline-danger btn-sm"
                              (click)="removeItem(item.productId)"
                              [disabled]="isUpdating(item.productId) || isCartMutating">
                              <i class="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="card shadow-sm">
                <div class="card-header"><h5 class="mb-0">Tóm tắt</h5></div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Tổng ({{ displayTotalItems }} sp):</span>
                    <span>{{ displayTotalAmount | currency:'VND':'symbol':'1.0-0':'vi' }}</span>
                  </div>
                  <hr>
                  <div class="d-flex justify-content-between fw-bold h5">
                    <span>Tổng cộng:</span>
                    <span class="text-primary">{{ displayTotalAmount | currency:'VND':'symbol':'1.0-0':'vi' }}</span>
                  </div>
                  <a routerLink="/checkout" class="btn btn-primary w-100 mt-3" [class.disabled]="isCartMutating" [attr.aria-disabled]="isCartMutating">
                    <i class="fas fa-credit-card me-2"></i>Thanh toán
                  </a>
                  <a routerLink="/products" class="btn btn-outline-secondary w-100 mt-2"><i class="fas fa-arrow-left me-2"></i>Tiếp tục mua sắm</a>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center py-5" *ngIf="isCartEmpty">
            <i class="fas fa-shopping-cart fa-3x text-muted mb-3 d-block"></i>
            <h4 class="text-muted">Giỏ hàng trống</h4>
            <a routerLink="/products" class="btn btn-primary mt-3">Bắt đầu mua sắm</a>
          </div>
        </ng-container>
      </div>
    </app-layout>
  `
})
export class CartComponent implements OnInit {
  cart: CartResponse | null = null;
  loading = true;
  private readonly updatingItems = new Set<number>();
  constructor(private cartService: CartService, public authService: AuthService) {}
  ngOnInit(): void {
    this.loadCart();
  }
  get cartItems(): CartItem[] {
    return this.cart?.items ?? [];
  }
  get displayTotalItems(): number {
    if (typeof this.cart?.totalItems === 'number' && Number.isFinite(this.cart.totalItems)) {
      return this.cart.totalItems;
    }
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }
  get displayTotalAmount(): number {
    if (typeof this.cart?.totalAmount === 'number' && Number.isFinite(this.cart.totalAmount)) {
      return this.cart.totalAmount;
    }
    return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }
  get isCartEmpty(): boolean {
    return this.cartItems.length === 0;
  }
  get isCartMutating(): boolean {
    return this.updatingItems.size > 0;
  }
  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (c: CartResponse) => {
        this.cart = c;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
  updateQty(productId: number, qty: number): void {
    if (qty < 1 || this.isUpdating(productId) || this.isCartMutating) {
      return;
    }
    const previousCart = this.cart;
    this.startMutation(productId);
    this.cartService.updateItem(productId, qty).subscribe({
      next: (c: CartResponse) => {
        this.cart = c;
      },
      error: () => {
        this.cart = previousCart;
      },
      complete: () => {
        this.finishMutation(productId);
      }
    });
  }
  removeItem(productId: number): void {
    if (this.isUpdating(productId) || this.isCartMutating) {
      return;
    }
    const previousCart = this.cart;
    this.startMutation(productId);
    this.cartService.removeItem(productId).subscribe({
      next: (c: CartResponse) => {
        this.cart = c;
      },
      error: () => {
        this.cart = previousCart;
      },
      complete: () => {
        this.finishMutation(productId);
      }
    });
  }
  isUpdating(productId: number): boolean {
    return this.updatingItems.has(productId);
  }
  getImageUrl(url: string): string {
    return resolveProductImageUrl(url);
  }
  private startMutation(productId: number): void {
    this.updatingItems.add(productId);
  }
  private finishMutation(productId: number): void {
    this.updatingItems.delete(productId);
  }
}
