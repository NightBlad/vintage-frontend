import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartSummary } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<CartSummary> {
    return this.http.get<CartSummary>(this.apiUrl).pipe(
      tap(cart => this.cartCountSubject.next(cart.totalItems))
    );
  }

  addItem(productId: number, quantity = 1): Observable<CartSummary> {
    return this.http.post<CartSummary>(`${this.apiUrl}/add`, { productId, quantity }).pipe(
      tap(cart => this.cartCountSubject.next(cart.totalItems))
    );
  }

  updateItem(productId: number, quantity: number): Observable<CartSummary> {
    return this.http.put<CartSummary>(`${this.apiUrl}/update`, { productId, quantity }).pipe(
      tap(cart => this.cartCountSubject.next(cart.totalItems))
    );
  }

  removeItem(productId: number): Observable<CartSummary> {
    return this.http.delete<CartSummary>(`${this.apiUrl}/remove/${productId}`).pipe(
      tap(cart => this.cartCountSubject.next(cart.totalItems))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`);
  }

  refreshCount(): void {
    this.getCart().subscribe({
      next: () => {},
      error: () => this.cartCountSubject.next(0)
    });
  }
}

