import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="auth-card">
              <div class="auth-header">
                <h3><i class="fas fa-heartbeat me-2"></i>Vintage Pharmacy</h3>
                <p class="mb-0">Đăng ký tài khoản mới</p>
              </div>
              <div class="auth-body">
                <div class="alert alert-danger" *ngIf="error"><i class="fas fa-exclamation-triangle me-2"></i>{{ error }}</div>
                <div class="alert alert-success" *ngIf="success"><i class="fas fa-check-circle me-2"></i>{{ success }}</div>
                <form (ngSubmit)="onRegister()" #f="ngForm">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-user me-2"></i>Tên đăng nhập *</label>
                      <input type="text" class="form-control" required minlength="3" [(ngModel)]="form.username" name="username">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-envelope me-2"></i>Email *</label>
                      <input type="email" class="form-control" required [(ngModel)]="form.email" name="email">
                    </div>
                    <div class="col-12">
                      <label class="form-label"><i class="fas fa-id-card me-2"></i>Họ và tên *</label>
                      <input type="text" class="form-control" required [(ngModel)]="form.fullName" name="fullName">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-lock me-2"></i>Mật khẩu *</label>
                      <input type="password" class="form-control" required minlength="6" [(ngModel)]="form.password" name="password">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-lock me-2"></i>Xác nhận mật khẩu *</label>
                      <input type="password" class="form-control" required [(ngModel)]="form.confirmPassword" name="confirmPassword">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-phone me-2"></i>Số điện thoại</label>
                      <input type="tel" class="form-control" [(ngModel)]="form.phone" name="phone">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-map-marker-alt me-2"></i>Địa chỉ</label>
                      <input type="text" class="form-control" [(ngModel)]="form.address" name="address">
                    </div>
                    <div class="col-12">
                      <button type="submit" class="btn btn-primary w-100 btn-register" [disabled]="f.invalid || loading">
                        <span class="spinner-border spinner-border-sm me-2" *ngIf="loading"></span>
                        <i class="fas fa-user-plus me-2" *ngIf="!loading"></i>Đăng ký
                      </button>
                    </div>
                  </div>
                </form>
                <div class="text-center mt-3">
                  <p class="mb-0">Đã có tài khoản? <a routerLink="/login" class="text-primary">Đăng nhập</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form = { username: '', email: '', fullName: '', password: '', confirmPassword: '', phone: '', address: '' };
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Mật khẩu xác nhận không khớp!';
      return;
    }
    this.error = '';
    this.loading = true;
    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Đăng ký thành công! Đang chuyển hướng...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      }
    });
  }
}

