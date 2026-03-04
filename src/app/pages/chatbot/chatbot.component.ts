import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ChatbotService } from '../../services/chatbot.service';
import { ChatMessage } from '../../models/models';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <div class="chatbot-container">
          <div class="text-center mb-4">
            <h2 class="fw-bold text-primary"><i class="fas fa-robot me-2"></i>AI Chatbot</h2>
            <p class="text-muted">Trợ lý AI tư vấn dược phẩm của Vintage Pharmacy</p>
          </div>
          <div class="card shadow-sm">
            <div class="card-header bg-gradient-primary text-white">
              <i class="fas fa-robot me-2"></i>Vintage AI Assistant
            </div>
            <div class="card-body p-0">
              <div class="chat-messages" #chatContainer>
                <div class="message bot" *ngIf="messages.length === 0">
                  <div class="message-bubble">
                    Xin chào! Tôi là trợ lý AI của Vintage Pharmacy. Tôi có thể tư vấn về các sản phẩm dược phẩm, thực phẩm chức năng và sức khỏe. Bạn cần hỗ trợ gì?
                  </div>
                </div>
                <div class="message" *ngFor="let msg of messages" [class.user]="msg.role==='user'" [class.bot]="msg.role==='bot'">
                  <div class="message-bubble" [innerHTML]="msg.content"></div>
                </div>
                <div class="message bot" *ngIf="thinking">
                  <div class="message-bubble"><span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <form class="d-flex gap-2" (ngSubmit)="send()">
                <input type="text" class="form-control" placeholder="Nhập câu hỏi của bạn..." [(ngModel)]="input" name="msg" [disabled]="thinking">
                <button type="submit" class="btn btn-primary" [disabled]="!input.trim() || thinking">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </form>
              <div class="mt-2 d-flex flex-wrap gap-2">
                <button class="btn btn-outline-secondary btn-sm" *ngFor="let q of quickQuestions" (click)="quickSend(q)">{{ q }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class ChatbotComponent {
  messages: ChatMessage[] = [];
  input = '';
  thinking = false;
  quickQuestions = ['Vitamin C tốt như thế nào?', 'Sản phẩm nào tốt cho xương?', 'Tư vấn bổ sung canxi', 'Omega-3 có tác dụng gì?'];

  constructor(private chatbotService: ChatbotService) {}

  send(): void {
    const msg = this.input.trim();
    if (!msg) return;
    this.messages.push({ role: 'user', content: msg });
    this.input = '';
    this.thinking = true;
    this.chatbotService.sendMessage(msg).subscribe({
      next: res => { this.messages.push({ role: 'bot', content: res.response }); this.thinking = false; },
      error: () => { this.messages.push({ role: 'bot', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }); this.thinking = false; }
    });
  }

  quickSend(q: string): void {
    this.input = q;
    this.send();
  }
}

