import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SendingemailService {
  getClientEmailSendListURL='api/EmailSechedule/GetClientListSelectedDate?date=';
  addUpdateEmailTemplateURL='api/EmailSechedule/SaveMasterEmailTemplate';
  addUpdateSMSTemplateURL = 'api/EmailSechedule/SaveMasterSMSTemplate';
  getEmailTemplateURL='api/EmailSechedule/GetEmailTemplate?templateId=';
  sendConfirmationEmailURL='api/EmailSechedule/SendEmail';
  getSMSTemplateURL = 'api/EmailSechedule/GetSMSTemplate?templateId='
  sendSMSURL = 'api/EmailSechedule/SendSMS';
  constructor(
    private httprequest : HttpClient

  ) { }
  getClientEmailSendList(date:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.getClientEmailSendListURL}${date}`, null);
  }
  
  AddUpdateEmailTemplate(model:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.addUpdateEmailTemplateURL}`,model)
  }
  AddUpdateSMSTemplate(model:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.addUpdateSMSTemplateURL}`,model)
  }

  GetEmailTemplateByTemplateId(id: any){
    return this.httprequest.get(`${environment.apiUrl}/${this.getEmailTemplateURL}${id}`)
  }
  
  GetSMSTemplateByTemplateId(id: any){
    return this.httprequest.get(`${environment.apiUrl}/${this.getSMSTemplateURL}${id}`)
  }

  SendEmailConfirmation(model:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.sendConfirmationEmailURL}`,model)
  }

  sendSMS(model: any) {
    return this.httprequest.post(`${environment.apiUrl}/${this.sendSMSURL}`, model);
  }
}
