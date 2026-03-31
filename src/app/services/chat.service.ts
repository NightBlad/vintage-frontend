import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatSendResponse {
  answer: string;
  conversationId: string;
  messageId?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly baseUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string, conversationId?: string | null): Observable<ChatSendResponse> {
    const payload: { message: string; conversationId?: string } = { message };
    if (conversationId) {
      payload.conversationId = conversationId;
    }
    return this.http.post<ChatSendResponse>(`${this.baseUrl}/message`, payload);
  }
}

