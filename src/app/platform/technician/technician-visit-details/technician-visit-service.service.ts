import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TechnicianVisitServiceService {
  getServiceJobsForTechnicianByDateURL='api/M_Technician/GetServiceJobsForTechnicianByDate';
  getTechnicianByUserIdURL='api/M_Technician/GetTechnicianIdByUserId';
  constructor(
    private httprequest : HttpClient

  ) { 


  }
  
  GetServiceJobsForTechnician(technicianId: any, searchDate: any){
    
    var URL =this.getServiceJobsForTechnicianByDateURL + '?technicianId=' + technicianId +  '&searchDate=' + searchDate;
    return this.httprequest.get(`${environment.apiUrl}/${URL}`);
  
  }  
  GetTechnicianIdByUserId(userId: any){
    var URL =this.getTechnicianByUserIdURL + '?userId=' + userId;
    return this.httprequest.get(`${environment.apiUrl}/${URL}`);
  
  }  
}
