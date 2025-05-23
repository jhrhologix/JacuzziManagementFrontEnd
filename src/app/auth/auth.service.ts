import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from '../core/services/common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loginURL = 'auth/login'
  ValidateAnswerURL = 'api/Admin/ValidateAnswer'
  CheckUserExistURL = 'api/Admin/CheckUserExist?Username='
  updateUserPasswordUrl = 'api/Admin/UpdateUserPassword'


  constructor(
    //private commonservice : CommonService,
    private httprequest : HttpClient,
    private router:Router
  ) { 
  
  }
  isLoggedIn(): boolean {
    // Implement your authentication logic here
    return !!localStorage.getItem('jwtToken'); // Check if token exists
  }
  login(loginDetails: any): Observable<any> {
    console.log('Login request to:', `${environment.apiUrl}/api/Auth/login`);
    console.log('Login details:', JSON.stringify(loginDetails));
    
    // Create credentials in expected format
    const loginRequest = {
      username: loginDetails.username,
      password: loginDetails.password
    };
    
    return this.httprequest.post(
      `${environment.apiUrl}/api/Auth/login`, 
      loginRequest
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.router.navigate(['/'])
      localStorage.clear();
      return of(null);
    }
    else {
      // return this._httpClient.get<any>(`${environment.api_url}/api/Auth/refresh-token/${refreshToken}`)
      return this.httprequest.get(`${environment.apiUrl}/api/Auth/refresh-token/${refreshToken}`);
    }
  }

  getRefreshToken(){
    return localStorage.getItem('refreshToken');
  }

  getToken(){
    return localStorage.getItem('jwtToken');

  }

  checkUserExist(username: string): Observable<any>{
    return this.httprequest.post(`${environment.apiUrl}/${this.CheckUserExistURL}${username}`,null)
  }

  validateAnswer(userId: number,answer : any){
    return this.httprequest.post<any>
    (`${environment.apiUrl}/${this.ValidateAnswerURL}?userId=${userId}&answer=${answer}`,null);
  }

  updateUserPassword(model : any) : Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.updateUserPasswordUrl}`,model)
  }

}
