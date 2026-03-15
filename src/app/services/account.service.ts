import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../environments/environment';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordResponse {
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = `${environment.apiUrl}/account`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data);
  }

  changePassword(current: string, newPass: string, confirm: string): Observable<ChangePasswordResponse> {
    const payload: ChangePasswordRequest = {
      currentPassword: current,
      newPassword: newPass,
      confirmPassword: confirm
    };

    return this.http.put<ChangePasswordResponse>(`${this.apiUrl}/change-password`, payload);
  }
}

