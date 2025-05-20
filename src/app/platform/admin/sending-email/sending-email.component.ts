import { Component } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { SendingemailService } from './sendingemail.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TemplateEmailModel } from './template-email-model';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

export interface SendEmailElements {
  selectrow: boolean;
  client: string;
  firstName: string;
  lastName: string;
  email: string;
}




export interface SendEmailElements {
  selectrow: boolean;
  client: string;
  firstName: string;
  lastName: string;
  email: string;
}
export interface EmailTemplateModel {
  masterEmailTemplateId: number;
  emailTemplateName: string;
  emailTemplateSubject:string;
  emailTemplateBody: string;
  createdBy:  number;
  modifiedBy: number;
  isActive: boolean;

}


@Component({
  selector: 'app-sending-email',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule, MatTableModule, MatCheckboxModule, FormsModule, CKEditorModule,TranslateModule],
  templateUrl: './sending-email.component.html',
  styleUrl: './sending-email.component.scss',
})
export class SendingEmailComponent {
  showTable: boolean = false;
  date: any;
  emailSendForm : FormGroup;
  emailTemplateForm : FormGroup;
  visitDate : Date | undefined;
  clientList: any[]=[];
  templateDataList: any[]=[];
  convertedDate: any;
  name = 'Angular';
  editor = ClassicEditor;
  editor1 = ClassicEditor;
  dataEmailBody: string = '';
  dataSMSBody: string = '';
  templateId: number=10;
  SMStemplateId: number=12;
  emailTemplateModel!: EmailTemplateModel;
  templateEmailModel!: TemplateEmailModel;
  isTemplateUpdate: boolean=false;
  isLoading = false;
  public configEmailBody = {
    toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
  
}
public configEmailBody1 = {
  toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],

}
  constructor (
    private sendingEmail: SendingemailService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
  ){
this.emailSendForm = new FormGroup('');
this.emailTemplateForm= new FormGroup('');
  }
  ngOnInit(){
    this.createformgroup();
    this.getEmailTemplate(this.templateId);
    this.getSMSTemplate(this.SMStemplateId);


  }
  createformgroup(){
    this.emailSendForm = this.formBuilder.group({
      masterEmailTemplateId: [0],
      visitDate:['',Validators.required],
      masterSMSTemplateId:[0],
      recipients:[[]],
      sms:[true],
      emailClient:[true],
      mobileNumber:['']

    });

    this.emailTemplateForm = this.formBuilder.group({
      masterEmailTemplateId: [0],
      emailTemplateName: [''],
      emailTemplateSubject:[''],
      emailTemplateBody:[''],
      SMSTemplateBody:[''],
      isActive:[true]
    });
  }
  resetbutton(){
    this.showTable= false;
    this.emailSendForm.reset();
  }
  toggleTable() {
    
    if(this.emailSendForm.valid)
      {
    const visitDate = this.emailSendForm.get('visitDate')?.value;
    this.getClientEmailSendList(visitDate);
     }

  else{
    this.emailSendForm.markAllAsTouched();
  }
}
  getClientEmailSendList(visitDate: any){
    
      this.isLoading = true;
      this.sendingEmail.getClientEmailSendList(visitDate).subscribe((response:any)=>{
        if(response)
        {
          this.clientList = response.value;
          if(this.clientList.length >0)
          {    
            this.showTable=true;
            this.toggleSelectAll({ target: { checked: true } });
            
          }
          else{
            this.toaster.info("No record found")
          }
          this.isLoading = false;
        }
        
      })
    
    
  }
  getEmailTemplate(id: any){
    this.isLoading = true;
    this.sendingEmail.GetEmailTemplateByTemplateId(id).subscribe((response:any)=>{
      if(response)
      {
        this.templateDataList = response.value;
        this.dataEmailBody= this.templateDataList[0].emailTemplateBody;
        this.emailTemplateForm.patchValue({emailTemplateBody: this.templateDataList[0].emailTemplateBody});
        if(this.templateDataList[0].emailTemplateBody !== null)
        {
          this.isTemplateUpdate=true;
        }
        this.isLoading = false;
      }
    });
  }
  getSMSTemplate(id: any){
    
    this.isLoading = true;
    this.sendingEmail.GetSMSTemplateByTemplateId(id).subscribe((response:any)=>{
      if(response)
      {
        this.templateDataList = response.value;
        this.dataSMSBody= this.templateDataList[0].smsTemplateBody;
        this.emailTemplateForm.patchValue({SMSTemplateBody: this.templateDataList[0].smsTemplateBody});
        if(this.templateDataList[0].smsTemplateBody !== null)
        {
          this.isTemplateUpdate=true;
        }
        this.isLoading = false;
      }
    });
  }
  onSubmit(){

  }

  displayedColumns: string[] = [
    'selectrow',
    'client',
    'firstName',
    'lastName',
    'email',
    'mobileNumber',
    'sMS',
    'emailSend'
  ];
  isAllSelected(): boolean {
    const numSelected = this.clientList.filter(t => t.selectrow).length;
    const numRows = this.clientList.length;
    return numSelected === numRows;
  }

  // Method to toggle select all
  toggleSelectAll(event: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.clientList.forEach(client => client.selectrow = isChecked);
  }


checkRowSelection(): void {
    const allSelected = this.isAllSelected();
    if (allSelected) {
        (document.querySelector('input[type="checkbox"][checked]') as HTMLInputElement).checked = true;
    } else {
        (document.querySelector('input[type="checkbox"][checked]') as HTMLInputElement).checked = false;
    }
}

onTemplateSubmit(): void{
  this.isLoading = true;
  const abkk =this.emailTemplateForm.get('emailTemplateBody')?.value;
if(this.isTemplateUpdate === true)
{
  this.emailTemplateForm.patchValue({masterEmailTemplateId: this.templateDataList[0].masterEmailTemplateId});
}

  const requestModel: any = this.emailTemplateForm.value; 
  this.sendingEmail.AddUpdateEmailTemplate(requestModel).subscribe((Response: any ) =>{
    if(Response.value.isSuccess == true){
      if(this.isTemplateUpdate === false)
      {
        this.toaster.success('Email template created successfully.');
      }
      else{
        this.toaster.success('Email template updated successfully.');
      }
      const btnSamElement = document.getElementById('EmailVisitsModalclose');
      if (btnSamElement) {
        btnSamElement.click();
      }
      this.isLoading = false;
    }
    else{
      this.toaster.error(Response.value.error.message);
      this.isLoading = false;
    }
  });

}
onSMSTemplateSubmit(): void{
  
  this.isLoading = true;
  

  const requestModel : any = {
    masterSMSTemplateId : this.templateDataList[0].masterSMSTemplateId,
    smsTemplateBody : this.emailTemplateForm.get('SMSTemplateBody')?.value
  };
  this.sendingEmail.AddUpdateSMSTemplate(requestModel).subscribe((Response: any ) =>{
    if(Response.value.isSuccess == true){
      if(this.isTemplateUpdate === false)
      {
        this.toaster.success('SMS template created successfully.');
      }
      else{
        this.toaster.success('SMS template updated successfully.');
      }
      const btnSamElement = document.getElementById('SMSVisitsModalclose');
      if (btnSamElement) {
        btnSamElement.click();
      }
      this.isLoading = false;
    }
    else{
      this.toaster.error(Response.value.error.message);
      this.isLoading = false;
    }
  });

}
getSelectedEmails(): string[] {
 
  return this.clientList.filter(client => client.selectrow)
                        .map(client => client.email);
}
getSelectedSMS(): string[] {
 
  return this.clientList.filter(client => client.selectrow)
                        .map(client => client.sms);
}
getSelectedEmailsClient(): string[] {
 
  return this.clientList.filter(client => client.selectrow)
                        .map(client => client.emailClient);
}
getSelectedMobileNumber(): string[] {
 
  return this.clientList.filter(client => client.selectrow)
                        .map(client => client.mobileNumber);
}

onSendConfirmationEmail(): void{
  this.isLoading= true;


const selectedEmails = this.getSelectedEmails();
const selectedsms = this.getSelectedSMS();
const selectedemailClient = this.getSelectedEmailsClient();
const selectedmobileNumber =  this.getSelectedMobileNumber();
this.emailSendForm.patchValue({recipients: selectedEmails});
this.emailSendForm.patchValue({sms: selectedsms});
this.emailSendForm.patchValue({emailClient: selectedemailClient});
this.emailSendForm.patchValue({mobileNumber: selectedmobileNumber});
 
  if(this.isTemplateUpdate === true)
    {
      this.emailSendForm.patchValue({masterEmailTemplateId: this.templateDataList[0].masterEmailTemplateId});
      this.emailSendForm.patchValue({masterSMSTemplateId: this.SMStemplateId});
    }
    const requestModel: any = this.emailSendForm.value;

    this.sendingEmail.SendEmailConfirmation(requestModel).subscribe((Response: any ) =>{
      if(Response.value == "EMail sent successfully"){
          this.toaster.success('Email sent successfully.');
          this.isLoading= false;
      }
      else{
        this.toaster.error(Response.value.error.message);   
        this.isLoading= false; 
      }
    });
}
  
}
