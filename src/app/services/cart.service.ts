import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { CartItem, CartResponse } from '../models/models';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  constructor(private http: HttpClient) {}
  private toNumber(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  private normalizeItem(item: any): CartItem {
    const quantity = this.toNumber(item?.quantity);
    const price = this.toNumber(item?.price);
    const subtotal = this.toNumber(item?.subtotal, price * quantity);
    return {
      productId: this.toNumber(item?.productId ?? item?.productID),
      productName: (item?.productName ?? '').toString(),
      imageUrl: item?.imageUrl ?? item?.ImageUrl ?? null,
      price,
      originalPrice: this.toNumber(item?.originalPrice, price),
      quantity,
      subtotal,
      stockQuantity: this.toNumber(item?.stockQuantity ?? item?.stockquantity)
    };
  }
  private normalizeCart(payload: any): CartResponse {
    const items: CartItem[] = Array.isArray(payload?.items) ? payload.items.map((item: any) => this.normalizeItem(item)) : [];
    const fallbackTotalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const fallbackTotalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    return {
      items,
      totalItems: this.toNumber(payload?.totalItems, fallbackTotalItems),
      totalAmount: this.toNumber(payload?.totalAmount, fallbackTotalAmount)
    };
  }
  private hasCartItems(payload: any): boolean {
    return !!payload && typeof payload === 'object' && Array.isArray(payload.items);
  }
  private fetchCartFromApi(): Observable<CartResponse> {
    return this.http.get<any>(this.apiUrl).pipe(map(payload => this.normalizeCart(payload)));
  }
  private withCartFallback(source$: Observable<any>): Observable<CartResponse> {
    return source$.pipe(
      switchMap(payload => this.hasCartItems(payload) ? of(this.normalizeCart(payload)) : this.fetchCartFromApi()),
      tap(cart => this.cartCountSubject.next(cart.totalItems))
    );
  }
  getCart(): Observable<CartResponse> {
    return this.fetchCartFromApi().pipe(
      tap(cart => this.cartCountSubject.next(cart.totalItems))
    );
  }
  addItem(productId: number, quantity = 1): Observable<CartResponse> {
    return this.withCartFallback(this.http.post<any>(`${this.apiUrl}/add`, { productId, quantity }));
  }
  updateItem(productId: number, quantity: number): Observable<CartResponse> {
    return this.withCartFallback(this.http.put<any>(`${this.apiUrl}/update`, { productId, quantity }));
  }
  removeItem(productId: number): Observable<CartResponse> {
    return this.withCartFallback(this.http.delete<any>(`${this.apiUrl}/remove/${productId}`));
  }
  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartCountSubject.next(0))
    );
  }
  refreshCount(): void {
    this.getCart().subscribe({
      next: () => {},
      error: () => this.cartCountSubject.next(0)
    });
  }
}


