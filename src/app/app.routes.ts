import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './guards/guards';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent) },
  { path: 'products/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
  { path: 'search', loadComponent: () => import('./pages/search-results/search-results.component').then(m => m.SearchResultsComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'chatbot', loadComponent: () => import('./pages/chatbot/chatbot.component').then(m => m.ChatbotComponent) },

  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },

  { path: 'cart', canActivate: [authGuard], loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },

  { path: 'account/profile', canActivate: [authGuard], loadComponent: () => import('./pages/account/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'account/orders', canActivate: [authGuard], loadComponent: () => import('./pages/account/orders/orders.component').then(m => m.OrdersComponent) },
  { path: 'account/orders/:id', canActivate: [authGuard], loadComponent: () => import('./pages/account/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
  { path: 'account/change-password', canActivate: [authGuard], loadComponent: () => import('./pages/account/change-password/change-password.component').then(m => m.ChangePasswordComponent) },

  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'admin/dashboard', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'admin/products', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/products/admin-products.component').then(m => m.AdminProductsComponent) },
  { path: 'admin/products/add', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/products/product-form.component').then(m => m.ProductFormComponent) },
  { path: 'admin/products/:id/edit', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/products/product-form.component').then(m => m.ProductFormComponent) },
  { path: 'admin/categories', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/categories/admin-categories.component').then(m => m.AdminCategoriesComponent) },
  { path: 'admin/categories/add', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/categories/category-form.component').then(m => m.CategoryFormComponent) },
  { path: 'admin/categories/:id/edit', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/categories/category-form.component').then(m => m.CategoryFormComponent) },
  { path: 'admin/orders', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
  { path: 'admin/orders/:id', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/orders/admin-order-detail.component').then(m => m.AdminOrderDetailComponent) },
  { path: 'admin/users', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/users/admin-users.component').then(m => m.AdminUsersComponent) },

  { path: 'access-denied', loadComponent: () => import('./pages/error/access-denied.component').then(m => m.AccessDeniedComponent) },
  { path: '**', loadComponent: () => import('./pages/error/not-found.component').then(m => m.NotFoundComponent) }
];
