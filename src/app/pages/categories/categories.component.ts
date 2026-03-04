import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <h2 class="fw-bold mb-2"><i class="fas fa-th-large me-2 text-primary"></i>Danh Mục Sản Phẩm</h2>
        <p class="text-muted mb-5">Tìm kiếm sản phẩm theo danh mục phù hợp với nhu cầu của bạn</p>
        <div class="row g-4" *ngIf="categories.length">
          <div class="col-lg-3 col-md-4 col-6" *ngFor="let cat of categories">
            <a [routerLink]="['/products']" [queryParams]="{categoryId: cat.id}" class="text-decoration-none">
              <div class="card h-100 text-center shadow-sm p-4">
                <i class="fas fa-pills fa-3x text-primary mb-3"></i>
                <h5 class="fw-bold text-dark">{{ cat.name }}</h5>
                <p class="text-muted small" *ngIf="cat.description">{{ cat.description }}</p>
                <span class="badge bg-primary mt-2" *ngIf="cat.productCount">{{ cat.productCount }} sản phẩm</span>
              </div>
            </a>
          </div>
        </div>
        <div class="text-center py-5" *ngIf="loading"><div class="spinner-border text-primary"></div></div>
      </div>
    </app-layout>
  `
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: c => { this.categories = c; this.loading = false; },
      error: () => this.loading = false
    });
  }
}

