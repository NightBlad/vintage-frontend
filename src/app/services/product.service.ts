import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, Page } from '../models/models';
import { environment } from '../../environments/environment';
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
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  getFeatured(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/featured`).pipe(
      map(response => this.normalizeArray<Product>(response))
    );
  }
  search(query: string, page = 0, size = 12): Observable<Page<Product>> {
    const params = new HttpParams().set('q', query).set('page', page).set('size', size);
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
  adminGetAll(page = 0, size = 10): Observable<Page<Product>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Product>>(`${environment.apiUrl}/admin/products`, { params });
  }
  private normalizeArray<T>(response: any): T[] {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.content)) return response.content;
    return [];
  }

  private normalizePage<T>(response: any, page: number, size: number): Page<T> {
    if (Array.isArray(response)) {
      return {
        content: response,
        totalPages: response.length ? 1 : 0,
        totalElements: response.length,
        number: page,
        size,
        first: page === 0,
        last: true
      };
    }
    if (response && Array.isArray(response.content)) {
      return {
        content: response.content,
        totalPages: response.totalPages ?? 0,
        totalElements: response.totalElements ?? response.content.length,
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
