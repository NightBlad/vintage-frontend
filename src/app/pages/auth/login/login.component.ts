import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="auth-card">
              <div class="auth-header">
                <h3><i class="fas fa-heartbeat me-2"></i>Vintage Pharmacy</h3>
                <p class="mb-0">Đăng nhập vào hệ thống</p>
              </div>
              <div class="auth-body">
                <div class="alert alert-danger" *ngIf="error">
                  <i class="fas fa-exclamation-triangle me-2"></i>{{ error }}
                </div>
                <form (ngSubmit)="onLogin()" #f="ngForm">
                  <div class="mb-3">
                    <label class="form-label"><i class="fas fa-user me-2"></i>Tên đăng nhập</label>
                    <input type="text" class="form-control" required [(ngModel)]="username" name="username">
                  </div>
                  <div class="mb-3">
                    <label class="form-label"><i class="fas fa-lock me-2"></i>Mật khẩu</label>
                    <input type="password" class="form-control" required [(ngModel)]="password" name="password">
                  </div>
                  <div class="d-grid mb-3">
                    <button type="submit" class="btn btn-primary btn-login" [disabled]="f.invalid || loading">
                      <span class="spinner-border spinner-border-sm me-2" *ngIf="loading"></span>
                      <i class="fas fa-sign-in-alt me-2" *ngIf="!loading"></i>Đăng nhập
                    </button>
                  </div>
                </form>
                <div class="text-center">
                  <p class="mb-0">Chưa có tài khoản? <a routerLink="/register" class="text-primary">Đăng ký ngay</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onLogin(): void {
    this.error = '';
    this.loading = true;
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: res => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const isAdmin = res.roles?.includes('ROLE_ADMIN') || res.roles?.includes('ADMIN');
        this.router.navigateByUrl(returnUrl || (isAdmin ? '/admin/dashboard' : '/'));
      },
      error: err => {
        this.loading = false;
        this.error = err.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!';
      }
    });
  }
}

