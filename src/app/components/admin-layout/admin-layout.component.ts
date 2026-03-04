import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- Admin Header -->
    <div class="admin-header">
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center">
          <h4 class="mb-0">
            <i class="fas fa-heartbeat me-2"></i>Vintage Pharmacy Admin
          </h4>
          <div class="d-flex align-items-center gap-3">
            <span><i class="fas fa-user me-1"></i>{{ authService.currentUser?.fullName }}</span>
            <a routerLink="/" class="btn btn-outline-light btn-sm">
              <i class="fas fa-store me-1"></i>Cửa hàng
            </a>
            <button class="btn btn-outline-light btn-sm" (click)="authService.logout()">
              <i class="fas fa-sign-out-alt me-1"></i>Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Nav -->
    <div class="admin-nav">
      <div class="container-fluid">
        <ul class="nav">
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">
              <i class="fas fa-tachometer-alt me-1"></i>Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/products" routerLinkActive="active">
              <i class="fas fa-pills me-1"></i>Sản phẩm
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/categories" routerLinkActive="active">
              <i class="fas fa-folder me-1"></i>Danh mục
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/orders" routerLinkActive="active">
              <i class="fas fa-shopping-cart me-1"></i>Đơn hàng
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/users" routerLinkActive="active">
              <i class="fas fa-users me-1"></i>Người dùng
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Content -->
    <div class="admin-main">
      <div class="container-fluid px-4">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(public authService: AuthService) {}
}

