import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div class="text-center px-4">
        <div class="mb-4">
          <i class="fas fa-search text-primary" style="font-size: 6rem; opacity: 0.4;"></i>
        </div>
        <h1 class="display-4 fw-bold text-primary">404</h1>
        <h2 class="mb-3">Trang không tồn tại</h2>
        <p class="text-muted mb-4">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.<br>Hãy kiểm tra lại đường dẫn hoặc quay về trang chủ.</p>
        <div class="d-flex gap-3 justify-content-center">
          <a routerLink="/" class="btn btn-primary">
            <i class="fas fa-home me-2"></i>Về trang chủ
          </a>
          <button class="btn btn-outline-secondary" onclick="history.back()">
            <i class="fas fa-arrow-left me-2"></i>Quay lại
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}

