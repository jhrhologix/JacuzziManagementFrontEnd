// import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { catchError,switchMap, throwError } from 'rxjs';
// import { AuthService } from '../../auth/auth.service';
// import { inject } from '@angular/core';

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, filter, finalize, map, Observable, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../../auth/auth.service";
import { Router } from "@angular/router";

// export function getAccessToken(){
//   return localStorage.getItem('jwtToken');
// }
// export function getRefreshToken(){
//   return localStorage.getItem('refreshToken');
// }
// export const headersInterceptor: HttpInterceptorFn = (req, next) => {
//    
//   let cloneRqst = req.clone({
//     setHeaders: {
//       Authorization: `Bearer ${getAccessToken()}`,
//       'Content-Type': 'application/json'
//     }
//   });
//    
//   const router = inject(Router);
//   return next(cloneRqst).pipe(
//     catchError((error) => {
//        
//       if (error instanceof HttpErrorResponse && error.status === 401) {
//         if (error.url?.includes('/api/Auth/refresh-token')) {
//           // Navigate to login and clear storage if refresh token fails
//           router.navigate(['/']);
//           localStorage.clear();
//         } else {
//            
//           // Attempt to handle 401 by refreshing the token
//           return handle401Error(req, next);
//         }
//       }
//       return throwError(() => error);
//     })
  
// )};

// export const handle401Error: HttpInterceptorFn = (req, next) => {
  
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   const refreshToken = getRefreshToken();
//   if (!refreshToken) {
//     // If no refresh token is available, navigate to login
//     router.navigate(['/']);
//     localStorage.clear();
//     return throwError(() => new Error('No refresh token available'));
//   }

//   return authService.refreshToken().pipe(
//     switchMap((response) => {
//        
//       if (response?.result?.accessToken) {
//         // Store the new access token
//         const newAccessToken = response.result.accessToken;
//         localStorage.setItem('jwtToken', newAccessToken);

//         // Clone the failed request with the new token and retry
//         const updatedReq = req.clone({
//           setHeaders: {
//             Authorization: `Bearer ${newAccessToken}`
//           }
//         });
//         return next(updatedReq);
//       } else {
//         // If the response is invalid, clear storage and redirect to login
//         router.navigate(['/']);
//         localStorage.clear();
//         return throwError(() => new Error('Invalid token refresh response'));
//       }
//     }),
//     catchError((err) => {
//       // If refreshing the token fails, clear storage and redirect to login
//       router.navigate(['/']);
//       localStorage.clear();
//       return throwError(() => err);
//     })
//   );
// };



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  accessToken: any;
  constructor(private authService: AuthService, private router: Router

  ) { }

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  ////new format handler

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let token;
    if(request.url.includes('/api/Auth/refresh-token')){
      token = this.authService.getRefreshToken()
    }
    else{

       token = this.authService.getToken();
    }
    let cloneRequest = request;
    cloneRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    

     
    
    


    return next.handle(cloneRequest).pipe(
     
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
           
          if (error.url?.includes('/api/Auth/refresh-token')) {
            this.router.navigate(['/']);
            localStorage.clear();
          }
          else {
            return this.handle401Error(request, next);
          }
        }
        return throwError(() => error);
      })
    );
  }







  handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
  
      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
           
          localStorage.setItem('jwtToken', response.accessToken);
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addToken(request, response.accessToken)).pipe(
            map((event: HttpEvent<any>) => {
                
              return event;
            })
          );
        }),
        catchError((error) => {
          this.isRefreshing = false;
          return throwError(error);
  
        })
      );
    } else {
       ;
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((jwt: any) => {
          return next.handle(this.addToken(request, jwt));
        })
      );
    }
  }





  addToken(request: any, token: string) {
    let newRequest = request;
   
    newRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

    });
    return newRequest;
  }
}
  