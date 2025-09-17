import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceCallService {
  getClientDetailsByClientNumber = 'api/Clients/GetClientDetailsByClientNumber'
  getClientByIdUrl = 'api/Clients/getclientbyid?clientId='
  getClientDetailByIdUrl = 'api/clients/getclientbyid?clientId='
  getServiceCallByClientId = 'api/ServiceCall/GetServiceCallByClientId?ClientId='
  getpoolspecialistURL = 'api/ServiceCall/GetPoolSpecialist'
  getissuedescriptionURL = 'api/ServiceCall/GetIssueDescription'
  getstatusURL = 'api/ServiceCall/GetStatus'
  getservicecallidURL='api/ServiceCall/GetServiceCallId?ClientId='
  getspadetailByIdUrl='api/ServiceCall/GetSpaByClientId?clientId='
  createServiceCallUrl='api/ServiceCall/CreateServiceCall'
  getservicecallbyidUrl='api/ServiceCall/GetServiceCallById?servicecallId='
  deleteservicecallUrl = 'api/ServiceCall/DeleteServiceCall?servicecallId='
  getspadetailByServiceCallIdUrl='api/ServiceCall/GetSpaByServiceCallId?serviceCallId='
  updateServiceCallUrl = 'api/ServiceCall/UpdateServiceCall'
  getTechnicianNamelistURL='api/ServiceCall/GetTechnicianDetail'
  getPaymentMethodlistURL='api/ServiceCall/GetPaymentStatus'
  getTechnicianDetailsURL = 'api/ServiceCall/GetTechnicianDetail?serviceCallId='
  getTechnicianDetailsByIdURL='api/ServiceCall/GetTechnicianDetailById?visitId='
  updateTechnicianDetailsUrl = 'api/ServiceCall/UpdateTechnicianDetail'
  createTechnicianDetailsUrl = 'api/ServiceCall/CreateTechnicianDetail'
  deletevisitdetailUrl='api/ServiceCall/DeleteVisitDetail?visitId='
  getEmailTemplateURL='api/EmailSechedule/GetEmailTemplate?templateId=';
  getEmailTemplateByLanguageURL='api/EmailSechedule/GetEmailTemplateByLanguage?templateId=';
  addUpdateEmailTemplateURL='api/EmailSechedule/SaveMasterEmailTemplate';
  addsendEmailURL = 'api/ServiceCall/SendEmail'
  getImageURL='api/ServiceCall'

  private headers = new HttpHeaders({
    'Content-Type': 'application/json', // Adjust based on your API requirements
    'Authorization': 'Bearer your-token-here', // If using bearer tokens for authorization
    // Add any other headers as needed
  });

 

  constructor(
    private httprequest: HttpClient
  ) { }

  GetTechnicianNameByServiceCall(serviceCallId: number): Observable<any> {
    return this.httprequest.get(`${environment.apiUrl}/api/ServiceCall/GetTechnicianNameByServiceCall?serviceCallId=${serviceCallId}`,{headers:this.headers});
  }
  GetClientDetailsByClientNumber(id: any){
    return this.httprequest.post(`${environment.apiUrl}/${this.getClientByIdUrl}${id}`,null)
 }
 GetServiceCallByClientId(id: any){
  return this.httprequest.get(`${environment.apiUrl}/${this.getServiceCallByClientId}${id}`)
}
getpoolspecialist(){
  return this.httprequest.get(`${environment.apiUrl}/${this.getpoolspecialistURL}`);
}
getissuedescription(){
  return this.httprequest.get(`${environment.apiUrl}/${this.getissuedescriptionURL}`);
}
getstatus(){
  return this.httprequest.get(`${environment.apiUrl}/${this.getstatusURL}`);
}
getservicecallid(id:number){
  return this.httprequest.post(`${environment.apiUrl}/${this.getservicecallidURL}${id}`,null);
}
getspadetails(id : number){
  return this.httprequest.post(`${environment.apiUrl}/${this.getspadetailByIdUrl}${id}`,null)
}
getspadetailsByServiceCallId(id : number){
  return this.httprequest.post(`${environment.apiUrl}/${this.getspadetailByServiceCallIdUrl}${id}`,null)
}
createServiceCall(model:any){
return this.httprequest.post(`${environment.apiUrl}/${this.createServiceCallUrl}`,model)
}
updateServiceCall(model:any){
  return this.httprequest.post(`${environment.apiUrl}/${this.updateServiceCallUrl}`,model)
}
updatetechniciandetail(model:any){
  return this.httprequest.post(`${environment.apiUrl}/${this.updateTechnicianDetailsUrl}`,model)
}
createtechniciandetail(model:any){
  return this.httprequest.post(`${environment.apiUrl}/${this.createTechnicianDetailsUrl}`,model)
}
getservicecallbyid(id:number){
  return this.httprequest.post(`${environment.apiUrl}/${this.getservicecallbyidUrl}${id}`, null)
}
deleteservicecall(id:number){
  return this.httprequest.post(`${environment.apiUrl}/${this.deleteservicecallUrl}${id}`,null)
}
deletevisitdetails(id:number){
  return this.httprequest.post(`${environment.apiUrl}/${this.deletevisitdetailUrl}${id}`,null)
}
getTechnicianNamelist(){
  return this.httprequest.get(`${environment.apiUrl}/${this.getTechnicianNamelistURL}`);
}
getTechnicianDetails(id: number){
  return this.httprequest.post(`${environment.apiUrl}/${this.getTechnicianDetailsURL}${id}`,null);
}
getPaymentMethodlist(){
  return this.httprequest.get(`${environment.apiUrl}/${this.getPaymentMethodlistURL}`);

}
getTechnicianDeteilByid(id:number){
  return this.httprequest.post(`${environment.apiUrl}/${this.getTechnicianDetailsByIdURL}${id}`,null);

}
GetEmailTemplateByTemplateId(id: any){
  return this.httprequest.get(`${environment.apiUrl}/${this.getEmailTemplateURL}${id}`)
}

GetEmailTemplateByLanguage(id: any, language: string = 'BOTH'){
  return this.httprequest.get(`${environment.apiUrl}/${this.getEmailTemplateByLanguageURL}${id}&language=${language}`)
}
AddUpdateEmailTemplate(model:any){
  return this.httprequest.post(`${environment.apiUrl}/${this.addUpdateEmailTemplateURL}`,model)
}
sendMail(model:any){
  return this.httprequest.post(`${environment.apiUrl}/${this.addsendEmailURL}`,model)
}
// getImageById(id:number){
//   return this.httprequest.get(`${environment.apiUrl}/${this.getImageURL}/${id}`, { responseType: 'blob' });
// }
getImageById(id: number): Observable<{ fileData: string; contentType: string }[]> {
  return this.httprequest.get<{ fileData: string; contentType: string }[]>(`${environment.apiUrl}/${this.getImageURL}/${id}`
  );
}
}
