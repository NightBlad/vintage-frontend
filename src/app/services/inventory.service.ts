import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getStockStatus(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status/${productId}`);
  }

  getAllInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  updateStock(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transaction`, data);
  }
}

