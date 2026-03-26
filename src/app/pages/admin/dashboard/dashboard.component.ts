import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { AdminService } from '../../../services/admin.service';
import {
  DashboardInsight,
  DashboardSalesSummary,
  DashboardStats,
  DashboardStatusStat,
  DashboardTopSellingProduct,
  DashboardTimeSeries,
  DashboardTimeSeriesRow,
  DashboardRevenueSummary
} from '../../../models/models';

interface TopSellingProduct {
  productId: number | null;
  productName: string;
  quantity: number;
  revenue: number;
}

interface OrderStatusStat {
  status: string;
  label: string;
  className: string;
  count: number;
  share: number;
}

interface SalesInsight {
  tone: 'success' | 'warning' | 'info';
  message: string;
  link?: string;
  linkLabel?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminLayoutComponent],
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

        <!-- Sales Report -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Báo cáo bán hàng nhanh</h5>
              <small class="text-muted">Dữ liệu được tính trên đơn hàng gần đây</small>
            </div>
          </div>
        </div>

        <div class="row mb-5">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-primary border-4">
              <div class="card-body">
                <small class="text-muted">Đơn hàng gần đây</small>
                <h4 class="fw-bold mb-0">{{ recentOrderCount }}</h4>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-success border-4">
              <div class="card-body">
                <small class="text-muted">Doanh thu đã giao gần đây</small>
                <h4 class="fw-bold mb-0 text-success">{{ recentRevenue | number:'1.0-0' }} VNĐ</h4>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-info border-4">
              <div class="card-body">
                <small class="text-muted">Giá trị đơn trung bình</small>
                <h4 class="fw-bold mb-0 text-info">{{ recentAov | number:'1.0-0' }} VNĐ</h4>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-danger border-4">
              <div class="card-body">
                <small class="text-muted">Tỷ lệ hủy gần đây</small>
                <h4 class="fw-bold mb-0 text-danger">{{ recentCancellationRate | number:'1.0-1' }}%</h4>
              </div>
            </div>
          </div>
        </div>

        <!-- Doanh thu theo kỳ & tồn kho -->
        <div class="row mb-5">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-success border-4 h-100">
              <div class="card-body">
                <small class="text-muted">Doanh thu hôm nay</small>
                <h4 class="fw-bold mb-0 text-success">{{ (revenueSummary?.today ?? 0) | number:'1.0-0' }} VNĐ</h4>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-primary border-4 h-100">
              <div class="card-body">
                <small class="text-muted">Doanh thu tuần</small>
                <h4 class="fw-bold mb-0 text-primary">{{ (revenueSummary?.thisWeek ?? 0) | number:'1.0-0' }} VNĐ</h4>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-info border-4 h-100">
              <div class="card-body">
                <small class="text-muted">Doanh thu tháng</small>
                <h4 class="fw-bold mb-0 text-info">{{ (revenueSummary?.thisMonth ?? 0) | number:'1.0-0' }} VNĐ</h4>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card shadow-sm border-start border-warning border-4 h-100">
              <div class="card-body">
                <small class="text-muted">Giá trị hàng tồn kho</small>
                <h4 class="fw-bold mb-0 text-warning">{{ inventoryValue | number:'1.0-0' }} VNĐ</h4>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-5" *ngIf="salesInsights.length">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-bullseye me-2"></i>Gợi ý hành động cho sale</h5></div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center" *ngFor="let insight of salesInsights">
                  <span>
                    <i class="fas me-2" [ngClass]="{ 'fa-circle-check text-success': insight.tone === 'success', 'fa-triangle-exclamation text-warning': insight.tone === 'warning', 'fa-circle-info text-info': insight.tone === 'info' }"></i>
                    {{ insight.message }}
                  </span>
                  <a *ngIf="insight.link && insight.linkLabel" [routerLink]="insight.link" class="btn btn-sm btn-outline-primary">{{ insight.linkLabel }}</a>
                </li>
              </ul>
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

        <div class="row mb-4">
          <div class="col-lg-7 mb-4 mb-lg-0">
            <div class="card shadow-sm h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-medal me-2"></i>Top sản phẩm bán chạy</h5>
                <small class="text-muted" *ngIf="recentOrderCount">Top 5</small>
              </div>
              <div class="table-responsive">
                <table class="table mb-0" *ngIf="topSellingProducts.length; else noTopProducts">
                  <thead class="table-light">
                    <tr><th>Sản phẩm</th><th class="text-center">Số lượng</th><th class="text-end">Doanh thu</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of topSellingProducts">
                      <td>{{ p.productName }}</td>
                      <td class="text-center"><span class="badge bg-primary">{{ p.quantity }}</span></td>
                      <td class="text-end fw-bold text-success">{{ p.revenue | number:'1.0-0' }} VNĐ</td>
                    </tr>
                  </tbody>
                </table>
                <ng-template #noTopProducts>
                  <div class="text-center py-4 text-muted">Chưa có dữ liệu để xếp hạng sản phẩm</div>
                </ng-template>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card shadow-sm h-100">
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Phân bổ trạng thái đơn</h5></div>
              <div class="card-body" *ngIf="statusStats.length; else noStatusStats">
                <div class="mb-3" *ngFor="let s of statusStats">
                  <div class="d-flex justify-content-between small mb-1">
                    <span>{{ s.label }}</span>
                    <span>{{ s.count }} ({{ s.share | number:'1.0-0' }}%)</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div class="progress-bar" [ngClass]="s.className" [style.width.%]="s.share"></div>
                  </div>
                </div>
              </div>
              <ng-template #noStatusStats>
                <div class="card-body text-center text-muted">Không có dữ liệu trạng thái đơn hàng</div>
              </ng-template>
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

        <!-- Chuỗi thời gian (biểu đồ + chọn ngày) -->
        <div class="row mb-4" *ngIf="timeSeries">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div class="d-flex align-items-center gap-2">
                  <h5 class="mb-0"><i class="fas fa-chart-area me-2"></i>Biểu đồ doanh thu / số đơn</h5>
                  <select class="form-select form-select-sm w-auto" [(ngModel)]="selectedSeries">
                    <option value="daily">Theo ngày</option>
                    <option value="weekly">Theo tuần</option>
                    <option value="monthly">Theo tháng</option>
                  </select>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <div class="d-flex align-items-center gap-1">
                    <small class="text-muted">Từ</small>
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="fromDate">
                  </div>
                  <div class="d-flex align-items-center gap-1">
                    <small class="text-muted">Đến</small>
                    <input type="date" class="form-control form-control-sm" [(ngModel)]="toDate">
                  </div>
                  <button class="btn btn-sm btn-outline-secondary" (click)="exportSeriesCsv()" [disabled]="!filteredSeries.length">
                    <i class="fas fa-file-download me-1"></i>Xuất CSV
                  </button>
                </div>
              </div>
              <div class="card-body">
                <ng-container *ngIf="filteredSeries.length; else noSeries">
                  <div class="mb-3 d-flex justify-content-between flex-wrap gap-2 small text-muted">
                    <span>Tổng doanh thu: <strong class="text-primary">{{ filteredRevenueTotal | number:'1.0-0' }} VNĐ</strong></span>
                    <span>Tổng số đơn: <strong>{{ filteredOrderTotal }}</strong></span>
                  </div>
                  <div class="position-relative" style="min-height: 220px;">
                    <svg [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight" preserveAspectRatio="xMidYMid meet" class="w-100" style="height:240px;">
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#0d6efd" stop-opacity="0.35"></stop>
                          <stop offset="100%" stop-color="#0d6efd" stop-opacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <g class="chart-grid">
                        <line *ngFor="let y of chartGridYs" [attr.x1]="chartMargin" [attr.x2]="chartWidth - chartMargin" [attr.y1]="y" [attr.y2]="y" stroke="#e9ecef" stroke-width="0.6" />
                      </g>
                      <polyline *ngIf="chartPolyline" [attr.points]="chartPolyline" fill="url(#revenueGradient)" stroke="none"></polyline>
                      <polyline *ngIf="chartLine" [attr.points]="chartLine" fill="none" stroke="#0d6efd" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"></polyline>
                      <g *ngFor="let dot of chartDots">
                        <circle [attr.cx]="dot.x" [attr.cy]="dot.y" r="3.6" fill="#0d6efd" stroke="#fff" stroke-width="1"></circle>
                        <text [attr.x]="dot.x" [attr.y]="dot.y - 9" text-anchor="middle" class="chart-label">{{ dot.label }}</text>
                      </g>
                    </svg>
                  </div>
                  <div class="table-responsive mt-3">
                    <table class="table table-sm mb-0">
                      <thead class="table-light"><tr><th>Nhãn</th><th class="text-end">Doanh thu</th><th class="text-end">Số đơn</th></tr></thead>
                      <tbody>
                        <tr *ngFor="let row of filteredSeries">
                          <td>{{ row.label }}</td>
                          <td class="text-end text-primary fw-semibold">{{ row.revenue | number:'1.0-0' }}</td>
                          <td class="text-end">{{ row.orderCount }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </ng-container>
                <ng-template #noSeries>
                  <div class="text-center text-muted py-4">Không có dữ liệu trong khoảng thời gian đã chọn</div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </app-admin-layout>
  `,
  styles: [`
    .chart-label { font-size: 9px; fill: #495057; paint-order: stroke; stroke: #fff; stroke-width: 0.6; }
    .chart-grid line { shape-rendering: crispEdges; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  recentOrderCount = 0;
  recentRevenue = 0;
  recentAov = 0;
  recentCancellationRate = 0;
  topSellingProducts: TopSellingProduct[] = [];
  statusStats: OrderStatusStat[] = [];
  salesInsights: SalesInsight[] = [];
  timeSeries: DashboardTimeSeries | null = null;
  revenueSummary: DashboardRevenueSummary | null = null;
  inventoryValue = 0;
  selectedSeries: 'daily' | 'weekly' | 'monthly' = 'daily';
  fromDate: string | null = null;
  toDate: string | null = null;
  readonly chartHeight = 180;
  readonly chartMargin = 12;
  get chartWidth(): number {
    const n = Math.max(this.filteredSeries.length - 1, 1);
    return Math.max(160, this.chartMargin * 2 + n * 60);
  }

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getDashboard().subscribe({
      next: s => {
        this.stats = s;
        this.rebuildSalesReport(s);
        this.timeSeries = s.timeSeries ?? null;
        this.revenueSummary = s.revenueSummary ?? null;
        this.inventoryValue = s.inventoryValue ?? 0;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private rebuildSalesReport(stats: DashboardStats): void {
    const orders = stats.recentOrders || [];
    const apiSummary = stats.salesSummary;
    const statusList: Array<{ status: string; className: string }> = [
      { status: 'PENDING', className: 'bg-warning' },
      { status: 'CONFIRMED', className: 'bg-info' },
      { status: 'SHIPPING', className: 'bg-primary' },
      { status: 'DELIVERED', className: 'bg-success' },
      { status: 'CANCELLED', className: 'bg-danger' }
    ];

    const fallbackOrderCount = orders.length;
    const fallbackRevenue = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const fallbackAov = orders.length
      ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / orders.length
      : 0;

    const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;
    const fallbackCancellationRate = orders.length ? (cancelledCount / orders.length) * 100 : 0;

    const itemMap = new Map<string, TopSellingProduct>();
    for (const order of orders) {
      for (const item of order.orderItems || []) {
        const productId = item.productId ?? item.product?.id ?? null;
        const productName = item.productName || item.product?.name || 'Sản phẩm khác';
        const key = `${productId ?? 'na'}-${productName}`;
        const current = itemMap.get(key) || {
          productId,
          productName,
          quantity: 0,
          revenue: 0
        };
        const quantity = item.quantity || 0;
        const revenue = item.subtotal || (item.unitPrice || 0) * quantity;
        current.quantity += quantity;
        current.revenue += revenue;
        itemMap.set(key, current);
      }
    }
    const fallbackTopProducts = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
      .slice(0, 5);

    const fallbackStatusStats = statusList
      .map(s => {
        const count = orders.filter(o => o.status === s.status).length;
        const share = orders.length ? (count / orders.length) * 100 : 0;
        return {
          status: s.status,
          label: this.getStatusLabel(s.status),
          className: s.className,
          count,
          share
        };
      })
      .filter(s => s.count > 0);

    this.recentOrderCount = apiSummary?.recentOrderCount ?? fallbackOrderCount;
    this.recentRevenue = apiSummary?.recentRevenue ?? fallbackRevenue;
    this.recentAov = apiSummary?.recentAov ?? fallbackAov;
    this.recentCancellationRate = apiSummary?.recentCancellationRate ?? fallbackCancellationRate;
    this.topSellingProducts = this.mapTopSellingProducts(apiSummary) ?? fallbackTopProducts;
    this.statusStats = this.mapStatusStats(apiSummary) ?? fallbackStatusStats;

    this.salesInsights = [];
    if (this.recentCancellationRate >= 15) {
      this.salesInsights.push({
        tone: 'warning',
        message: `Tỷ lệ hủy đang ở mức ${this.recentCancellationRate.toFixed(1)}%. Nên kiểm tra lý do hủy và tối ưu khâu chốt đơn.`,
        link: '/admin/orders',
        linkLabel: 'Xem đơn hàng'
      });
    }
    if (stats.lowStockCount > 0) {
      this.salesInsights.push({
        tone: 'warning',
        message: `${stats.lowStockCount} sản phẩm sắp hết hàng. Nên ưu tiên bổ sung tồn kho để tránh mất doanh thu.`,
        link: '/admin/inventory/adjust',
        linkLabel: 'Điều chỉnh kho'
      });
    }
    if (this.topSellingProducts.length && this.topSellingProducts[0].quantity >= 3) {
      this.salesInsights.push({
        tone: 'success',
        message: `${this.topSellingProducts[0].productName} đang là sản phẩm bán chạy nhất. Có thể đẩy mạnh combo hoặc upsell.`,
        link: '/admin/products',
        linkLabel: 'Xem sản phẩm'
      });
    }
    if (!this.salesInsights.length) {
      this.salesInsights.push({
        tone: 'info',
        message: 'Doanh số gần đây ổn định. Có thể thử chương trình khuyến mãi nhỏ để tăng tốc bán hàng.'
      });
    }

    if (apiSummary?.insights?.length) {
      this.salesInsights = apiSummary.insights;
    }
  }

  private mapTopSellingProducts(summary?: DashboardSalesSummary): TopSellingProduct[] | null {
    const apiProducts = summary?.topSellingProducts;
    if (!apiProducts?.length) {
      return null;
    }
    return apiProducts.slice(0, 5).map((p: DashboardTopSellingProduct) => ({
      productId: p.productId ?? null,
      productName: p.productName,
      quantity: p.quantity,
      revenue: p.revenue
    }));
  }

  private mapStatusStats(summary?: DashboardSalesSummary): OrderStatusStat[] | null {
    const apiStats = summary?.statusStats;
    if (!apiStats?.length) {
      return null;
    }

    const totalCount = apiStats.reduce((sum, s) => sum + s.count, 0);
    return apiStats
      .map((s: DashboardStatusStat) => ({
        status: s.status,
        label: this.getStatusLabel(s.status),
        className: this.getStatusBarClass(s.status),
        count: s.count,
        share: s.share ?? (totalCount ? (s.count / totalCount) * 100 : 0)
      }))
      .filter(s => s.count > 0);
  }

  private getStatusBarClass(status: string): string {
    const m: Record<string, string> = {
      PENDING: 'bg-warning',
      CONFIRMED: 'bg-info',
      SHIPPING: 'bg-primary',
      DELIVERED: 'bg-success',
      CANCELLED: 'bg-danger'
    };
    return m[status] || 'bg-secondary';
  }

  getStatusClass(s: string): string {
    const m: Record<string, string> = { PENDING: 'bg-warning text-dark', CONFIRMED: 'bg-info', SHIPPING: 'bg-primary', DELIVERED: 'bg-success', CANCELLED: 'bg-danger' };
    return m[s] || 'bg-secondary';
  }
  getStatusLabel(s: string): string {
    const m: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' };
    return m[s] || s;
  }

  get filteredSeries(): DashboardTimeSeriesRow[] {
    const series = this.timeSeries?.[this.selectedSeries] ?? [];
    return series.filter(row => {
      const d = this.parseLabelToDate(row.label);
      if (!d) return true;
      const ts = d.getTime();
      if (this.fromDate && ts < new Date(this.fromDate).getTime()) return false;
      if (this.toDate && ts > new Date(this.toDate).getTime()) return false;
      return true;
    });
  }

  get filteredRevenueTotal(): number {
    return this.filteredSeries.reduce((sum, r) => sum + (r.revenue || 0), 0);
  }

  get filteredOrderTotal(): number {
    return this.filteredSeries.reduce((sum, r) => sum + (r.orderCount || 0), 0);
  }

  get chartLine(): string {
    if (!this.filteredSeries.length) return '';
    return this.buildPoints().map(p => `${p.x},${p.y}`).join(' ');
  }

  get chartPolyline(): string {
    const pts = this.buildPoints();
    if (!pts.length) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    const baseline = this.chartHeight - this.chartMargin;
    return [`${first.x},${baseline}`, ...pts.map(p => `${p.x},${p.y}`), `${last.x},${baseline}`].join(' ');
  }

  get chartDots(): Array<{ x: number; y: number; label: string }> {
    return this.buildPoints().map((p, idx) => ({
      ...p,
      label: this.filteredSeries[idx]?.orderCount != null ? String(this.filteredSeries[idx].orderCount) : ''
    }));
  }

  get chartGridYs(): number[] {
    const lines = 4;
    const top = this.chartMargin;
    const bottom = this.chartHeight - this.chartMargin;
    const step = (bottom - top) / lines;
    return Array.from({ length: lines + 1 }, (_, i) => bottom - i * step);
  }

  exportSeriesCsv(): void {
    const rows = this.filteredSeries;
    if (!rows.length) {
      return;
    }

    const header = ['Label', 'Revenue', 'OrderCount'];
    const lines = rows.map(r => [
      this.escapeCsv(r.label),
      r.revenue ?? 0,
      r.orderCount ?? 0
    ].join(','));
    const csv = '\uFEFF' + [header.join(','), ...lines].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${this.selectedSeries}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private buildPoints(): Array<{ x: number; y: number }> {
    const rows = this.filteredSeries;
    if (!rows.length) return [];
    const margin = this.chartMargin;
    const span = Math.max(rows.length - 1, 1);
    const xStep = (this.chartWidth - margin * 2) / span;
    const maxRevenue = Math.max(...rows.map(r => r.revenue || 0), 1);
    const pts: Array<{ x: number; y: number }> = [];
    rows.forEach((r, idx) => {
      const x = margin + idx * xStep;
      const y = this.chartHeight - margin - (Math.max(r.revenue || 0, 0) / maxRevenue) * (this.chartHeight - margin * 2);
      pts.push({ x, y });
    });
    return pts;
  }

  private escapeCsv(value: string | number | null | undefined): string {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  private parseLabelToDate(label: string): Date | null {
    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
      return new Date(label + 'T00:00:00');
    }
    if (/^\d{4}-W\d{2}$/.test(label)) {
      const [yearStr, weekStr] = label.split('-W');
      const year = Number(yearStr);
      const week = Number(weekStr);
      const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
      const dow = simple.getUTCDay();
      const ISOweekStart = dow <= 4
        ? new Date(simple.getTime() - dow * 86400000)
        : new Date(simple.getTime() + (7 - dow) * 86400000);
      return ISOweekStart;
    }
    if (/^\d{4}-\d{2}$/.test(label)) {
      return new Date(label + '-01T00:00:00');
    }
    return null;
  }
}

