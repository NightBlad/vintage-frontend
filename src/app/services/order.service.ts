import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, Page, CheckoutRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  getMyOrders(page = 0, size = 10): Observable<Page<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Order>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  placeOrder(req: CheckoutRequest): Observable<Order> {
    return this.http.post<Order>(`${environment.apiUrl}/cart/place-order`, req);
  }

  cancelOrder(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // Admin
  adminGetAll(page = 0, size = 10, status?: string): Observable<Page<Order>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<Order>>(`${environment.apiUrl}/admin/orders`, { params });
  }

  adminGetById(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/admin/orders/${id}`);
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.put<Order>(`${environment.apiUrl}/admin/orders/${id}/status`, { status });
  }

  updatePaymentStatus(id: number, paymentStatus: string): Observable<Order> {
    return this.http.put<Order>(`${environment.apiUrl}/admin/orders/${id}/payment-status`, { paymentStatus });
  }
}
