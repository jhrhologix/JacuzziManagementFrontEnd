import { HttpClient } from '@angular/common/http';
import { Injectable, model } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { AdminModel } from './adminModel';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  getUserDetailsUrl = 'api/Admin/GetUserDetails'
  getUserRolesUrl = 'api/Admin/GetUserRoles'
  addNewUserUrl = 'api/Admin/AddNewUser'
  updateUserUrl = 'api/Admin/UpdateUser'
  deleteUserUrl = 'api/Admin/DeleteUser?UserId='
  updateUserPasswordUrl = 'api/Admin/UpdateUserPassword'
  lockUserUrl = 'api/Admin/LockUser?UserId='
  getTechnicianNamelistURL='api/ServiceCall/GetTechnicianDetail'
  transferTechnicianVisitURL = 'api/ServiceCall/TransferTechnicianVisit?'
  getSMSTemplateURL = 'api/EmailSechedule/GetSMSTemplate?templateId='
  addUpdateSMSTemplateURL = 'api/EmailSechedule/SaveMasterSMSTemplate';
  usersQuestionsURL='api/Admin/GetQuestionsOfusers'

  constructor(private httprequest : HttpClient )  { }



  getUserDetails(): Observable<AdminModel[]> {
    return this.httprequest.get<AdminModel[]>(`${environment.apiUrl}/${this.getUserDetailsUrl}`);
  }

  getUserRoles(): Observable<any>{
    return this.httprequest.get<any>(`${environment.apiUrl}/${this.getUserRolesUrl}`);
  }

  addNewUser(model : any) : Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.addNewUserUrl}`,model)
  }

  updateUser(model : any) : Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.updateUserUrl}`,model)
  }

  deleteUser(id : number){
    return this.httprequest.post(`${environment.apiUrl}/${this.deleteUserUrl}${id}`,null)
  }

  updateUserPassword(model : any) : Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.updateUserPasswordUrl}`,model)
  }
  
  lockUser(id : number){
    return this.httprequest.post(`${environment.apiUrl}/${this.lockUserUrl}${id}`,null)
  }

  getTechnicianNamelist(){
    return this.httprequest.get(`${environment.apiUrl}/${this.getTechnicianNamelistURL}`);
  }

  transferTechnicianVisit(technicianTransferObject: any){
    return this.httprequest.post(`${environment.apiUrl}/${this.transferTechnicianVisitURL}`,technicianTransferObject)
  }
  GetSMSTemplateByTemplateId(id: any){
    return this.httprequest.get(`${environment.apiUrl}/${this.getSMSTemplateURL}${id}`)
  }

  AddUpdateSMSTemplate(model:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.addUpdateSMSTemplateURL}`,model)
  }

  getUsersQuestions(){
    return this.httprequest.get(`${environment.apiUrl}/${this.usersQuestionsURL}`)
  }




  // saveSpaDetails(model:any)
  // {
  //   return this.httprequest.post(`${environment.apiUrl}/${this.saveSpaDetailsUrl}`, model)
  // }
  

}
