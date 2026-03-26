import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private adminApiUrl = `${environment.apiUrl}/admin/categories`;

  constructor(private http: HttpClient) {}

  // Public categories (for storefront)
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // Admin categories (with productCount, subCategories, etc.)
  getAllAdmin(): Observable<Category[]> {
    return this.http.get<Category[]>(this.adminApiUrl);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get flattened list of all categories (main + sub combined)
   */
  getAllFlat(): Observable<Category[]> {
    return this.getAll().pipe(
      map(categories => this.flattenCategories(categories))
    );
  }

  /**
   * Get list of main categories only
   */
  getMainCategories(): Observable<Category[]> {
    return this.getAll().pipe(
      map(categories => categories.filter(cat => cat.isMainCategory))
    );
  }

  /**
   * Get sub-categories for a main category
   */
  getSubCategories(mainCategoryId: number): Observable<Category[]> {
    return this.getById(mainCategoryId).pipe(
      map(category => category.subCategories || [])
    );
  }

  private flattenCategories(categories: Category[]): Category[] {
    const result: Category[] = [];
    for (const cat of categories) {
      result.push(cat);
      if (cat.subCategories) {
        result.push(...cat.subCategories);
      }
    }
    return result;
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
