import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NbAuthService } from '@nebular/auth';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: NbAuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If the Backend says "401 Unauthorized" (User not found / Token invalid)
        if (error.status === 401) {
          // 1. Force logout (clears the stale token from LocalStorage)
          this.authService.logout('email').subscribe(); 
          
          // 2. Redirect to Login Page
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}