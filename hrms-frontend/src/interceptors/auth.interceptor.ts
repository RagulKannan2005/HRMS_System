import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token && token !== 'undefined' && token !== null && token.trim() !== '') {
    const colonereq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(colonereq);
  }
  return next(req);
};
