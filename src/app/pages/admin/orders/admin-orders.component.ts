import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { OrderService } from '../../../services/order.service';
import { Order, Page } from '../../../models/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12">
          <h2 class="fw-bold"><i class="fas fa-shopping-cart me-2"></i>Quản lý đơn hàng</h2>
          <p class="text-muted mb-0">Tất cả đơn hàng của khách hàng</p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card shadow-sm mb-4">
        <div class="card-body py-2">
          <div class="row g-2 align-items-center">
            <div class="col-lg-8 d-flex flex-wrap gap-2 align-items-center">
              <span class="fw-medium me-2">Lọc trạng thái:</span>
              <button class="btn btn-sm" [ngClass]="currentStatus === '' ? 'btn-primary' : 'btn-outline-secondary'" (click)="filterStatus('')">Tất cả</button>
              <button class="btn btn-sm" [ngClass]="currentStatus === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'" (click)="filterStatus('PENDING')">Chờ xác nhận</button>
              <button class="btn btn-sm" [ngClass]="currentStatus === 'CONFIRMED' ? 'btn-info' : 'btn-outline-info'" (click)="filterStatus('CONFIRMED')">Đã xác nhận</button>
              <button class="btn btn-sm" [ngClass]="currentStatus === 'SHIPPING' ? 'btn-primary' : 'btn-outline-primary'" (click)="filterStatus('SHIPPING')">Đang giao</button>
              <button class="btn btn-sm" [ngClass]="currentStatus === 'DELIVERED' ? 'btn-success' : 'btn-outline-success'" (click)="filterStatus('DELIVERED')">Đã giao</button>
              <button class="btn btn-sm" [ngClass]="currentStatus === 'CANCELLED' ? 'btn-danger' : 'btn-outline-danger'" (click)="filterStatus('CANCELLED')">Đã hủy</button>
            </div>
            <div class="col-lg-4">
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="search" class="form-control" placeholder="Tìm theo mã đơn, tên, SĐT" [(ngModel)]="searchTerm" (ngModelChange)="applySearch()" (keyup.enter)="applySearch()">
                <button class="btn btn-outline-secondary" (click)="clearSearch()" [disabled]="!searchTerm">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-primary"></div>
          </div>

          <div *ngIf="!loading">
            <div class="table-responsive">
              <table class="table table-sm align-middle table-stacked">
                <thead class="table-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>SĐT</th>
                    <th>Ngày đặt</th>
                    <th class="text-end">Tổng tiền</th>
                    <th class="text-center">Thanh toán</th>
                    <th class="text-center">Trạng thái</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of page?.content">
                    <td data-label="Mã đơn"><a [routerLink]="['/admin/orders', o.id]" class="fw-medium" [innerHTML]="highlight('#' + o.orderNumber)"></a></td>
                    <td data-label="Khách hàng" [innerHTML]="highlight(o.customerName)"></td>
                    <td data-label="SĐT" [innerHTML]="highlight(o.customerPhone)"></td>
                    <td data-label="Ngày đặt">{{ o.orderDate | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="text-end fw-bold text-primary" data-label="Tổng tiền">{{ o.totalAmount | number:'1.0-0' }} ₫</td>
                    <td class="text-center" data-label="Thanh toán">
                      <span class="badge" [ngClass]="o.paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning text-dark'">
                        {{ o.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
                      </span>
                    </td>
                    <td class="text-center" data-label="Trạng thái">
                      <span class="badge" [ngClass]="getStatusClass(o.status)">{{ getStatusLabel(o.status) }}</span>
                    </td>
                    <td class="text-center" data-label="Thao tác">
                      <a [routerLink]="['/admin/orders', o.id]" class="btn btn-primary btn-sm">
                        <i class="fas fa-eye"></i>
                      </a>
                    </td>
                  </tr>
                  <tr *ngIf="!page?.content?.length">
                    <td colspan="8" class="text-center text-muted py-4">Không có đơn hàng nào</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav *ngIf="page && page.totalPages > 1" class="mt-3">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="page.first">
                  <button class="page-link" (click)="loadPage(currentPage - 1)"><i class="fas fa-chevron-left"></i></button>
                </li>
                <li class="page-item" *ngFor="let n of getPages()" [class.active]="n === currentPage">
                  <button class="page-link" (click)="loadPage(n)">{{ n + 1 }}</button>
                </li>
                <li class="page-item" [class.disabled]="page.last">
                  <button class="page-link" (click)="loadPage(currentPage + 1)"><i class="fas fa-chevron-right"></i></button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </app-admin-layout>
  `
})
export class AdminOrdersComponent implements OnInit {
  page: Page<Order> | null = null;
  loading = true;
  currentPage = 0;
  currentStatus = '';
  searchTerm = '';
  private _searchDebounce: any;

  constructor(private orderService: OrderService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(p: number): void {
    this.loading = true;
    this.currentPage = p;
    const q = this.searchTerm ? this.searchTerm.trim() : undefined;
    this.orderService.adminGetAll(p, 10, this.currentStatus || undefined, q).subscribe({
      next: data => { this.page = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  filterStatus(status: string): void {
    this.currentStatus = status;
    this.loadPage(0);
  }

  applySearch(): void {
    if (this._searchDebounce) {
      clearTimeout(this._searchDebounce);
    }
    this._searchDebounce = setTimeout(() => this.loadPage(0), 250);
  }

  clearSearch(): void {
    if (!this.searchTerm) return;
    this.searchTerm = '';
    this.loadPage(0);
  }

   highlight(value: string | number | undefined | null): SafeHtml {
    const text = value == null ? '' : String(value);
    if (!this.searchTerm) return text;
    const escaped = this.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    const html = text.replace(re, match => `<mark>${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getPages(): number[] {
    if (!this.page) return [];
    return Array.from({ length: this.page.totalPages }, (_, i) => i);
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'bg-warning text-dark', CONFIRMED: 'bg-info',
      SHIPPING: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger'
    };
    return m[s] || 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = {
      PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy'
    };
    return m[s] || s;
  }
}

