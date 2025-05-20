import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../auth/auth.service';


export const AuthGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  // const isExpiredOrInvalid = 
  // !localStorage.getItem('jwtToken') || // Token is null or undefined
  // new JwtHelperService().isTokenExpired(localStorage.getItem('jwtToken'));
  const token = localStorage.getItem('jwtToken');
  const isTokenValidFormat = token?.split('.').length === 3;
  
  if (isTokenValidFormat) {
    const isExpired = new JwtHelperService().isTokenExpired(localStorage.getItem('jwtToken'));
    if(!isExpired){


    const userId = parseInt(localStorage.getItem('userId') ?? '');
    if (!isNaN(userId) && userId > 0) {
      return true;
    }
    else {
      localStorage.clear();
      router.navigateByUrl('/login');
      return false;
    }
    }
    else {
      localStorage.clear();
  
      router.navigateByUrl('/login');
      return false;
    }

  }
  else {
    localStorage.clear();

    router.navigateByUrl('/login');
    return false;
  }
}
  // if (!isExpired) {
  //   const userId = parseInt(localStorage.getItem('userId') ?? '');
  //   if (!isNaN(userId) && userId > 0) {
  //     return true;
  //   }
  //   else {
  //     localStorage.clear();
  //     router.navigateByUrl('/login');
  //     return false;
  //   }
  // }
  // else {
  //   localStorage.clear();

  //   router.navigateByUrl('/login');
  //   return false;
  // }
// };

export const isAlreadyLoggedIn: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();
  const isExpired = jwtHelper.isTokenExpired(localStorage.getItem('jwtToken'));

  if (!isExpired) {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'Admin') {
      router.navigate(['web/admin/manage-clients']);
    }
    else if (userRole === 'technician' || userRole === 'superTech') {
      router.navigateByUrl('/web/technician/technician-visit');
    }
    return false;
  }
  return true;
};
export const haveTechPermission: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const authService = inject(AuthService);
  const jwtHelper = new JwtHelperService();
  const isExpiredJwtToken = jwtHelper.isTokenExpired(localStorage.getItem('jwtToken'));
  const isExpiredRefresh = jwtHelper.isTokenExpired(localStorage.getItem('refreshToken'));
  if (!isExpiredJwtToken && !isExpiredRefresh) {
    const roleAs = localStorage.getItem('userRole');
    if (roleAs === 'Admin') {
      return false;
    }
    else if (roleAs === 'technician' || roleAs === 'superTech') {
      return true;
    }
    return false;
  }
  return true;
};
export const haveAdminPermission: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const authService = inject(AuthService);
  const jwtHelper = new JwtHelperService();
  const isExpiredJwtToken = jwtHelper.isTokenExpired(localStorage.getItem('jwtToken'));
  const isExpiredRefresh = jwtHelper.isTokenExpired(localStorage.getItem('refreshToken'));
  if (!isExpiredJwtToken && !isExpiredRefresh) {
    const roleAs = localStorage.getItem('userRole');
    if (roleAs === 'Admin') {
      return true;
    }
    else if (roleAs === 'technician' || roleAs === 'superTech') {
      return false;
    }
    return false;
  }
  return true;
};
