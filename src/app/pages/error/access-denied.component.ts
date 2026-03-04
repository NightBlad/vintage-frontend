import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="text-center px-4">
        <div class="mb-4">
          <i class="fas fa-lock text-danger" style="font-size: 6rem;"></i>
        </div>
        <h1 class="display-4 fw-bold text-danger">403</h1>
        <h2 class="mb-3">Truy cập bị từ chối</h2>
        <p class="text-muted mb-4">Bạn không có quyền truy cập vào trang này.<br>Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.</p>
        <div class="d-flex gap-3 justify-content-center">
          <a routerLink="/" class="btn btn-primary">
            <i class="fas fa-home me-2"></i>Về trang chủ
          </a>
          <a routerLink="/login" class="btn btn-outline-secondary">
            <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
          </a>
        </div>
      </div>
    </div>
  `
})
export class AccessDeniedComponent {}

