import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): AuthResponse | null {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => {
        localStorage.setItem('currentUser', JSON.stringify(res));
        localStorage.setItem('token', res.token);
        this.currentUserSubject.next(res);
      })
    );
  }

  register(req: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, req);
  }


  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get isAdmin(): boolean {
    const roles = this.currentUser?.roles ?? [];
    return roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  }

  get isStaff(): boolean {
    const roles = this.currentUser?.roles ?? [];
    return roles.includes('ROLE_STAFF') || roles.includes('STAFF');
  }

  get isUser(): boolean {
    return this.currentUser?.roles?.includes('ROLE_USER') ?? false;
  }
}
