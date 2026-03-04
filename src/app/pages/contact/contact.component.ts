import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <div class="row mb-5">
          <div class="col-lg-8 mx-auto text-center">
            <h1 class="fw-bold text-primary"><i class="fas fa-envelope me-2"></i>Liên hệ</h1>
            <p class="lead text-muted">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
        </div>
        <div class="row g-5">
          <div class="col-lg-4">
            <div class="card p-4 shadow-sm mb-3">
              <i class="fas fa-map-marker-alt fa-2x text-primary mb-3"></i>
              <h6 class="fw-bold">Địa chỉ</h6>
              <p class="text-muted mb-0">123 Đường ABC, Quận 1, TP.HCM</p>
            </div>
            <div class="card p-4 shadow-sm mb-3">
              <i class="fas fa-phone fa-2x text-success mb-3"></i>
              <h6 class="fw-bold">Điện thoại</h6>
              <p class="text-muted mb-0">1800-1234 (Miễn phí)</p>
            </div>
            <div class="card p-4 shadow-sm">
              <i class="fas fa-envelope fa-2x text-info mb-3"></i>
              <h6 class="fw-bold">Email</h6>
              <p class="text-muted mb-0">info&#64;vintagepharmacy.vn</p>
            </div>
          </div>
          <div class="col-lg-8">
            <div class="card p-4 shadow-sm">
              <h4 class="fw-bold mb-4">Gửi tin nhắn</h4>
              <div class="alert alert-success" *ngIf="sent">
                <i class="fas fa-check-circle me-2"></i>Tin nhắn đã được gửi! Chúng tôi sẽ phản hồi trong 24h.
              </div>
              <form (ngSubmit)="submit()" #f="ngForm" *ngIf="!sent">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Họ tên</label>
                    <input type="text" class="form-control" required [(ngModel)]="form.name" name="name">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" required [(ngModel)]="form.email" name="email">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Tiêu đề</label>
                    <input type="text" class="form-control" required [(ngModel)]="form.subject" name="subject">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Nội dung</label>
                    <textarea class="form-control" rows="5" required [(ngModel)]="form.message" name="message"></textarea>
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-primary px-5" [disabled]="f.invalid">
                      <i class="fas fa-paper-plane me-2"></i>Gửi tin nhắn
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class ContactComponent {
  sent = false;
  form = { name: '', email: '', subject: '', message: '' };

  submit(): void {
    this.sent = true;
  }
}

