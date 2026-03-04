import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats, User, Page } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard`);
  }

  getUsers(page = 0, size = 10): Observable<Page<User>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<User>>(`${this.base}/users`, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/users/${id}`);
  }

  toggleLock(id: number): Observable<User> {
    return this.http.post<User>(`${this.base}/users/${id}/toggle-lock`, {});
  }

  toggleRole(id: number, role: string): Observable<User> {
    return this.http.post<User>(`${this.base}/users/${id}/toggle-role`, { role });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }
}

