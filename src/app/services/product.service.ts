import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<Page<Product>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  search(query: string, page = 0, size = 12): Observable<Page<Product>> {
    const params = new HttpParams().set('q', query).set('page', page).set('size', size);
    return this.http.get<Page<Product>>(`${environment.apiUrl}/search`, { params });
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
}

