import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TechnicianService {

  getParticularServiceCallStatusUrl = 'api/ServiceCall/GetParticularServiceCallStatus';
  getAllSpaBrandsUrl = 'api/spa/GetSpaBrandDetails';
  getSpaBrandUrl = 'api/spa/GetSpaModelByBrands?SpaBrandId=';
  getPoolSpecialistURL = 'api/Spa/SwimmingPoolContractor';
  getAllSpaDetailURL='api/Clients/GetSpaModelDetails?spaId=';
  saveSpaDetailsUrl = 'api/clients/saveSpaDetails';
  getAllTechnicianDetailTechnicianPageByIDUrl = 'api/Technician/GetAllTechnicianDetailTechnicianPageByID?visitId='
  getSpaDetailByVisitIdURL ='api/M_Technician/GetSpaDetailByVisitId?visitId=';
  getClientDetailForTechincianURL ='api/M_Technician/GetClientDetailForTechincian?visitId=';
  updateSpaDetailByTechincianURL ='api/M_Technician/UpdateSpaDetailByTechincian';
  updateClientDetailByTechincianURL ='api/M_Technician/UpdateClientDetailByTechincian';
  getServiceCallDetailsForTechnicianURL = 'api/Technician/GetServiceCallDetailsForTechnician?serviceCallId='
  getPaymentMethodsURL = 'api/Technician/GetPaymentMethods'
  updateTechnicainVisitDetailsURL = 'api/Technician/UpdateTechnicainVisitDetails'
  getServiceCallHistoryURL = 'api/Technician/GetServiceCallHistory?VisitId='
  emailURL="api/Technician/SendMail"
  getClientAddressURL='api/Technician/address?clientId='
  getImageURL='api/ServiceCall'

  constructor(private httprequest : HttpClient) { }

  getParticularServiceCallStatus(): Observable<any>{
    return this.httprequest.get<any>(`${environment.apiUrl}/${this.getParticularServiceCallStatusUrl}`);
  }

  getAllTechnicianDetailTechnicianPageByID(id:any){
    return this.httprequest.get(`${environment.apiUrl}/${this.getAllTechnicianDetailTechnicianPageByIDUrl}${id}`)
    }
  getSpaBrand(){
    return this.httprequest.get(`${environment.apiUrl}/${this.getAllSpaBrandsUrl}`)
  }
  getSpaModelByBrand(brandId: number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getSpaBrandUrl}${brandId}`);
  }
  getPoolSpecialist(){
    return this.httprequest.get(`${environment.apiUrl}/${this.getPoolSpecialistURL}`);
  }
  getSpaDetailsByClientId(spaId:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getAllSpaDetailURL}${spaId}`);
  }
  getSpaDetailByVisitId(visitId:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getSpaDetailByVisitIdURL}${visitId}`);
  }
  getClientDetailForTechincian(visitId:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getClientDetailForTechincianURL}${visitId}`);
  }
  updateSpaDetailByTechincian(model:any)
  {
    return this.httprequest.post(`${environment.apiUrl}/${this.updateSpaDetailByTechincianURL}`, model)
  }
  updateClientDetailByTechincian(model:any)
  {
    return this.httprequest.post(`${environment.apiUrl}/${this.updateClientDetailByTechincianURL}`, model)
  }
  getServiceCallDetailsForTechnician(serviceCallId:number)
  {
    return this.httprequest.get(`${environment.apiUrl}/${this.getServiceCallDetailsForTechnicianURL}${serviceCallId}`);
  }
  getPaymentMethods(){
    return this.httprequest.get(`${environment.apiUrl}/${this.getPaymentMethodsURL}`);
  }

  updateTechnicainVisitDetails(model : any) : Observable<any> {
    
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.updateTechnicainVisitDetailsURL}`,model)
  }
  getServiceCallHistory(visitId:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getServiceCallHistoryURL}${visitId}`);
  }
  sendMail(model:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.emailURL}`,model);
  }
  getClientAddress(id:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getClientAddressURL}${id}`);
  }
  // getImageById(id:number){
  //   return this.httprequest.get(`${environment.apiUrl}/${this.getImageURL}/${id}`, { responseType: 'blob' as 'json' });
  // }
  // getImageById(id: number): Observable<Blob[]> {
  //   return this.httprequest.get<Blob[]>(`${environment.apiUrl}/${this.getImageURL}/${id}`, { responseType: 'blob' as 'json' });
  // }
  getImageById(id: number): Observable<{ fileData: string; contentType: string }[]> {
    return this.httprequest.get<{ fileData: string; contentType: string }[]>(`${environment.apiUrl}/${this.getImageURL}/${id}`
    );
  }
}