import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, Page } from '../models/models';
import { environment } from '../../environments/environment';
import { resolveAvailableQuantity } from '../utils/product-stock.util';
@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  constructor(private http: HttpClient) {}
  getAll(page = 0, size = 12, mainCategoryId?: number, subCategoryId?: number): Observable<Page<Product>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (mainCategoryId) params = params.set('mainCategoryId', mainCategoryId);
    if (subCategoryId) params = params.set('subCategoryId', subCategoryId);
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => this.normalizePage<Product>(response, page, size))
    );
  }
  getById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(product => this.normalizeProduct(product))
    );
  }
  getFeatured(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/featured`).pipe(
      map(response => this.normalizeArray<Product>(response))
    );
  }
  search(query: string, page = 0, size = 12): Observable<Page<Product>> {
    const params = new HttpParams()
      .set('keyword', query)
      .set('page', page)
      .set('size', size);
    return this.http.get<any>(`${environment.apiUrl}/search`, { params }).pipe(
      map(response => this.normalizePage<Product>(response, page, size))
    );
  }
  // Admin
  create(formData: FormData): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/admin/products`, formData);
  }
  update(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/admin/products/${id}`, formData);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/products/${id}`);
  }
  adminGetAll(page = 0, size = 10, q?: string): Observable<Page<Product>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<any>(`${environment.apiUrl}/admin/products`, { params }).pipe(
      map(response => this.normalizePage<Product>(response, page, size))
    );
  }
  private normalizeProduct(product: any): Product {
    const stockQuantity = Number(product?.stockQuantity ?? 0);
    const availableQuantity = resolveAvailableQuantity({
      availableQuantity: product?.availableQuantity,
      stockQuantity
    });
    return {
      ...product,
      stockQuantity,
      availableQuantity
    } as Product;
  }
  private normalizeArray<T>(response: any): T[] {
    if (Array.isArray(response)) return response.map(item => this.normalizeProduct(item)) as T[];
    if (response && Array.isArray(response.content)) {
      return response.content.map((item: any) => this.normalizeProduct(item)) as T[];
    }
    return [];
  }

  private normalizePage<T>(response: any, page: number, size: number): Page<T> {
    if (Array.isArray(response)) {
      const normalized = response.map(item => this.normalizeProduct(item));
      return {
        content: normalized as T[],
        totalPages: normalized.length ? 1 : 0,
        totalElements: normalized.length,
        number: page,
        size,
        first: page === 0,
        last: true
      };
    }
    if (response && Array.isArray(response.content)) {
      const normalized = response.content.map((item: any) => this.normalizeProduct(item));
      return {
        content: normalized as T[],
        totalPages: response.totalPages ?? 0,
        totalElements: response.totalElements ?? normalized.length,
        number: response.number ?? page,
        size: response.size ?? size,
        first: response.first ?? (response.number ?? page) === 0,
        last: response.last ?? true
      };
    }
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      number: page,
      size,
      first: true,
      last: true
    };
  }
}
