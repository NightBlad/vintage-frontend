import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { AccountService } from '../../../services/account.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <div class="row">
          <div class="col-lg-3">
            <div class="card shadow-sm p-3 mb-4">
              <div class="text-center mb-3">
                <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-2" style="width:80px;height:80px">
                  <i class="fas fa-user fa-2x text-white"></i>
                </div>
                <h6 class="fw-bold mb-0">{{ user?.fullName }}</h6>
                <small class="text-muted">{{ user?.email }}</small>
              </div>
              <ul class="list-unstyled">
                <li class="mb-2"><a routerLink="/account/profile" class="text-decoration-none"><i class="fas fa-user me-2"></i>Hồ sơ</a></li>
                <li class="mb-2"><a routerLink="/account/orders" class="text-decoration-none"><i class="fas fa-box me-2"></i>Đơn hàng</a></li>
                <li><a routerLink="/account/change-password" class="text-decoration-none"><i class="fas fa-lock me-2"></i>Đổi mật khẩu</a></li>
              </ul>
            </div>
          </div>
          <div class="col-lg-9">
            <div class="card shadow-sm">
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-user me-2"></i>Thông tin tài khoản</h5></div>
              <div class="card-body">
                <div class="alert alert-success" *ngIf="success"><i class="fas fa-check-circle me-2"></i>{{ success }}</div>
                <div class="alert alert-danger" *ngIf="error"><i class="fas fa-exclamation-circle me-2"></i>{{ error }}</div>
                <form (ngSubmit)="save()" #f="ngForm" *ngIf="user">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Tên đăng nhập</label>
                      <input type="text" class="form-control" [value]="user.username" disabled>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" [(ngModel)]="user.email" name="email" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Họ và tên *</label>
                      <input type="text" class="form-control" [(ngModel)]="user.fullName" name="fullName" required>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Số điện thoại</label>
                      <input type="tel" class="form-control" [(ngModel)]="user.phone" name="phone">
                    </div>
                    <div class="col-12">
                      <label class="form-label">Địa chỉ</label>
                      <input type="text" class="form-control" [(ngModel)]="user.address" name="address">
                    </div>
                    <div class="col-12">
                      <button type="submit" class="btn btn-primary" [disabled]="f.invalid || saving">
                        <span class="spinner-border spinner-border-sm me-2" *ngIf="saving"></span>
                        <i class="fas fa-save me-2" *ngIf="!saving"></i>Lưu thay đổi
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  success = '';
  error = '';
  saving = false;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getProfile().subscribe(u => this.user = u);
  }

  save(): void {
    if (!this.user) return;
    this.saving = true;
    this.accountService.updateProfile({ fullName: this.user.fullName, email: this.user.email, phone: this.user.phone, address: this.user.address }).subscribe({
      next: u => { this.user = u; this.saving = false; this.success = 'Cập nhật thành công!'; setTimeout(() => this.success = '', 3000); },
      error: err => { this.saving = false; this.error = err.error?.message || 'Có lỗi xảy ra'; }
    });
  }
}

