import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpaReportsService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json', // Adjust based on your API requirements
    'Authorization': 'Bearer your-token-here', // If using bearer tokens for authorization
    // Add any other headers as needed
  });
  //private apiUrl = 'https://localhost:7032';
  constructor(
    private http: HttpClient

  ) { }


swimmingPoolContractor(): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/api/Spa/SwimmingPoolContractor`,{headers:this.headers});
}

poolSpecialistReport(soluSpaSpecialistObject:any):Observable<Blob>{
  ;
  return this.http.post(`${environment.apiUrl}/api/Spa/DownloadPoolSpecialist`,soluSpaSpecialistObject,{ responseType: 'blob' });

}
partsReport(soluSpaSpecialistObject:any):Observable<Blob>{
  return this.http.post(`${environment.apiUrl}/api/Spa/DownloadpartsReport`,soluSpaSpecialistObject,{ responseType: 'blob' });

}
scheduleReport(soluSpaSpecialistObject:any):Observable<Blob>{
  return this.http.post(`${environment.apiUrl}/api/Spa/DownloadscheduleReport`,soluSpaSpecialistObject,{ responseType: 'blob' });

}
}

