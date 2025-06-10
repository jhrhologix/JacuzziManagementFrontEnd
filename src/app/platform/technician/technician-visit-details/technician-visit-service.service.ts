import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TechnicianVisitServiceService {
  private getServiceJobsForTechnicianByDateURL = 'api/M_Technician/GetServiceJobsForTechnicianByDate';
  private getTechnicianByUserIdURL = 'api/M_Technician/GetTechnicianIdByUserId';

  constructor(private http: HttpClient) { }

  GetServiceJobsForTechnician(technicianId: number, searchDate: string): Observable<any> {
    const url = `${environment.apiUrl}/${this.getServiceJobsForTechnicianByDateURL}?technicianId=${technicianId}&searchDate=${searchDate}`;
    console.log('Making request to:', url);
    return this.http.get(url);
  }

  GetTechnicianIdByUserId(userId: number): Observable<any> {
    const url = `${environment.apiUrl}/${this.getTechnicianByUserIdURL}?userId=${userId}`;
    console.log('Making request to:', url);
    return this.http.get(url).pipe(
      map((response: any) => {
        console.log('Raw technician response:', response);
        return response;
      })
    );
  }
}
