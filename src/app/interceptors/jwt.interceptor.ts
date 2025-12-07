import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();

  if (token) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refresh().pipe(
          switchMap((response: any) => {
            isRefreshing = false;
            refreshTokenSubject.next(response.accessToken);
            return next(addToken(req, response.accessToken));
          }),
          catchError((err) => {
            isRefreshing = false;
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function addToken(request: any, token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
