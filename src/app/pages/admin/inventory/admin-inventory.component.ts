import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../../../components/admin-layout/admin-layout.component';
import { InventoryService } from '../../../services/inventory.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  template: `
    <app-admin-layout>
      <div class="row mb-4 mt-3">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h2 class="fw-bold"><i class="fas fa-warehouse me-2"></i>Quản lý tồn kho</h2>
            <p class="text-muted mb-0">Theo dõi số lượng tồn kho theo kho</p>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4 ms-auto">
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Tìm theo tên sản phẩm"
                  [(ngModel)]="searchTerm"
                >
              </div>
            </div>
          </div>

          <div class="text-center py-5" *ngIf="loading">
            <div class="spinner-border text-primary"></div>
          </div>

          <div *ngIf="!loading">
            <div class="table-responsive">
              <table class="table align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>Kho</th>
                    <th class="text-center">Số lượng</th>
                    <th class="text-center">Trạng thái</th>
                    <th class="text-center">Cập nhật lần cuối</th>
                    <th class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of filteredInventory()">
                    <td>{{ item.productName }}</td>
                    <td>{{ item.warehouseName }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="getStatusClass(item.quantity)">
                        {{ getStatusLabel(item.quantity) }}
                      </span>
                    </td>
                    <td class="text-center">{{ item.lastUpdated | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td class="text-center">
                      <button class="btn btn-sm btn-outline-primary" (click)="openAdjustModal(item)">
                        Điều chỉnh tồn kho
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!filteredInventory().length">
                    <td colspan="6" class="text-center text-muted py-4">Không có dữ liệu tồn kho</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

<!--      &lt;!&ndash; Modal điều chỉnh tồn kho &ndash;&gt;-->
<!--      <div class="modal fade show" tabindex="-1" style="display:block;background:rgba(0,0,0,.5)" *ngIf="showModal">-->
<!--        <div class="modal-dialog">-->
<!--          <div class="modal-content">-->
<!--            <div class="modal-header">-->
<!--              <h5 class="modal-title">Điều chỉnh tồn kho</h5>-->
<!--              <button type="button" class="btn-close" (click)="closeModal()"></button>-->
<!--            </div>-->
<!--            <div class="modal-body" *ngIf="selectedItem">-->
<!--              <p class="mb-2"><strong>Sản phẩm:</strong> {{ selectedItem.productName }}</p>-->
<!--              <p class="mb-3"><strong>Kho:</strong> {{ selectedItem.warehouseName }}</p>-->

<!--              <div class="mb-3">-->
<!--                <label class="form-label">Số lượng điều chỉnh (+/-)</label>-->
<!--                <input type="number" class="form-control" [(ngModel)]="adjustQuantity">-->
<!--              </div>-->
<!--              <div class="mb-3">-->
<!--                <label class="form-label">Ghi chú</label>-->
<!--                <textarea class="form-control" rows="3" [(ngModel)]="adjustNote"></textarea>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="modal-footer">-->
<!--              <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>-->
<!--              <button type="button" class="btn btn-primary" (click)="submitAdjust()" [disabled]="saving">-->
<!--                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>-->
<!--                Lưu điều chỉnh-->
<!--              </button>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
    </app-admin-layout>
  `
})
export class AdminInventoryComponent implements OnInit {
  inventory: any[] = [];
  loading = true;
  saving = false;
  searchTerm = '';

  showModal = false;
  selectedItem: any | null = null;
  adjustQuantity: number = 0;
  adjustNote: string = '';

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.loading = true;
    this.inventoryService.getAllInventory().subscribe({
      next: data => { this.inventory = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  filteredInventory(): any[] {
    if (!this.searchTerm) return this.inventory;
    const term = this.searchTerm.toLowerCase();
    return this.inventory.filter(i => (i.productName || '').toLowerCase().includes(term));
  }

  getStatusClass(qty: number): string {
    if (qty === 0) return 'bg-danger';
    if (qty < 10) return 'bg-warning text-dark';
    return 'bg-success';
  }

  getStatusLabel(qty: number): string {
    if (qty === 0) return 'Out of Stock';
    if (qty < 10) return 'Low Stock';
    return 'Available';
  }

  openAdjustModal(item: any): void {
    this.selectedItem = item;
    this.adjustQuantity = 0;
    this.adjustNote = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedItem = null;
  }

  submitAdjust(): void {
    if (!this.selectedItem || !this.adjustQuantity) return;
    this.saving = true;
    const payload = {
      productId: this.selectedItem.productId,
      warehouseId: this.selectedItem.warehouseId,
      quantityChange: this.adjustQuantity,
      note: this.adjustNote
    };
    this.inventoryService.updateStock(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadInventory();
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}

