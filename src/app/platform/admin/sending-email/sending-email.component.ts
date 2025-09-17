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
  templateSubjectEN: string;
  templateSubjectFR: string;
  templateBodyEN: string;
  templateBodyFR: string;
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
  langPref?: string;
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
  templateEditForm : FormGroup;
  visitDate : Date | undefined;
  clientList: Client[] = [];
  templateDataList: any[]=[];
  convertedDate: any;
  name = 'Angular';
  editor = ClassicEditor;
  editor1 = ClassicEditor;
  editor2 = ClassicEditor; // For French email body
  editor3 = ClassicEditor; // For French SMS body
  dataEmailBodyEN: string = '';
  dataEmailBodyFR: string = '';
  dataSMSBody: string = '';
  dataEmailBody: string = '';
  dataEmailSubject: string = '';
  selectedLanguage: string = 'en';
  dataSMSBodyEN: string = '';
  dataSMSBodyFR: string = '';
  selectedSMSLanguage: string = 'en';
  templateId: number=10;
  SMStemplateId: number=12;
  emailTemplateModel!: EmailTemplateModel;
  templateEmailModel!: TemplateEmailModel;
  isTemplateUpdate: boolean=false;
  isEmailTemplateUpdate: boolean=false;
  isSMSTemplateUpdate: boolean=false;
  isLoading = false;
  activeLanguageTab: 'en' | 'fr' = 'en';
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
this.templateEditForm = new FormGroup('');
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

    // Separate form for email template with bilingual support
    this.emailTemplateForm = this.formBuilder.group({
      masterEmailTemplateId: [0],
      emailTemplateName: ['scheduled appointment'],
      templateSubjectEN: ['Your appointment confirmation'],
      templateSubjectFR: ['Confirmation de votre rendez-vous'],
      templateBodyEN: [''],
      templateBodyFR: [''],
      emailTemplateBody: [''], // Add this control for the CKEditor
      isActive: [true]
    });

    // Create a separate form for SMS template
    this.smsTemplateForm = this.formBuilder.group({
      masterSMSTemplateId: [0],
      smsTemplateBody: [''],
      isActive: [true]
    });

    // Create form for template editing (similar to service call component)
    this.templateEditForm = this.formBuilder.group({
      emailTemplateBody: [''],
      templateSubjectEN: [''],
      templateSubjectFR: [''],
      templateBodyEN: [''],
      templateBodyFR: ['']
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
        console.log('Raw API response:', response);
        console.log('Raw client data:', response.value);
        
        this.clientList = response.value.map((client: any) => ({
          ...client,
          selectrow: true,
          // Set initial SMS checkbox state based on client preference and phone number availability
          // Handle both uppercase and lowercase field names from API
          sMS: (client.sMS || client.sms) && client.mobileNumber && client.mobileNumber.trim() !== '',
          // Set initial email checkbox state based on client preference and email availability
          emailSend: (client.emailClient || client.emailclient) && client.email && client.email.includes('@')
        }));
        
        console.log('Processed client list:', this.clientList);
        console.log('First client langPref:', this.clientList[0]?.langPref);
        console.log('All client langPrefs:', this.clientList.map(c => ({ name: c.firstName, langPref: c.langPref })));
        
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
        const template = this.templateDataList[0];
        
        // Set bilingual content
        this.dataEmailBodyEN = template.templateBodyEN || template.emailTemplateBody || '';
        this.dataEmailBodyFR = template.templateBodyFR || '';
        
        
        this.emailTemplateForm.patchValue({
          masterEmailTemplateId: template.masterEmailTemplateId,
          templateSubjectEN: template.templateSubjectEN || template.emailTemplateSubject || '',
          templateSubjectFR: template.templateSubjectFR || '',
          templateBodyEN: this.dataEmailBodyEN,
          templateBodyFR: this.dataEmailBodyFR
        });

        // Also populate the template edit form
        this.templateEditForm.patchValue({
          templateSubjectEN: template.templateSubjectEN || template.emailTemplateSubject || '',
          templateSubjectFR: template.templateSubjectFR || '',
          templateBodyEN: this.dataEmailBodyEN,
          templateBodyFR: this.dataEmailBodyFR
        });

        // Set initial values for the template editor
        this.dataEmailBody = this.dataEmailBodyEN;
        this.dataEmailSubject = template.templateSubjectEN || template.emailTemplateSubject || '';
        
        // Also populate the email template form for the modal
        this.emailTemplateForm.patchValue({
          templateSubjectEN: template.templateSubjectEN || template.emailTemplateSubject || '',
          templateSubjectFR: template.templateSubjectFR || '',
          templateBodyEN: this.dataEmailBodyEN,
          templateBodyFR: this.dataEmailBodyFR,
          emailTemplateBody: this.dataEmailBodyEN
        });
        
        
        if((this.dataEmailBodyEN !== null && this.dataEmailBodyEN !== '') || (this.dataEmailBodyFR !== null && this.dataEmailBodyFR !== ''))
        {
          this.isEmailTemplateUpdate=true;
        }
        this.isLoading = false;
      }
    });
  }
  getSMSTemplate(id: any) {
    this.isLoading = true;
    this.sendingEmail.GetEmailTemplateByTemplateId(id).subscribe({
      next: (response: any) => {
        if (response && response.value && response.value.length > 0) {
        this.templateDataList = response.value;
          const template = this.templateDataList[0];
          
          
          // Load both English and French SMS content
          this.dataSMSBodyEN = template.templateBodyEN || template.smsTemplateBody || '';
          this.dataSMSBodyFR = template.templateBodyFR || '';
          
          console.log('SMS Template loaded:', template);
          console.log('SMS English body:', this.dataSMSBodyEN);
          console.log('SMS French body:', this.dataSMSBodyFR);
          
          // Use English as default for SMS editing
          this.dataSMSBody = this.dataSMSBodyEN;
          
          this.smsTemplateForm.patchValue({
            smsTemplateBody: this.dataSMSBody
          });
          
          // Set SMS template update flag
          if((this.dataSMSBodyEN !== null && this.dataSMSBodyEN !== '') || (this.dataSMSBodyFR !== null && this.dataSMSBodyFR !== ''))
          {
            this.isSMSTemplateUpdate = true;
          }
        } else {
          this.toaster.warning('No SMS template found. Please create a new template.');
          this.dataSMSBody = '';
          this.isSMSTemplateUpdate = false;
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
    'language',
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
  
  // Save current content before submitting
  this.saveCurrentLanguageContent(this.selectedLanguage);
  
  // Get the current template data
  const template = this.templateDataList[0];
  
  // Construct the request model using the existing template ID
  const requestModel: any = {
    masterEmailTemplateId: template.masterEmailTemplateId,
    emailTemplateName: template.emailTemplateName || 'scheduled appointment',
    templateSubjectEN: this.templateEditForm.get('templateSubjectEN')?.value,
    templateSubjectFR: this.templateEditForm.get('templateSubjectFR')?.value,
    templateBodyEN: this.templateEditForm.get('templateBodyEN')?.value,
    templateBodyFR: this.templateEditForm.get('templateBodyFR')?.value,
    isActive: true
  };

  console.log('Updating email template with ID:', template.masterEmailTemplateId);
  console.log('Request model:', requestModel);

  this.sendingEmail.AddUpdateEmailTemplate(requestModel).subscribe({
    next: (Response: any) => {
      if (Response.value.isSuccess === true) {
        this.toaster.success('Email template updated successfully.');
        
        // Close the modal
        const modalElement = document.getElementById('EmailVisitsModal');
        if (modalElement) {
          const closeButton = modalElement.querySelector('.btn-close') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }
        
        // Refresh the template data
        this.getEmailTemplate(this.templateId);
      } else {
        this.toaster.error(Response.value.error.message);
      }
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error updating email template:', error);
      this.toaster.error('Failed to update email template. Please try again.');
      this.isLoading = false;
    }
  });
}

onSMSTemplateSubmit(): void {
  // Save current content before submitting
  this.saveCurrentSMSLanguageContent(this.selectedSMSLanguage);
  
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
  
  // Get the current template data
  const template = this.templateDataList[0];
  
  // Update both English and French SMS content
  const requestModel = {
    masterEmailTemplateId: template.masterEmailTemplateId,
    emailTemplateName: template.emailTemplateName || 'scheduled appointment',
    templateSubjectEN: template.templateSubjectEN || 'Your appointment confirmation',
    templateSubjectFR: template.templateSubjectFR || 'Confirmation de votre rendez-vous',
    templateBodyEN: this.dataSMSBodyEN,
    templateBodyFR: this.dataSMSBodyFR,
    isActive: true
  };

  console.log('Saving SMS template:', requestModel);

  this.sendingEmail.AddUpdateEmailTemplate(requestModel).subscribe({
    next: (response: any) => {
      if (response.value.isSuccess) {
        this.toaster.success('SMS template updated successfully');
        
        // Refresh the template data
        this.getSMSTemplate(this.SMStemplateId);
        
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
    .filter(client => client.selectrow && client.emailSend && client.email && client.email.includes('@'))
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
    // Get selected clients with their preferences
    const selectedClients = this.clientList.filter(client => client.selectrow);
    
    // Check if we have any selected clients
    if (selectedClients.length === 0) {
      this.toaster.error('No clients selected. Please select at least one client.');
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
    
    // Group clients by language preference (default to French if no preference)
    const englishClients = selectedClients.filter(client => client.langPref === 'en');
    const frenchClients = selectedClients.filter(client => (client.langPref || 'fr') === 'fr');
    
    console.log('English clients:', englishClients);
    console.log('French clients:', frenchClients);
    
    // Send to English clients
    if (englishClients.length > 0) {
      this.sendToClientGroup(englishClients, formattedDate, 'en');
    }
    
    // Send to French clients
    if (frenchClients.length > 0) {
      this.sendToClientGroup(frenchClients, formattedDate, 'fr');
    }
    
  } catch (error) {
    console.error('Error in onSendConfirmationEmail:', error);
    this.toaster.error('An unexpected error occurred. Please try again.');
    this.isLoading = false;
  }
}

private sendToClientGroup(clients: any[], visitDate: string, language: string): void {
  const emails = clients
    .filter(client => client.emailSend && client.email && client.email.includes('@'))
    .map(client => client.email);
    
  const mobileNumbers = clients
    .filter(client => client.sMS && client.mobileNumber && client.mobileNumber.trim() !== '')
    .map(client => client.mobileNumber);
    
  const smsStatus = clients
    .filter(client => client.sMS && client.mobileNumber && client.mobileNumber.trim() !== '')
    .map(() => true);
    
  const emailStatus = clients
    .filter(client => client.emailSend && client.email && client.email.includes('@'))
    .map(() => true);
    
  const languagePreferences = clients.map(() => language);

  // Check if we have any valid recipients for this language group
  if (emails.length === 0 && mobileNumbers.length === 0) {
    console.log(`No valid recipients for ${language} clients`);
    return;
  }

  const requestModel = {
    masterEmailTemplateId: this.templateId,
    masterSMSTemplateId: this.SMStemplateId,
    recipients: emails,
    visitDate: visitDate,
    sms: smsStatus,
    emailClient: emailStatus,
    mobileNumber: mobileNumbers,
    clientLanguagePreferences: languagePreferences
  };
  
  console.log(`Sending ${language} request:`, requestModel);
  
  this.sendingEmail.SendEmailConfirmation(requestModel).subscribe(
    (response: any) => {
      if (response && (response.statusCode === 200 || response.isSuccess === true)) {
        this.toaster.success(`${language === 'en' ? 'English' : 'French'} messages sent successfully.`);
      } else {
        this.toaster.error(
          response.message || 
          `Failed to send ${language} emails/SMS. Please try again.`
        );
      }
      this.isLoading = false;
    },
    (error) => {
      console.error(`${language} send error:`, error);
      this.toaster.error(
        error.error?.message || 
        `Server error occurred when sending ${language} emails. Please try again.`
      );
      this.isLoading = false;
    }
  );
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
  // Use the correct SendEmail endpoint with template IDs
  // Template ID 12 is used for SMS based on the working VisitController
  const emailRequest = {
    MasterEmailTemplateId: 0, // No email template needed for SMS only
    MasterSMSTemplateId: 12,  // Use SMS template ID 12
    Recipients: [], // No email recipients for SMS only
    VisitDate: new Date().toISOString().split('T')[0], // Today's date
    SMS: mobileNumbers.map(() => true), // All numbers should receive SMS
    EmailClient: [], // No email clients for SMS only
    MobileNumber: mobileNumbers
  };

  this.sendingEmail.SendEmailConfirmation(emailRequest).subscribe({
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

// Method to switch between French and English template editing
switchLanguage(language: string): void {
  
  // Save current content to the current language before switching
  this.saveCurrentLanguageContent(this.selectedLanguage);
  
  this.selectedLanguage = language;
  
  // Update the editor content based on selected language
  if (language === 'fr') {
    const frenchBody = this.emailTemplateForm.get('templateBodyFR')?.value || '';
    const frenchSubject = this.emailTemplateForm.get('templateSubjectFR')?.value || '';
    
    this.dataEmailBody = frenchBody;
    this.dataEmailSubject = frenchSubject;
    
    // Update both the template edit form and email template form
    this.templateEditForm.patchValue({
      emailTemplateBody: frenchBody
    });
    this.emailTemplateForm.patchValue({
      emailTemplateBody: frenchBody
    });
  } else {
    const englishBody = this.emailTemplateForm.get('templateBodyEN')?.value || '';
    const englishSubject = this.emailTemplateForm.get('templateSubjectEN')?.value || '';
    
    this.dataEmailBody = englishBody;
    this.dataEmailSubject = englishSubject;
    
    // Update both the template edit form and email template form
    this.templateEditForm.patchValue({
      emailTemplateBody: englishBody
    });
    this.emailTemplateForm.patchValue({
      emailTemplateBody: englishBody
    });
  }
}

// Method to save current editor content to the appropriate language field
saveCurrentLanguageContent(language?: string): void {
  // Get content from the email template form (which is bound to the CKEditor)
  const currentContent = this.emailTemplateForm.get('emailTemplateBody')?.value || '';
  const currentSubject = this.dataEmailSubject || '';
  
  if (language === 'fr') {
    this.templateEditForm.patchValue({
      templateBodyFR: currentContent,
      templateSubjectFR: currentSubject
    });
    this.emailTemplateForm.patchValue({
      templateBodyFR: currentContent,
      templateSubjectFR: currentSubject
    });
  } else {
    this.templateEditForm.patchValue({
      templateBodyEN: currentContent,
      templateSubjectEN: currentSubject
    });
    this.emailTemplateForm.patchValue({
      templateBodyEN: currentContent,
      templateSubjectEN: currentSubject
    });
  }
}

// Method to switch between French and English SMS template editing
switchSMSLanguage(language: string): void {
  this.selectedSMSLanguage = language;
  
  // Update the SMS editor content based on selected language
  if (language === 'fr') {
    this.dataSMSBody = this.dataSMSBodyFR;
  } else {
    this.dataSMSBody = this.dataSMSBodyEN;
  }
  
  this.smsTemplateForm.patchValue({
    smsTemplateBody: this.dataSMSBody
  });
}

// Method to save current SMS content to the appropriate language field
saveCurrentSMSLanguageContent(language?: string): void {
  const currentContent = this.smsTemplateForm.get('smsTemplateBody')?.value || '';
  
  if (language === 'fr') {
    this.dataSMSBodyFR = currentContent;
  } else {
    this.dataSMSBodyEN = currentContent;
  }
}

}
