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

        <div class="row g-5" *ngIf="mainCategories.length && !loading">
          <div class="col-12" *ngFor="let mainCat of mainCategories">
            <div class="category-section">
              <!-- Main Category -->
              <div class="row g-4">
                <div class="col-lg-3 col-md-4 col-6">
                  <a [routerLink]="['/products']" [queryParams]="{mainCategoryId: mainCat.id}" class="text-decoration-none">
                    <div class="card h-100 text-center shadow-sm p-4 main-category-card">
                      <i class="fas fa-pills fa-3x text-primary mb-3"></i>
                      <h5 class="fw-bold text-dark">{{ mainCat.name }}</h5>
                      <p class="text-muted small" *ngIf="mainCat.description">{{ mainCat.description }}</p>
                      <span class="badge bg-primary mt-2" *ngIf="mainCat.productCount">{{ mainCat.productCount }} sản phẩm</span>
                    </div>
                  </a>
                </div>

                <!-- Sub Categories -->
                <div class="col-lg-9 col-md-8">
                  <div class="row g-4">
                    <div class="col-lg-3 col-md-4 col-6" *ngFor="let subCat of mainCat.subCategories">
                      <a [routerLink]="['/products']" [queryParams]="{subCategoryId: subCat.id}" class="text-decoration-none">
                        <div class="card h-100 text-center shadow-sm p-3 sub-category-card">
                          <i class="fas fa-layer-group fa-2x text-info mb-2"></i>
                          <h6 class="fw-bold text-dark small">{{ subCat.name }}</h6>
                          <p class="text-muted small" *ngIf="subCat.description">{{ subCat.description }}</p>
                          <span class="badge bg-info mt-1 small" *ngIf="subCat.productCount">{{ subCat.productCount }}</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-5" *ngIf="loading">
          <div class="spinner-border text-primary"></div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .category-section {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 2rem;
    }
    .main-category-card {
      border: 2px solid var(--primary-color);
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(14, 165, 233, 0.05));
      transition: all 0.3s ease;
    }
    .main-category-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(37, 99, 235, 0.15) !important;
    }
    .sub-category-card {
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }
    .sub-category-card:hover {
      border-color: var(--info-color);
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.03), rgba(14, 165, 233, 0.03));
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(14, 165, 233, 0.1) !important;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  mainCategories: Category[] = [];
  loading = true;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: c => {
        this.mainCategories = c.filter(cat => cat.isMainCategory);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}

