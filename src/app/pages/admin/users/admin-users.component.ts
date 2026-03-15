import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { AdminService } from '../../../services/admin.service';
import { User, Page } from '../../../models/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12">
          <h2 class="fw-bold"><i class="fas fa-users me-2"></i>Quản lý người dùng</h2>
          <p class="text-muted mb-0">Danh sách tài khoản trong hệ thống</p>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-primary"></div>
          </div>

          <div *ngIf="!loading">
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Tên đăng nhập</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th class="text-center">Vai trò</th>
                    <th class="text-center">Trạng thái</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of page?.content; let i = index">
                    <td>{{ (currentPage * 10) + i + 1 }}</td>
                    <td><code>{{ u.username }}</code></td>
                    <td>{{ u.fullName }}</td>
                    <td>{{ u.email }}</td>
                    <td>{{ u.phone || '—' }}</td>
                    <td class="text-center">
                      <span *ngFor="let r of u.roles" class="badge me-1" [ngClass]="r === 'ROLE_ADMIN' ? 'bg-danger' : 'bg-primary'">
                        {{ r === 'ROLE_ADMIN' ? 'Admin' : 'User' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="u.accountLocked ? 'bg-danger' : 'bg-success'">
                        <i class="fas" [class]="u.accountLocked ? 'fa-user-lock' : 'fa-check-circle'"></i>
                        {{ u.accountLocked ? ' Bị khóa' : ' Hoạt động' }}
                      </span>
                    </td>
                    <td class="text-center">
                      <button class="btn btn-sm me-1"
                              [ngClass]="u.accountLocked ? 'btn-success' : 'btn-warning'"
                              (click)="toggleLock(u)"
                              [title]="u.accountLocked ? 'Mở khóa' : 'Khóa tài khoản'">
                        <i class="fas" [class]="u.accountLocked ? 'fa-lock-open' : 'fa-lock'"></i>
                      </button>

                      <button class="btn btn-sm btn-outline-secondary me-1"
                              (click)="toggleRole(u)"
                              [title]="isAdmin(u) ? 'Hủy quyền Admin' : 'Cấp quyền Admin'">
                        <i class="fas fa-user-shield" [class.text-danger]="isAdmin(u)"></i>
                      </button>

                      <button class="btn btn-sm btn-danger" (click)="deleteUser(u)" title="Xóa">
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!page?.content?.length">
                    <td colspan="8" class="text-center text-muted py-4">Không có người dùng nào</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <nav *ngIf="page && page.totalPages > 1" class="mt-3">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="page.first">
                  <button class="page-link" (click)="loadPage(currentPage - 1)"><i class="fas fa-chevron-left"></i></button>
                </li>
                <li class="page-item" *ngFor="let n of getPages()" [class.active]="n === currentPage">
                  <button class="page-link" (click)="loadPage(n)">{{ n + 1 }}</button>
                </li>
                <li class="page-item" [class.disabled]="page.last">
                  <button class="page-link" (click)="loadPage(currentPage + 1)"><i class="fas fa-chevron-right"></i></button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div class="alert alert-danger mt-3" *ngIf="error">{{ error }}</div>
    </app-admin-layout>
  `
})
export class AdminUsersComponent implements OnInit {
  page: Page<User> | null = null;
  loading = true;
  currentPage = 0;
  error = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(p: number): void {
    this.loading = true;
    this.currentPage = p;
    this.adminService.getUsers(p, 10).subscribe({
      next: data => {
        this.page = data;
        this.loading = false; },
      error: () => {
        this.error = 'Tải danh sách người dùng thất bại';
        this.loading = false; }
    });
  }

  isAdmin(u: any): boolean {
    return u?.roles?.includes('ROLE_ADMIN') || false;
  }

  toggleLock(u: User): void {
    const action = u.accountLocked ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${u.username}"?`)) return;

    this.adminService.toggleLock(u.id).subscribe({
      next: (updatedUser: any) => {
        // Cập nhật lại user trong danh sách hiện tại
        if (this.page && this.page.content) {
          const idx = this.page.content.findIndex(x => x.id === u.id);
          if (idx !== -1) {
            this.page.content[idx] = updatedUser;
          }
        }
      },
      error: (err) => {
        console.error(err);
        alert('Thao tác khóa/mở khóa thất bại! Vui lòng kiểm tra lại Backend.');
      }
    });
  }

  toggleRole(u: User): void {
    const role = 'ROLE_ADMIN';
    const action = this.isAdmin(u) ? 'xóa quyền Admin' : 'cấp quyền Admin';
    if (!confirm(`Bạn có chắc muốn ${action} cho "${u.username}"?`)) return;

    this.adminService.toggleRole(u.id, role).subscribe({
      next: (updatedUser: any) => {
        if (this.page && this.page.content) {
          const idx = this.page.content.findIndex(x => x.id === u.id);
          if (idx !== -1) {
            this.page.content[idx] = updatedUser;
          }
        }
      },
      error: () => alert('Không thể cập nhật quyền hạn!')
    });
  }

  deleteUser(u: User): void {
    if (this.isAdmin(u)) {
      alert('Không thể xóa tài khoản Quản trị viên!');
      return;
    }
    if (!confirm(`Xóa tài khoản "${u.username}"?`)) return;

    this.adminService.deleteUser(u.id).subscribe({
      next: () => this.loadPage(this.currentPage),
      error: () => alert('Lỗi khi xóa người dùng!')
    });
  }

  getPages(): number[] {
    if (!this.page) return [];
    return Array.from({ length: this.page.totalPages }, (_, i) => i);
  }
}
