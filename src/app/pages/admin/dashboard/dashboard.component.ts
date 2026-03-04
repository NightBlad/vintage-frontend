import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { AdminService } from '../../../services/admin.service';
import { DashboardStats } from '../../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12">
          <h2 class="fw-bold"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</h2>
          <p class="text-muted">Tổng quan hệ thống quản lý dược phẩm</p>
        </div>
      </div>

      <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>

      <ng-container *ngIf="!loading && stats">
        <!-- Stats Cards -->
        <div class="row mb-5">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-primary-gradient me-3"><i class="fas fa-pills"></i></div>
                <div><h3 class="mb-0">{{ stats.totalProducts }}</h3><small class="text-muted">Tổng sản phẩm</small></div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-success-gradient me-3"><i class="fas fa-folder"></i></div>
                <div><h3 class="mb-0">{{ stats.totalCategories }}</h3><small class="text-muted">Danh mục</small></div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-warning-gradient me-3"><i class="fas fa-users"></i></div>
                <div><h3 class="mb-0">{{ stats.totalUsers }}</h3><small class="text-muted">Người dùng</small></div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm">
              <div class="card-body d-flex align-items-center">
                <div class="stat-icon bg-danger-gradient me-3"><i class="fas fa-exclamation-triangle"></i></div>
                <div><h3 class="mb-0">{{ stats.lowStockCount }}</h3><small class="text-muted">Sắp hết hàng</small></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-5">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-rocket me-2"></i>Thao tác nhanh</h5></div>
              <div class="card-body">
                <div class="row g-3">
                  <div class="col-md-3"><a routerLink="/admin/products/add" class="btn btn-primary w-100"><i class="fas fa-plus me-2"></i>Thêm sản phẩm</a></div>
                  <div class="col-md-3"><a routerLink="/admin/categories/add" class="btn btn-success w-100"><i class="fas fa-plus me-2"></i>Thêm danh mục</a></div>
                  <div class="col-md-3"><a routerLink="/admin/orders" class="btn btn-info w-100 text-white"><i class="fas fa-shopping-cart me-2"></i>Xem đơn hàng</a></div>
                  <div class="col-md-3"><a routerLink="/admin/users" class="btn btn-warning w-100"><i class="fas fa-users me-2"></i>Quản lý user</a></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Low Stock -->
        <div class="row mb-4" *ngIf="stats.lowStockProducts?.length">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header bg-warning text-dark">
                <h5 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i>Sản phẩm sắp hết hàng</h5>
              </div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="table-light"><tr><th>Sản phẩm</th><th>Mã SP</th><th class="text-center">Tồn kho</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let p of stats.lowStockProducts">
                      <td>{{ p.name }}</td>
                      <td>{{ p.productCode }}</td>
                      <td class="text-center"><span class="badge bg-danger">{{ p.stockQuantity }}</span></td>
                      <td><a [routerLink]="['/admin/products', p.id, 'edit']" class="btn btn-primary btn-sm"><i class="fas fa-edit"></i></a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="row" *ngIf="stats.recentOrders?.length">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-shopping-cart me-2"></i>Đơn hàng gần đây</h5>
                <a routerLink="/admin/orders" class="btn btn-outline-primary btn-sm">Xem tất cả</a>
              </div>
              <div class="table-responsive">
                <table class="table mb-0">
                  <thead class="table-light"><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let o of stats.recentOrders">
                      <td><a [routerLink]="['/admin/orders', o.id]">#{{ o.orderNumber }}</a></td>
                      <td>{{ o.customerName }}</td>
                      <td>{{ o.orderDate | date:'dd/MM/yyyy' }}</td>
                      <td class="text-primary fw-bold">{{ o.totalAmount | number:'1.0-0' }} VNĐ</td>
                      <td><span class="badge" [ngClass]="getStatusClass(o.status)">{{ getStatusLabel(o.status) }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </app-admin-layout>
  `
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: s => { this.stats = s; this.loading = false; },
      error: () => this.loading = false
    });
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = { PENDING: 'bg-warning text-dark', CONFIRMED: 'bg-info', SHIPPING: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger' };
    return m[s] || 'bg-secondary';
  }
  getStatusLabel(s: string): string {
    const m: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' };
    return m[s] || s;
  }
}

