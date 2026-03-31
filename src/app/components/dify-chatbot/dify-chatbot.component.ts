import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dify-chatbot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!isLoggedIn" class="login-prompt">
      <div class="prompt-content">
        <i class="fas fa-lock"></i>
        <p>Vui lòng đăng nhập để sử dụng chatbot</p>
        <button class="btn btn-primary btn-sm" (click)="goToLogin()">Đăng nhập</button>
      </div>
    </div>

    <div *ngIf="isLoggedIn && hasChatbotUrl" class="dify-custom-button" (click)="toggleChatWindow()" title="Mở chatbot">
      <i class="fas fa-comments"></i>
    </div>

    <div *ngIf="isLoggedIn && showChatWindow && hasChatbotUrl" class="dify-chat-window">
      <div class="dify-chat-body">
        <button class="floating-close" (click)="toggleChatWindow()" aria-label="Đóng chatbot">
          <i class="fas fa-times"></i>
        </button>
        <div *ngIf="isLoading" class="dify-chat-state">Đang tải chatbot...</div>
        <div *ngIf="loadError" class="dify-chat-state error">Không thể tải chatbot. Vui lòng thử lại sau.</div>
        <iframe
          *ngIf="!loadError"
          id="dify-chatbot-iframe"
          [src]="difyIframeUrl"
          class="dify-chat-iframe"
          frameborder="0"
          allow="microphone"
          (load)="onIframeLoad()"
          (error)="onIframeError()">
        </iframe>
      </div>
    </div>

    <div *ngIf="isLoggedIn && !hasChatbotUrl" class="dify-chat-state error missing-config">
      Không tìm thấy cấu hình chatbot. Liên hệ quản trị để bổ sung.
    </div>
  `,
  styles: [`
    .login-prompt {
      position: fixed;
      bottom: 120px;
      right: 30px;
      width: 350px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 20px;
      text-align: center;
      z-index: 998;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 150px;
    }

    .prompt-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .prompt-content i {
      font-size: 32px;
      color: #2563eb;
    }

    .prompt-content p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .btn {
      padding: 8px 16px;
      font-size: 12px;
    }

    .dify-custom-button {
      position: fixed;
      bottom: 32px;
      right: 32px;
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
      z-index: 997;
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      backdrop-filter: blur(8px);
    }

    .dify-custom-button:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 16px 36px rgba(37, 99, 235, 0.4);
      filter: brightness(1.02);
    }

    .dify-custom-button i {
      font-size: 26px;
      color: #f8fafc;
    }

    .dify-chat-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 21rem;
      height: 32rem;
      max-height: 80vh;
      background: linear-gradient(145deg, #f8fafc, #eef2ff);
      border-radius: 18px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
      display: flex;
      flex-direction: column;
      z-index: 999;
      animation: slideUp 0.25s ease-out;
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dify-chat-body {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .floating-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      color: #0f172a;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      z-index: 5;
    }

    .floating-close:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
      background: #ffffff;
    }

    .dify-chat-iframe {
      flex-grow: 1;
      border: none;
      border-radius: 0 0 18px 18px;
      box-shadow: inset 0 1px 0 rgba(15, 23, 42, 0.05);
    }

    .dify-chat-state {
      padding: 16px;
      text-align: center;
      color: #333;
      font-size: 14px;
    }

    .dify-chat-state.error {
      color: #b91c1c;
      background: #fef2f2;
      border-bottom: 1px solid #fecdd3;
    }

    .missing-config {
      position: fixed;
      bottom: 110px;
      right: 30px;
      width: 320px;
      background: #fff7ed;
      color: #9a3412;
      border: 1px solid #fdba74;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 12px 16px;
      z-index: 999;
    }

    @media (max-width: 768px) {
      .dify-custom-button {
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
      }

      .dify-custom-button i {
        font-size: 20px;
      }

      .login-prompt {
        width: 90vw;
        right: 5vw;
        left: 5vw;
        bottom: 80px;
      }

      .dify-chat-window {
        width: 88vw !important;
        height: 72vh !important;
        right: 4vw !important;
        left: 4vw !important;
        bottom: 72px !important;
      }
    }
  `]
})
export class DifyChatbotComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoggedIn = false;
  showChatWindow = false;
  difyIframeUrl: SafeResourceUrl | null = null;
  isLoading = false;
  loadError = false;
  hasChatbotUrl = false;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    const rawUrl = environment.difyChatbotUrl;
    this.hasChatbotUrl = typeof rawUrl === 'string' && rawUrl.trim().length > 0;
    this.difyIframeUrl = this.hasChatbotUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl) : null;
  }

  ngOnInit(): void {
    if (this.authService && this.authService.currentUser$) {
      this.authService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          this.isLoggedIn = !!user;
          if (!this.isLoggedIn) {
            this.showChatWindow = false;
          }
        });
    } else {
      this.isLoggedIn = !!this.authService?.isLoggedIn;
    }
  }

  ngAfterViewInit(): void {
    // Nothing needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChatWindow(): void {
    if (!this.hasChatbotUrl) {
      return;
    }

    this.showChatWindow = !this.showChatWindow;
    if (this.showChatWindow) {
      this.isLoading = true;
      this.loadError = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  onIframeLoad(): void {
    this.isLoading = false;
  }

  onIframeError(): void {
    this.isLoading = false;
    this.loadError = true;
  }
}
