import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  getServiceStatusListURL = 'api/Calendar/GetServiceStatus?statusId=';
  getTechniciansListURL = 'api/Calendar/GetTechnicians?enabled=';
  getClientsListURL = 'api/Calendar/GetClients?serviceCallId=';
  getScheduleListURL= 'api/Calendar/GetStatusList?technicianId='
  getwaitingStatusListURL='api/Calendar/GetWaitingList'
  getMonthesURL='api/Calendar/GetMonthes'

  constructor(private httprequest: HttpClient) { }


  getServiceStatusList(id:number) {
    return this.httprequest.get(`${environment.apiUrl}/${this.getServiceStatusListURL}${id}`);
  }
  getTechniciansList(enabled: number) {
    return this.httprequest.get(`${environment.apiUrl}/${this.getTechniciansListURL}${enabled}`);
  }
  getStatusList(id:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getScheduleListURL}${id}`);
  }
  getClientsList(id:number) {
    return this.httprequest.get(`${environment.apiUrl}/${this.getClientsListURL}${id}`);
  }
  getAssignedJobList(date: any, statusId: any) {
    return this.httprequest.get(`${environment.apiUrl}/api/Calendar/GetAssignedJobList?date=` + date + '&statusId=' + statusId);
  }
  getAssignedServiceCallJobList(date: any, statusId: any,priority:any) {
    return this.httprequest.get(`${environment.apiUrl}/api/Calendar/GetAssignedServiceCallJobList?date=` + date + '&statusId=' + statusId + '&priority=' + priority);
  }

  insertUpdateVisitEvent(visitDetails: any): Observable<any> {
    return this.httprequest.post(`${environment.apiUrl}/api/Calendar/InsertUpdateVisitEvent`, visitDetails);
  }
  addPriority(model:any){
    return this.httprequest.post(`${environment.apiUrl}/api/Calendar/SaveUpdatePriority`, model);
  }
  getwaitingStatusList(model : any){
    return this.httprequest.post(`${environment.apiUrl}/${this.getwaitingStatusListURL}`,model);
  }
  getMonthesList() {
    return this.httprequest.get(`${environment.apiUrl}/${this.getMonthesURL}`);
  }
}
export interface CreateEventParams {
  start: string;
  end: string;
  text: string;
  resource: string | number;
}

export interface UpdateEventParams {
  id: string | number;
  start: string;
  end: string;
  text: string;
  resource: string | number;
}

export interface EventData {
  id: string | number;
  start: string;
  end: string;
  text: string;
  resource: string | number;
}