import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { resolveAuthErrorMessage } from '../../../utils/auth-error.util';
import { RegisterRequest } from '../../../models/models';
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
                <div class="mb-3">
                  <a routerLink="/" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-arrow-left me-2"></i>Về trang chủ
                  </a>
                </div>
                <div class="alert alert-danger" *ngIf="error"><i class="fas fa-exclamation-triangle me-2"></i>{{ error }}</div>
                <div class="alert alert-success" *ngIf="success"><i class="fas fa-check-circle me-2"></i>{{ success }}</div>
                <form (ngSubmit)="onRegister(f)" #f="ngForm" novalidate>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-user me-2"></i>Tên đăng nhập *</label>
                      <input
                        type="text"
                        class="form-control"
                        [class.is-invalid]="isControlInvalid(usernameModel)"
                        required
                        minlength="3"
                        [(ngModel)]="form.username"
                        name="username"
                        #usernameModel="ngModel"
                      >
                      <div class="invalid-feedback" *ngIf="isControlInvalid(usernameModel)">
                        <span *ngIf="usernameModel.errors?.['required']">Vui lòng nhập tên đăng nhập.</span>
                        <span *ngIf="usernameModel.errors?.['minlength']">Tên đăng nhập phải có ít nhất 3 ký tự.</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-envelope me-2"></i>Email *</label>
                      <input
                        type="email"
                        class="form-control"
                        [class.is-invalid]="isControlInvalid(emailModel)"
                        required
                        email
                        [(ngModel)]="form.email"
                        name="email"
                        #emailModel="ngModel"
                      >
                      <div class="invalid-feedback" *ngIf="isControlInvalid(emailModel)">
                        <span *ngIf="emailModel.errors?.['required']">Vui lòng nhập email.</span>
                        <span *ngIf="emailModel.errors?.['email']">Email không đúng định dạng.</span>
                      </div>
                    </div>
                    <div class="col-12">
                      <label class="form-label"><i class="fas fa-id-card me-2"></i>Họ và tên *</label>
                      <input
                        type="text"
                        class="form-control"
                        [class.is-invalid]="isControlInvalid(fullNameModel)"
                        required
                        [(ngModel)]="form.fullName"
                        name="fullName"
                        #fullNameModel="ngModel"
                      >
                      <div class="invalid-feedback" *ngIf="isControlInvalid(fullNameModel)">
                        Vui lòng nhập họ và tên.
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-lock me-2"></i>Mật khẩu *</label>
                      <input
                        type="password"
                        class="form-control"
                        [class.is-invalid]="isControlInvalid(passwordModel)"
                        required
                        minlength="8"
                        [pattern]="passwordPattern"
                        [(ngModel)]="form.password"
                        name="password"
                        #passwordModel="ngModel"
                      >
                      <div class="invalid-feedback" *ngIf="isControlInvalid(passwordModel)">
                        <span *ngIf="passwordModel.errors?.['required']">Vui lòng nhập mật khẩu.</span>
                        <span *ngIf="passwordModel.errors?.['minlength']">Mật khẩu phải có ít nhất 8 ký tự.</span>
                        <span *ngIf="passwordModel.errors?.['pattern']">
                          Mật khẩu cần có chữ hoa, chữ thường, số và ký tự đặc biệt.
                        </span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-lock me-2"></i>Xác nhận mật khẩu *</label>
                      <input
                        type="password"
                        class="form-control"
                        [class.is-invalid]="isControlInvalid(confirmPasswordModel) || isPasswordMismatch(confirmPasswordModel)"
                        required
                        [(ngModel)]="form.confirmPassword"
                        name="confirmPassword"
                        #confirmPasswordModel="ngModel"
                      >
                      <div class="invalid-feedback" *ngIf="isControlInvalid(confirmPasswordModel) || isPasswordMismatch(confirmPasswordModel)">
                        <span *ngIf="confirmPasswordModel.errors?.['required']">Vui lòng xác nhận mật khẩu.</span>
                        <span *ngIf="!confirmPasswordModel.errors?.['required'] && isPasswordMismatch(confirmPasswordModel)">
                          Mật khẩu xác nhận không khớp.
                        </span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-phone me-2"></i>Số điện thoại</label>
                      <input
                        type="tel"
                        class="form-control"
                        [class.is-invalid]="isControlInvalid(phoneModel)"
                        [pattern]="phonePattern"
                        [(ngModel)]="form.phone"
                        name="phone"
                        #phoneModel="ngModel"
                      >
                      <div class="invalid-feedback" *ngIf="isControlInvalid(phoneModel)">
                        Số điện thoại không đúng định dạng (VD: 0901234567).
                      </div>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label"><i class="fas fa-map-marker-alt me-2"></i>Địa chỉ</label>
                      <input type="text" class="form-control" [(ngModel)]="form.address" name="address">
                    </div>
                    <div class="col-12">
                      <button type="submit" class="btn btn-primary w-100 btn-register" [disabled]="loading">
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
  readonly passwordPattern = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,64}$';
  readonly phonePattern = '^0\\d{9}$';
  form: RegisterRequest = {
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  };
  error = '';
  success = '';
  loading = false;
  submitted = false;
  constructor(private authService: AuthService, private router: Router) {}
  isControlInvalid(control: NgModel | null): boolean {
    return control !== null ? control.invalid === true && (control.touched === true || this.submitted) : false;
  }
  isPasswordMismatch(control: NgModel | null): boolean {
    return control !== null
      && !control.errors?.['required']
      && (control.touched === true || this.submitted)
      && this.form.password !== this.form.confirmPassword;
  }
  onRegister(formDirective: NgForm): void {
    this.submitted = true;
    if (formDirective.invalid) {
      Object.values(formDirective.controls).forEach(ctrl => ctrl.markAsTouched());
      this.error = 'Vui lòng kiểm tra lại các trường bắt buộc.';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Mật khẩu xác nhận không khớp!';
      return;
    }
    const trimmedPhone = this.form.phone?.trim() ?? '';
    const trimmedAddress = this.form.address?.trim() ?? '';
    const payload: RegisterRequest = {
      username: this.form.username.trim(),
      email: this.form.email.trim(),
      fullName: this.form.fullName.trim(),
      password: this.form.password,
      confirmPassword: this.form.confirmPassword,
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      ...(trimmedAddress ? { address: trimmedAddress } : {})
    };
    this.error = '';
    this.success = '';
    this.loading = true;
    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Đăng ký thành công! Đang chuyển hướng...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.loading = false;
        this.error = resolveAuthErrorMessage(err, 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  }
}


