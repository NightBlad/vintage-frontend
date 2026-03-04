import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // Admin
  create(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/admin/categories`, category);
  }

  update(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${environment.apiUrl}/admin/categories/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/admin/categories/${id}`);
  }
}

