import { Component } from '@angular/core';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <div class="container my-5">
        <div class="row mb-5">
          <div class="col-lg-8 mx-auto text-center">
            <h1 class="fw-bold text-primary"><i class="fas fa-heartbeat me-2"></i>Về chúng tôi</h1>
            <p class="lead text-muted">Vintage Pharmacy – Đồng hành cùng sức khỏe của bạn</p>
          </div>
        </div>
        <div class="row g-5 align-items-center mb-5">
          <div class="col-lg-6">
            <h2 class="fw-bold mb-3">Câu chuyện của chúng tôi</h2>
            <p>Vintage Pharmacy được thành lập với sứ mệnh mang đến những sản phẩm dược phẩm chức năng chất lượng cao, được kiểm định nghiêm ngặt, phục vụ sức khỏe cộng đồng.</p>
            <p>Với hơn 10 năm kinh nghiệm trong lĩnh vực dược phẩm, chúng tôi tự hào là đơn vị phân phối uy tín, được hàng nghìn khách hàng tin tưởng lựa chọn.</p>
          </div>
          <div class="col-lg-6 text-center">
            <i class="fas fa-clinic-medical text-primary" style="font-size:10rem;opacity:0.2"></i>
          </div>
        </div>
        <div class="row g-4 text-center">
          <div class="col-md-3">
            <div class="card p-4 shadow-sm">
              <h2 class="display-4 fw-bold text-primary">10+</h2>
              <p class="text-muted">Năm kinh nghiệm</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-4 shadow-sm">
              <h2 class="display-4 fw-bold text-success">500+</h2>
              <p class="text-muted">Sản phẩm chất lượng</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-4 shadow-sm">
              <h2 class="display-4 fw-bold text-warning">50K+</h2>
              <p class="text-muted">Khách hàng hài lòng</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card p-4 shadow-sm">
              <h2 class="display-4 fw-bold text-info">24/7</h2>
              <p class="text-muted">Hỗ trợ khách hàng</p>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class AboutComponent {}

