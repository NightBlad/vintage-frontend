import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../../components/layout/layout.component';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <div class="row justify-content-center">
          <div class="col-lg-6">
            <div class="card shadow-sm">
              <div class="card-header"><h5 class="mb-0"><i class="fas fa-lock me-2"></i>Đổi mật khẩu</h5></div>
              <div class="card-body">
                <div class="alert alert-success" *ngIf="success"><i class="fas fa-check-circle me-2"></i>{{ success }}</div>
                <div class="alert alert-danger" *ngIf="error"><i class="fas fa-exclamation-circle me-2"></i>{{ error }}</div>
                <form (ngSubmit)="submit()" #f="ngForm">
                  <div class="mb-3">
                    <label class="form-label">Mật khẩu hiện tại *</label>
                    <input type="password" class="form-control" required [(ngModel)]="form.current" name="current">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Mật khẩu mới *</label>
                    <input type="password" class="form-control" required minlength="6" [(ngModel)]="form.newPass" name="newPass">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Xác nhận mật khẩu mới *</label>
                    <input type="password" class="form-control" required [(ngModel)]="form.confirm" name="confirm">
                  </div>
                  <button type="submit" class="btn btn-primary" [disabled]="f.invalid || saving">
                    <span class="spinner-border spinner-border-sm me-2" *ngIf="saving"></span>
                    <i class="fas fa-save me-2" *ngIf="!saving"></i>Lưu mật khẩu
                  </button>
                  <a routerLink="/account/profile" class="btn btn-outline-secondary ms-2">Hủy</a>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class ChangePasswordComponent {
  form = { current: '', newPass: '', confirm: '' };
  success = '';
  error = '';
  saving = false;

  constructor(private accountService: AccountService) {}

  submit(): void {
    this.error = '';
    this.success = '';

    if (this.form.newPass !== this.form.confirm) {
      this.error = 'Mật khẩu xác nhận không khớp!';
      return;
    }

    this.saving = true;
    this.accountService.changePassword(this.form.current, this.form.newPass, this.form.confirm).subscribe({
      next: response => {
        this.saving = false;
        this.success = response.message || 'Đổi mật khẩu thành công!';
        this.form = { current: '', newPass: '', confirm: '' };
      },
      error: err => {
        this.saving = false;
        this.error = err.error?.message || 'Đổi mật khẩu thất bại.';
      }
    });
  }
}

