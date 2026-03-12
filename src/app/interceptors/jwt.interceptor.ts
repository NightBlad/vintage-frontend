import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api/v1');

  if (isApiRequest) {
    req = req.clone({ withCredentials: true });
  }

  // Do not attach bearer token to public auth endpoints.
  const isPublicAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  if (isPublicAuthEndpoint) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};
