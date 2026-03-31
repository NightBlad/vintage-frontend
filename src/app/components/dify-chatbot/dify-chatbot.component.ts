import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatService, ChatHistoryResponse, ChatSendResponse } from '../../services/chat.service';
import { formatChatMessage } from '../../utils/chat-message-format.util';

type ChatMessage = { role: 'user' | 'bot'; content: string; formattedContent?: string };

@Component({
  selector: 'app-dify-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div *ngIf="!isLoggedIn" class="login-prompt">
      <div class="prompt-content">
        <i class="fas fa-lock"></i>
        <p>Vui lòng đăng nhập để sử dụng chatbot</p>
        <button class="btn btn-primary btn-sm" (click)="goToLogin()">Đăng nhập</button>
      </div>
    </div>

    <div *ngIf="isLoggedIn" class="dify-custom-button" (click)="toggleChatWindow()" title="Mở chatbot">
      <i class="fas fa-comments"></i>
    </div>

    <div *ngIf="isLoggedIn && showChatWindow" class="dify-chat-window">
      <div class="dify-chat-body">
        <button class="floating-close" (click)="toggleChatWindow()" aria-label="Đóng chatbot">
          <i class="fas fa-times"></i>
        </button>

        <div class="messages" #messagesContainer (scroll)="onMessagesScroll()" style="scrollbar-width:thin;">
          <div *ngFor="let msg of messages" [ngClass]="['bubble', msg.role]">
            <div class="sender" *ngIf="msg.role === 'bot'">Assistant</div>
            <div *ngIf="msg.role === 'user'" class="content">{{ msg.content }}</div>
            <div *ngIf="msg.role === 'bot'" class="content" [innerHTML]="msg.formattedContent || ''"></div>
          </div>
          <div *ngIf="sending" class="bubble bot typing">
            <div class="dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <button
          *ngIf="shouldShowScrollToLatestButton"
          type="button"
          class="btn btn-primary btn-sm"
          (click)="scrollToLatest()"
          aria-label="Cuộn xuống tin nhắn mới nhất"
          style="position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:6;box-shadow:0 8px 18px rgba(37,99,235,.28);"
        >
          Cuộn xuống tin mới
        </button>

        <div *ngIf="error" class="dify-chat-state error inline">{{ error }}</div>

        <form class="chat-input" (ngSubmit)="sendMessage()">
          <input
            type="text"
            [(ngModel)]="inputMessage"
            name="chatInput"
            [disabled]="sending"
            placeholder="Nhập tin nhắn..."
            autocomplete="off"
          />
          <button class="send-btn" type="submit" [disabled]="sending || !inputMessage.trim()">
            <i class="fas" [ngClass]="sending ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'"></i>
          </button>
        </form>
      </div>
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
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .dify-custom-button:hover {
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 16px 36px rgba(37, 99, 235, 0.4);
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
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }


    .dify-chat-body {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-top: 8px;
      min-height: 0;
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

    .messages {
      flex: 1;
      min-height: 0;
      padding: 12px 12px 6px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bubble {
      max-width: 90%;
      padding: 10px 12px;
      border-radius: 14px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      font-size: 14px;
      line-height: 1.4;
    }

    .bubble.user {
      margin-left: auto;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #f8fafc;
      border-bottom-right-radius: 6px;
    }

    .bubble.bot {
      margin-right: auto;
      background: #ffffff;
      color: #0f172a;
      border-bottom-left-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .bubble .sender {
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 4px;
    }

    .bubble.typing {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 10px;
    }

    .dots span {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: bounce 1s infinite ease-in-out;
    }

    .dots span:nth-child(2) { animation-delay: 0.12s; }
    .dots span:nth-child(3) { animation-delay: 0.24s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.9); opacity: 0.6; }
      40% { transform: scale(1.2); opacity: 1; }
    }

    .chat-input {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .chat-input input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .chat-input input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .send-btn {
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #2563eb, #3b82f6);
      color: #f8fafc;
      display: grid;
      place-items: center;
      cursor: pointer;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .send-btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      box-shadow: none;
    }

    .send-btn:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 18px rgba(37, 99, 235, 0.3);
    }

    .dify-chat-state {
      padding: 12px;
      text-align: center;
      color: #333;
      font-size: 13px;
    }

    .dify-chat-state.error {
      color: #b91c1c;
      background: #fef2f2;
      border-top: 1px solid #fecdd3;
    }

    .dify-chat-state.inline {
      margin: 0 10px 8px;
      border-radius: 10px;
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

export class DifyChatbotComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  showChatWindow = false;
  messages: ChatMessage[] = [];
  conversationId: string | null = null;
  hasLoadedHistory = false;
  inputMessage = '';
  sending = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private readonly localStorageKey: string;
  private shouldAutoScroll = true;
  private readonly autoScrollEnableThresholdPx = 72;
  private readonly autoScrollDisableThresholdPx = 120;
  private readonly showScrollButtonThresholdPx = 160;

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  constructor(
    public authService: AuthService,
    private router: Router,
    private chatService: ChatService
  ) {
    this.localStorageKey = this.buildStorageKey();
  }

  ngOnInit(): void {
    if (this.authService && this.authService.currentUser$) {
      this.authService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe(user => {
          this.isLoggedIn = !!user;
          if (!this.isLoggedIn) {
            this.resetSession();
          }
          this.restoreConversation();
        });
    } else {
      this.isLoggedIn = !!this.authService?.isLoggedIn;
      this.restoreConversation();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChatWindow(): void {
    this.showChatWindow = !this.showChatWindow;
    if (this.showChatWindow && this.messages.length === 0) {
      this.pushBotMessage('Chào bạn! Mình có thể hỗ trợ gì hôm nay?');
    }
    if (this.showChatWindow) {
      this.shouldAutoScroll = true;
      this.scrollToBottom(true);
    }
    if (this.showChatWindow && !this.hasLoadedHistory && this.conversationId) {
      this.loadHistory();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  sendMessage(): void {
    const content = this.inputMessage.trim();
    if (!content || this.sending) {
      return;
    }
    this.error = null;
    this.sending = true;
    this.pushUserMessage(content);
    this.inputMessage = '';

    this.chatService.sendMessage(content, this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ChatSendResponse) => {
          this.conversationId = res.conversationId;
          this.persistConversation();
          this.pushBotMessage(res.answer || '');
          this.sending = false;
        },
        error: () => {
          this.error = 'Không gửi được tin nhắn. Vui lòng thử lại.';
          this.sending = false;
        }
      });
  }

  private pushUserMessage(content: string): void {
    this.messages.push({ role: 'user', content, formattedContent: this.formatUserMessage(content) });
    this.scrollToBottom(true);
  }

  private pushBotMessage(content: string): void {
    this.messages.push({ role: 'bot', content, formattedContent: this.formatBotMessage(content) });
    this.scrollToBottom();
  }

  get shouldShowScrollToLatestButton(): boolean {
    return this.showChatWindow && this.getDistanceFromBottom() > this.showScrollButtonThresholdPx;
  }

  onMessagesScroll(): void {
    const distanceFromBottom = this.getDistanceFromBottom();
    this.shouldAutoScroll = this.shouldAutoScroll
      ? distanceFromBottom <= this.autoScrollDisableThresholdPx
      : distanceFromBottom <= this.autoScrollEnableThresholdPx;
  }

  scrollToLatest(): void {
    this.shouldAutoScroll = true;
    this.scrollToBottom(true);
  }

  private resetSession(): void {
    this.messages = [];
    this.conversationId = null;
    this.hasLoadedHistory = false;
    this.inputMessage = '';
    this.sending = false;
    this.error = null;
    this.shouldAutoScroll = true;
    this.persistConversation();
  }

  private scrollToBottom(force = false): void {
    if (!force && !this.shouldAutoScroll) {
      return;
    }
    setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
        this.shouldAutoScroll = true;
      }
    }, 0);
  }

  private getDistanceFromBottom(): number {
    const el = this.messagesContainer?.nativeElement;
    if (!el) {
      return 0;
    }
    return el.scrollHeight - (el.scrollTop + el.clientHeight);
  }

  private loadHistory(): void {
    if (!this.conversationId) {
      return;
    }
    this.chatService.getMessages(this.conversationId, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ChatHistoryResponse) => {
          const history = [...(res.data || [])]
            .reverse()
            .map(item => ({
              role: 'user' as const,
              content: item.query,
              createdAt: item.created_at
            }))
            .flatMap(userMsg => {
              const botAnswer = res.data?.find(m => m.query === userMsg.content)?.answer;
              return botAnswer ? [userMsg, { role: 'bot' as const, content: botAnswer, createdAt: userMsg.createdAt }] : [userMsg];
            });
          if (history.length) {
            this.messages = (history as ChatMessage[]).map(message => ({
              ...message,
              formattedContent: message.role === 'bot'
                ? this.formatBotMessage(message.content)
                : this.formatUserMessage(message.content)
            }));
          }
          this.hasLoadedHistory = true;
          this.shouldAutoScroll = true;
          this.scrollToBottom(true);
        },
        error: () => {
          this.error = 'Không tải được lịch sử trò chuyện.';
          this.hasLoadedHistory = true;
        }
      });
  }

  private persistConversation(): void {
    if (this.conversationId) {
      localStorage.setItem(this.localStorageKey, this.conversationId);
    } else {
      localStorage.removeItem(this.localStorageKey);
    }
  }

  private restoreConversation(): void {
    const stored = localStorage.getItem(this.localStorageKey);
    this.conversationId = stored || null;
    this.hasLoadedHistory = false;
  }

  private buildStorageKey(): string {
    const user = this.authService?.currentUser?.username || 'anon';
    return `chat_conversation_${user}`;
  }

  private formatBotMessage(content: string): string {
    return formatChatMessage(content);
  }

  private formatUserMessage(content: string): string {
    return content;
  }
}
