import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <!-- Top Header -->
    <div class="top-header">
      <div class="container d-flex justify-content-between align-items-center">
        <div>
          <i class="fas fa-phone me-1"></i> 1800-1234 &nbsp;&nbsp;
          <i class="fas fa-envelope me-1"></i> info&#64;vintagepharmacy.vn
        </div>
        <div>
          <i class="fas fa-clock me-1"></i> Thứ 2 - Chủ nhật: 7:00 - 22:00
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <div class="main-header">
      <nav class="navbar navbar-expand-xl navbar-light">
        <div class="container">
          <a class="navbar-brand" routerLink="/">
            <i class="fas fa-heartbeat me-2"></i>Vintage
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarMain">
            <ul class="navbar-nav me-auto header-nav">
              <li class="nav-item"><a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Trang chủ</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/products" routerLinkActive="active">Sản phẩm</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/categories" routerLinkActive="active">Danh mục</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/about" routerLinkActive="active">Giới thiệu</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/contact" routerLinkActive="active">Liên hệ</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/chatbot" routerLinkActive="active"><i class="fas fa-robot me-1"></i>AI Chat</a></li>
            </ul>

            <!-- Search -->
            <form class="header-search d-flex me-3" (ngSubmit)="onSearch()">
              <div class="position-relative">
                <input class="search-input" type="search" placeholder="Tìm sản phẩm..." [(ngModel)]="searchQuery" (ngModelChange)="onSearchInput()" name="search">
                <button type="submit" class="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-2">
                  <i class="fas fa-search text-muted"></i>
                </button>
              </div>
            </form>

            <div class="header-actions">
              <!-- Cart -->
              <a routerLink="/cart" class="btn btn-outline-primary position-relative" *ngIf="authService.isLoggedIn">
                <i class="fas fa-shopping-cart"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      *ngIf="(cartService.cartCount$ | async)! > 0">
                  {{ cartService.cartCount$ | async }}
                </span>
              </a>

              <!-- Not logged in -->
              <div class="d-flex align-items-center gap-2" *ngIf="!authService.isLoggedIn">
                <a routerLink="/login" class="btn btn-outline-primary">
                  <i class="fas fa-sign-in-alt me-1"></i>Đăng nhập
                </a>
                <a routerLink="/register" class="btn btn-primary">
                  <i class="fas fa-user-plus me-1"></i>Đăng ký
                </a>
              </div>

              <!-- Logged in dropdown -->
              <div class="dropdown header-user-dropdown" *ngIf="authService.isLoggedIn">
                <button class="btn btn-outline-primary dropdown-toggle user-menu-toggle" type="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user me-1"></i>
                  <span class="user-menu-name">{{ authService.currentUser?.fullName || authService.currentUser?.username }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" routerLink="/account/profile"><i class="fas fa-user me-2"></i>Tài khoản</a></li>
                  <li><a class="dropdown-item" routerLink="/account/orders"><i class="fas fa-box me-2"></i>Đơn hàng</a></li>
                  <li *ngIf="authService.isAdmin"><hr class="dropdown-divider"></li>
                  <li *ngIf="authService.isAdmin"><a class="dropdown-item text-primary" routerLink="/admin"><i class="fas fa-cog me-2"></i>Quản trị</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" (click)="logout()" style="cursor:pointer"><i class="fas fa-sign-out-alt me-2"></i>Đăng xuất</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <main>
      <ng-content></ng-content>
    </main>

    <!-- Footer -->
    <footer class="footer py-5 mt-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4">
            <h5><i class="fas fa-heartbeat me-2 text-warning"></i>Vintage Pharmacy</h5>
            <p class="mt-2">Chuyên cung cấp dược phẩm chức năng chất lượng cao, đảm bảo an toàn và hiệu quả.</p>
            <div class="d-flex gap-3 mt-3">
              <a href="#" class="fs-5"><i class="fab fa-facebook"></i></a>
              <a href="#" class="fs-5"><i class="fab fa-instagram"></i></a>
              <a href="#" class="fs-5"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          <div class="col-lg-2">
            <h6>Sản phẩm</h6>
            <ul class="list-unstyled mt-2">
              <li><a routerLink="/products">Tất cả sản phẩm</a></li>
              <li><a routerLink="/categories">Danh mục</a></li>
            </ul>
          </div>
          <div class="col-lg-2">
            <h6>Hỗ trợ</h6>
            <ul class="list-unstyled mt-2">
              <li><a routerLink="/about">Giới thiệu</a></li>
              <li><a routerLink="/contact">Liên hệ</a></li>
              <li><a routerLink="/chatbot">AI Chatbot</a></li>
            </ul>
          </div>
          <div class="col-lg-4">
            <h6>Liên hệ</h6>
            <ul class="list-unstyled mt-2">
              <li><i class="fas fa-map-marker-alt me-2 text-warning"></i>123 Đường ABC, TP.HCM</li>
              <li><i class="fas fa-phone me-2 text-warning"></i>1800-1234</li>
              <li><i class="fas fa-envelope me-2 text-warning"></i>info&#64;vintagepharmacy.vn</li>
            </ul>
          </div>
        </div>
        <hr class="border-secondary mt-4">
        <p class="text-center mb-0 small">&copy; 2024 Vintage Pharmacy. All rights reserved.</p>
      </div>
    </footer>
  `
})
export class LayoutComponent implements OnInit {
  searchQuery = '';
  private searchDebounceHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly searchDebounceMs = 350;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.cartService.refreshCount();
    }
    this.route.queryParams.subscribe(params => {
      const qParam = params['q'];
      this.searchQuery = typeof qParam === 'string' ? qParam : '';
    });
  }

  onSearch(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
      this.searchDebounceHandle = null;
    }
    this.navigateToSearch(this.searchQuery.trim());
  }

  onSearchInput(): void {
    if (this.searchDebounceHandle) {
      clearTimeout(this.searchDebounceHandle);
    }
    this.searchDebounceHandle = setTimeout(() => {
      this.navigateToSearch(this.searchQuery.trim());
    }, this.searchDebounceMs);
  }

  logout(): void {
    this.authService.logout();
  }

  private navigateToSearch(keyword: string): void {
    const queryParams = keyword ? { q: keyword } : {};
    this.searchQuery = keyword;
    this.router.navigate(['/search'], { queryParams });
  }
}

