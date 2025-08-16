import { Component, OnInit } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';

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

interface Client {
  clientId: number;
  clientNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  emailClient: boolean;
  sms: boolean;
  mobileNumber: string;
  selectrow: boolean;
  sMS: boolean;
  emailSend: boolean;
}

@Component({
  selector: 'app-sending-email',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule, MatTableModule, MatCheckboxModule, FormsModule, CKEditorModule,TranslateModule],
  templateUrl: './sending-email.component.html',
  styleUrl: './sending-email.component.scss',
})
export class SendingEmailComponent implements OnInit {
  showTable: boolean = false;
  date: any;
  emailSendForm : FormGroup;
  emailTemplateForm : FormGroup;
  smsTemplateForm : FormGroup;
  visitDate : Date | undefined;
  clientList: Client[] = [];
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
    private snackBar: MatSnackBar
  ){
this.emailSendForm = new FormGroup('');
this.emailTemplateForm= new FormGroup('');
this.smsTemplateForm = new FormGroup('');
  }
  ngOnInit(){
    this.createformgroup();
    this.getEmailTemplate(this.templateId);
    this.getSMSTemplate(this.SMStemplateId);
  }
  createformgroup(){
    this.emailSendForm = this.formBuilder.group({
      masterEmailTemplateId: [0],
      visitDate: ['', Validators.required],
      masterSMSTemplateId: [0],
      recipients: [[]],
      sms: [true],
      emailClient: [true],
      mobileNumber: ['']
    });

    // Separate form for email template
    this.emailTemplateForm = this.formBuilder.group({
      masterEmailTemplateId: [0],
      emailTemplateName: ['scheduled appointment'],
      emailTemplateSubject: ['Confirmation de votre rendez-vous / Your appointment confirmation'],
      emailTemplateBody: [''],
      isActive: [true]
    });

    // Create a separate form for SMS template
    this.smsTemplateForm = this.formBuilder.group({
      masterSMSTemplateId: [0],
      smsTemplateBody: [''],
      isActive: [true]
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
        this.clientList = response.value.map((client: any) => ({
          ...client,
          selectrow: true,
          // Set initial SMS checkbox state based on client preference and phone number availability
          // Handle both uppercase and lowercase field names from API
          sMS: (client.sMS || client.sms) && client.mobileNumber && client.mobileNumber.trim() !== '',
          // Set initial email checkbox state based on client preference and email availability
          emailSend: (client.emailClient || client.emailclient) && client.email && client.email.includes('@')
        }));
        
        if(this.clientList.length > 0)
        {    
          this.showTable = true;
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
        this.emailTemplateForm.patchValue({
          emailTemplateBody: this.templateDataList[0].emailTemplateBody,
          emailTemplateSubject: this.templateDataList[0].emailTemplateSubject
        });
        if(this.templateDataList[0].emailTemplateBody !== null)
        {
          this.isTemplateUpdate=true;
        }
        this.isLoading = false;
      }
    });
  }
  getSMSTemplate(id: any) {
    this.isLoading = true;
    this.sendingEmail.GetSMSTemplateByTemplateId(id).subscribe({
      next: (response: any) => {
        if (response && response.value && response.value.length > 0) {
        this.templateDataList = response.value;
          const template = this.templateDataList[0];
          
          // Validate template data
          if (!template.smsTemplateBody) {
            this.toaster.warning('SMS template is empty. Please create a template first.');
            this.dataSMSBody = '';
          } else {
            this.dataSMSBody = template.smsTemplateBody;
          }
          
          this.smsTemplateForm.patchValue({
            smsTemplateBody: this.dataSMSBody
          });
          
          this.isTemplateUpdate = true;
        } else {
          this.toaster.warning('No SMS template found. Please create a new template.');
          this.dataSMSBody = '';
          this.isTemplateUpdate = false;
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching SMS template:', error);
        this.toaster.error('Failed to load SMS template. Please try again.');
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

onTemplateSubmit(): void {
  this.isLoading = true;
  
  // Construct the proper email template request model
  const requestModel: any = {
    masterEmailTemplateId: this.isTemplateUpdate ? this.templateDataList[0].masterEmailTemplateId : 0,
    emailTemplateName: 'scheduled appointment',
    emailTemplateSubject: this.emailTemplateForm.get('emailTemplateSubject')?.value,
    emailTemplateBody: this.emailTemplateForm.get('emailTemplateBody')?.value,
    isActive: true
  };

  this.sendingEmail.AddUpdateEmailTemplate(requestModel).subscribe({
    next: (Response: any) => {
      if (Response.value.isSuccess === true) {
        if (this.isTemplateUpdate === false) {
          this.toaster.success('Email template created successfully.');
        } else {
          this.toaster.success('Email template updated successfully.');
        }
        const btnSamElement = document.getElementById('EmailVisitsModalclose');
        if (btnSamElement) {
          btnSamElement.click();
        }
      } else {
        this.toaster.error(Response.value.error.message);
      }
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error saving email template:', error);
      this.toaster.error('Failed to save email template. Please try again.');
      this.isLoading = false;
    }
  });
}

onSMSTemplateSubmit(): void {
  const templateBody = this.smsTemplateForm.get('smsTemplateBody')?.value;
  if (!templateBody || templateBody.trim() === '') {
    this.toaster.error('SMS template body cannot be empty');
    return;
  }

  // Validate template length
  if (templateBody.length > 160) {
    this.toaster.warning('Template exceeds 160 characters and may be split into multiple SMS');
  }
  
  this.isLoading = true;
  
  // Ensure we have a valid template ID
  const templateId = this.isTemplateUpdate && this.templateDataList[0]?.masterSMSTemplateId 
    ? this.templateDataList[0].masterSMSTemplateId 
    : this.SMStemplateId;

  const requestModel = {
    masterSMSTemplateId: templateId,
    smsTemplateBody: templateBody.trim()
  };

  console.log('Saving SMS template:', requestModel);

  this.sendingEmail.AddUpdateSMSTemplate(requestModel).subscribe({
    next: (response: any) => {
      if (response.value.isSuccess) {
        this.toaster.success(
          this.isTemplateUpdate ? 
          'SMS template updated successfully' : 
          'SMS template created successfully'
        );
        
        // Refresh the template data
        this.getSMSTemplate(templateId);
        
        // Close modal if it exists
        const modalElement = document.getElementById('SMSVisitsModalclose');
        if (modalElement) {
          modalElement.click();
        }
      } else {
        console.error('Failed to save template:', response.value.error);
        this.toaster.error(response.value.error?.message || 'Failed to save SMS template');
      }
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error saving SMS template:', error);
      this.toaster.error('Failed to save SMS template. Please try again.');
      this.isLoading = false;
    }
  });
}

getSelectedEmails(): string[] {
  return this.clientList
    .filter(client => client.selectrow && client.email && client.email.includes('@'))
                        .map(client => client.email);
}

getSelectedSMS(): boolean[] {
  return this.clientList
    .filter(client => client.selectrow)
    .map(client => client.sMS);
}

getSelectedEmailsClient(): boolean[] {
  return this.clientList
    .filter(client => client.selectrow)
    .map(client => client.emailSend);
}

private validateMobileNumber(number: string): { isValid: boolean; formattedNumber: string | null } {
  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '');
  
  // Check if the number has a valid length (10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return { isValid: false, formattedNumber: null };
  }

  // Ensure number starts with country code
  const formattedNumber = cleaned.startsWith('1') ? cleaned : `1${cleaned}`;
  
  return { isValid: true, formattedNumber };
}

private getSelectedMobileNumber(): (string | null)[] {
  const selectedNumbers = this.clientList
    .filter(client => client && client.selectrow)
    .map(client => {
      if (client.sMS && client.mobileNumber) {
        const { isValid, formattedNumber } = this.validateMobileNumber(client.mobileNumber);
        
        if (!isValid) {
          console.warn(`Invalid mobile number for client ${client.firstName} ${client.lastName}: ${client.mobileNumber}`);
          this.toaster.warning(`Invalid phone number format for ${client.firstName} ${client.lastName}`);
          return null;
        }
        
        return formattedNumber;
      }
      return null;
    })
    .filter(number => number !== null);

  return selectedNumbers;
}

onSendConfirmationEmail(): void {
  this.isLoading = true;

  try {
    const selectedMobileNumbers = this.getSelectedMobileNumber();
const selectedEmails = this.getSelectedEmails();
    const smsStatus = this.getSelectedSMS();
    const emailStatus = this.getSelectedEmailsClient();
    
    // Check if we have any valid recipients
    if (selectedMobileNumbers.length === 0 && selectedEmails.length === 0) {
      this.toaster.error('No valid recipients selected. Please select at least one recipient with a valid phone number or email address.');
      this.isLoading = false;
      return;
    }
    
    const visitDate = this.emailSendForm.get('visitDate')?.value;
    if (!visitDate) {
      this.toaster.error('Please select a visit date');
      this.isLoading = false;
      return;
    }

    const formattedDate = visitDate instanceof Date ? 
      visitDate.toISOString().split('T')[0] : 
      visitDate;
    
    const requestModel = {
      masterEmailTemplateId: this.templateId,
      masterSMSTemplateId: this.SMStemplateId,
      recipients: selectedEmails,
      visitDate: formattedDate,
      sms: smsStatus,
      emailClient: emailStatus,
      mobileNumber: selectedMobileNumbers
    };
    
    console.log('Sending email request:', requestModel);
    
    this.sendingEmail.SendEmailConfirmation(requestModel).subscribe(
      (response: any) => {
        if (response && (response.statusCode === 200 || response.isSuccess === true)) {
          this.toaster.success(response.message || 'Messages sent successfully.');
        } else {
          this.toaster.error(
            response.message || 
            'Failed to send emails/SMS. Please try again.'
          );
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Email send error:', error);
        this.toaster.error(
          error.error?.message || 
          'Server error occurred when sending emails. Please try again.'
        );
        this.isLoading = false;
      }
    );
  } catch (error) {
    console.error('Error in onSendConfirmationEmail:', error);
    this.toaster.error('An unexpected error occurred. Please try again.');
    this.isLoading = false;
  }
}

// Method to handle row selection
onRowSelectionChange(client: any, event: any): void {
  client.selectrow = event.target.checked;
  
  // Removed: Automatic SMS/email checking when row is selected
  // Row selection is now completely independent from preference checkboxes
}

// Method to handle SMS checkbox changes
onSMSChange(client: any, event: any): void {
  if (!client) {
    return;
  }

  if (!client.mobileNumber || client.mobileNumber.trim() === '') {
    if (event && event.target) {
      event.target.checked = false;
    }
    this.toaster.warning('No valid phone number available for SMS');
    return;
  }

  // Validate mobile number format before allowing SMS selection
  const cleanedNumber = client.mobileNumber.replace(/\D/g, '');
  if (cleanedNumber.length < 10 || cleanedNumber.length > 15) {
    if (event && event.target) {
      event.target.checked = false;
    }
    this.toaster.warning(`Invalid phone number format for ${client.firstName} ${client.lastName}`);
    return;
  }

  client.sMS = event && event.target ? event.target.checked : false;
  
  // Removed: Automatic row unchecking when both SMS and email are unchecked
  // This allows users to keep their preferences independent of row selection
}

// Method to handle email checkbox changes
onEmailChange(client: any, event: any): void {
  if (!client) {
    return;
  }

  if (!client.email || !client.email.includes('@')) {
    if (event && event.target) {
      event.target.checked = false;
    }
    this.toaster.warning('No valid email address available');
    return;
  }

  client.emailSend = event && event.target ? event.target.checked : false;
  
  // Removed: Automatic row unchecking when both SMS and email are unchecked
  // This allows users to keep their preferences independent of row selection
}

sendSMS() {
  const mobileNumbers = this.getSelectedMobileNumber();
  
  if (!mobileNumbers.length) {
    this.toaster.error('No valid mobile numbers selected for SMS');
    return;
  }

  const message = this.emailSendForm.get('message')?.value;
  if (!message || message.trim() === '') {
    this.toaster.error('Please enter a message to send');
    return;
  }

  // Validate message length (SMS typically has a 160 character limit)
  if (message.length > 160) {
    this.toaster.warning('Message exceeds 160 characters and may be split into multiple SMS');
  }

  const smsRequest = {
    to: mobileNumbers,
    message: message.trim()
  };

  this.isLoading = true;
  this.sendingEmail.sendSMS(smsRequest).subscribe({
    next: (response: any) => {
      console.log('SMS sent successfully:', response);
      this.toaster.success('SMS sent successfully');
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error sending SMS:', error);
      this.toaster.error(
        error.error?.message || 
        'Failed to send SMS. Please check the phone numbers and try again.'
      );
      this.isLoading = false;
      }
    });
}
}
