import { Component, EventEmitter, Input, Output, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../core/services/common.service';
import { ServiceCallService } from '../service-call.service';
import { SendingemailService } from '../../sending-email/sendingemail.service';
import { ClientService } from '../../clients/client.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { technicianList } from '../../../../shared/Models/technicianListModel';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ImageApiService } from '../../../../core/services/image-api.service';
// import { environment } from '../../../../environments/environment';
declare var window: any;

@Component({
  selector: 'app-add-service-call',
  standalone: true,
  providers: [DatePipe],
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    MatTableModule, 
    MatIconModule,
    MatCheckboxModule,
    CKEditorModule],
  templateUrl: './add-service-call.component.html',
  styleUrl: './add-service-call.component.scss'
})
export class AddServiceCallComponent {
  @Input() data: any;
  @Output() myOutput: EventEmitter<any> = new EventEmitter();
  adminToken: any;
  clientId: any;
  createServiceCallForm : FormGroup
  createTechnicianForm:FormGroup
  emailTemplateForm:FormGroup
  poolspecialist: any[]=[];
  status: any[]=[];
  issuedescription: any[] = [];
  servicecallnumber: any;
  spadetail: any[]=[];
  value: any;
  serviceCallId: any;
  datasource: any[]=[];
  techniciannamelist: any[]=[];
  isEditServicecall=false;
  isEditTechniciancall=false;
  selectedTechnician: string = '';
  isCompleteChecked = false;
  showSecondCheckbox = false;
  paymentMethodlist: any[]=[];
  visitId: number=0;
  secondModal: any;
  isLoading = false;
  addnewvisit: string = '';
  isservicecall=false;
  isTemplateUpdate: boolean=false;
  selectedLanguage: string = 'en'; // Language toggle for template editing
  dataEmailSubject: string = ''; // Current subject content for display
  //isservicecalleditdata=false;
  currentDate: any;
  templateDataList: any[]=[];
  dataEmailBody: string = '';
  editor = ClassicEditor;
  public configEmailBody = {
    toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
  
}
  templateId: number = 11; // Work order template for email-only sending (using existing template)
  emilAddress: string = '';
  newServiceCall: any;
  serviceCallNumberModal:any;
  minToDate: string = '';
  isDisabled = false;
  imageUrl: SafeUrl | null = null;
  minDurationTime: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  base64Image: string | null = null;  // To store the Base64 image

  imageUrls: SafeUrl[] = [];
  selectedFiles: File[] = [];
  cloudinaryImages: Array<{publicId: string, url: string, uploadedBy: 'admin' | 'technician'}> = [];
  selectedImageUrl: any;
  language: any;
  currentLanguage: string = 'en'; // Default language
  private subscription: Subscription = new Subscription();
  uploadImages = false;
  showImage = false;
  uploadingImage = false;

constructor(
    private servicecallservice : ServiceCallService,
    private sendingEmailService: SendingemailService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private router: Router,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private commonservice : CommonService,
    private clientService: ClientService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private imageApiService: ImageApiService
){
  this.createServiceCallForm = new FormGroup('');
  this.createTechnicianForm = new FormGroup('');
  this.emailTemplateForm = new FormGroup('');
}

ngOnInit(){
 
  
  //this.queryPrms();
  this.subscription = this.commonservice.languageChange$.subscribe((lang) => {
    this.currentLanguage = lang;
  });
  this.serviceCallId = this.data[0].serviceCallId;
  this.value = this.data[0].value;
  this.clientId = this.data[0].clientId;
  this.newServiceCall = this.data[0].addnewservicecall;
  this.emilAddress= this.data[0].email;
  
  // Debug: Check what client data is available at initialization
  console.log('🔍 ngOnInit - Component initialization:');
  console.log('  - serviceCallId:', this.serviceCallId);
  console.log('  - value:', this.value);
  console.log('  - clientId from data[0]:', this.data[0].clientId);
  console.log('  - this.clientId set to:', this.clientId);
  console.log('  - newServiceCall:', this.newServiceCall);
  console.log('  - emailAddress:', this.emilAddress);
  console.log('  - Full data[0] object:', this.data[0]);
  
  // Always enable image uploads
  this.uploadImages = true;
  
  // Initialize cloudinary images array
  this.cloudinaryImages = [];
  
  this.createformgroup();
  this.createformgroup1();
  this.createformgroup2();
  this.selectedTechnician = 'Attente Waiting';
  this.serviceCallNumberModal = new window.bootstrap.Modal(
    document.getElementById('serviceCallNumberModal')
  );
  this.secondModal = new window.bootstrap.Modal(
    document.getElementById('secondModal')
  );

}
ngOnChanges(changes: SimpleChanges) {
  
  if (changes['data']) {
    
    this.serviceCallId = this.data[0].serviceCallId;
    this.value = this.data[0].value;
    this.clientId = this.data[0].clientId;
    this.newServiceCall = this.data[0].addnewservicecall;
    this.emilAddress= this.data[0].email;
    this.servicecallnumber = this.data[0].serviceCallNumber;
    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')
    
    // Debug: Check what client data is available when data changes
    console.log('🔍 ngOnChanges - Data input changed:');
    console.log('  - serviceCallId:', this.serviceCallId);
    console.log('  - value:', this.value);
    console.log('  - clientId from data[0]:', this.data[0].clientId);
    console.log('  - this.clientId set to:', this.clientId);
    console.log('  - newServiceCall:', this.newServiceCall);
    console.log('  - emailAddress:', this.emilAddress);
    console.log('  - servicecallnumber:', this.servicecallnumber);
    console.log('  - Full data[0] object in ngOnChanges:', this.data[0]);
    this.uploadImages = false;
    this.createformgroup();
    
  //this.getnewservicecallid();
  this.getpoolspecialist();
  this.getstatus();
  this.getspadetails();
  this.getissuedescription();
  this.getTechnicianNamelist();
  this.getPaymentMethodlist();
  this.getEmailTemplate(this.templateId);
    //this.ngOnInit();
  }
}
displayedColumns: string[] = [
  'Technician',
  'Date',
  'Hours',
  'Duration',
  'paid',
  'edit',
  'delete'
];


createformgroup(){
    this.createServiceCallForm = this.formBuilder.group({
      servicecallnumber : [''],
      reference: [''],
      dateReception : [this.currentDate],
      spa : [''],
      datePlacement: [this.currentDate],
      poolspecialist : [''],
      issueproblem : ['',Validators.required],
      status: [''],
      comments : [''],
      notes:[''],
      description:[''],
      images:['']
    }) 
}

createformgroup1() {
  this.createTechnicianForm = this.formBuilder.group({
    technician: [{ value: '6', disabled: this.isDisabled }, Validators.required],
    dateVisit: [{ value: this.currentDate, disabled: this.isDisabled }, Validators.required],
    hourVisit: [{ value: '', disabled: this.isDisabled }],
    durationTime: [{ value: '', disabled: this.isDisabled }],
    photosDossier: [{ value: false, disabled: this.isDisabled }],
    isClosed: [{ value: false, disabled: this.isDisabled }],
    spaAccessible: [{ value: false, disabled: this.isDisabled }],
    bloquerTech: [{ value: false, disabled: this.isDisabled }],
    payment: [{ value: false, disabled: this.isDisabled }],
    paymentMethod: [{ value: '', disabled: this.isDisabled }],
    complete: [{ value: false, disabled: this.isDisabled }],
    durationnextVisit: [{ value: '', disabled: this.isDisabled }],
    missingParts: [{ value: '', disabled: this.isDisabled }],
    notes: [{ value: '', disabled: this.isDisabled }],
    techniciancomments: [{ value: '', disabled: this.isDisabled }],
    sPieces: [{ value: '', disabled: this.isDisabled }],
    sMo: [{ value: '', disabled: this.isDisabled }],
    SousTotal: [{ value: '', disabled: this.isDisabled }],
    tps: [{ value: '', disabled: this.isDisabled }],
    tvq: [{ value: '', disabled: this.isDisabled }],
    grandtotal: [{ value: '', disabled: this.isDisabled }],
    invoice:[{ value: '', disabled: this.isDisabled }]
  });
  this.onHourVisitChange();
}
createformgroup2(){
  this.emailTemplateForm = this.formBuilder.group({
      emailTemplateBody:[''],
      templateBodyFR:[''],
      templateBodyEN:[''],
      templateSubjectFR:[''],
      templateSubjectEN:['']
    }) 
}


validatePositiveNumbers(event: any) {
  const inputValue = event.target.value;

  // Check if the input is a number and greater than zero
  if (isNaN(inputValue) || inputValue <= 0 || /[^0-9.]/.test(inputValue)) {
    event.target.value = ''; // Clear the input or set a custom error message
    console.log('Invalid input: Must be a positive number greater than 0');
  }
}



getservicecallbyId(){
  
  this. isLoading = true;
  
  //this.isservicecalleditdata=true;
  setTimeout(() => {
    // Removed scroll action - let user stay where they are
    // window.scrollTo(0, 500);
  this.servicecallservice.getservicecallbyid(this.serviceCallId).subscribe({
    next: (response:any) => {
      if(response){
        console.log('Service call response data:', response.value);
        console.log('🔍 CRITICAL DEBUG - Service call response fields:');
        console.log('  - spaId:', response.value.spaId);
        console.log('  - clientId:', response.value.clientId);
        console.log('  - idClient:', response.value.idClient);
        console.log('  - ClientId:', response.value.ClientId);
        console.log('  - All available fields:', Object.keys(response.value));
        
        this.uploadImages = true;
        
        // Load images from Cloudinary using service call number
        if (response.value.serviceCallNumber) {
          this.loadImagesForServiceCall(response.value.serviceCallNumber);
        }
        this.gettechniciandetail();
        this.servicecallnumber= response.value.serviceCallNumber;
        
        // Store the service call data (only fields that actually exist in ServiceCallDTO)
        this.data[0] = {
          ...this.data[0], // Keep existing data
          ...response.value, // Add the service call data
          serviceCallId: this.serviceCallId,
          serviceCallNumber: response.value.serviceCallNumber,
          issueDescription: response.value.description,
          comments: response.value.comments,
          notes: response.value.notes,
          clientId: response.value.clientId // Now available from the fixed DTO!
        };
        
        // Update the component's clientId property with the now-available client ID
        if (response.value.clientId) {
          this.clientId = response.value.clientId;
          console.log('✅ ClientId now set from service call response:', this.clientId);
        }
        
        console.log('Updated data after service call load:', this.data[0]);
        
        // Load visit details (technician info, duration, etc.)
        if (this.visitId) {
          console.log('Loading visit details for visitId:', this.visitId);
          this.loadVisitDetails(this.visitId);
        }
        
        // Load client details using the now-available client ID
        if (this.clientId) {
          console.log('✅ Loading client details using clientId:', this.clientId);
          this.loadClientDetails(this.clientId);
        } else {
          console.log('❌ No clientId available even after service call load');
          console.log('Available fields in service call response:', Object.keys(response.value));
          console.log('This should not happen anymore with the DTO fix');
        }
        
        this.createServiceCallForm.patchValue({
          servicecallnumber : response.value.serviceCallNumber,
          reference : response.value.reference,
          dateReception: this.formatDate(response.value.receptionDate),
          spa: response.value.spaId === 0 ? '' : response.value.spaId,
          status:response.value.statusId === 0 ? '' : response.value.statusId ,
          datePlacement:this.formatDate(response.value.placementDate),
          issueproblem: response.value.issueClassId === 0 ? '' : response.value.issueClassId,
          comments:response.value.comments,
          notes:response.value.notes,
          description:response.value.description,
          poolspecialist : response.value.poolSpecialistId === 0 ? '' : response.value.poolSpecialistId
        });
        this.isservicecall=true;
      }
      //this.isservicecalleditdata=true;
    },
    error: (error) => {
      console.log('Error loading service call data for serviceCallId:', this.serviceCallId, 'Error:', error.status);
      if (error.status === 404) {
        console.log('Service call not found, using existing data from this.data[0]');
        // Use the data we already have from this.data[0] instead of trying to fetch from API
        this.isservicecall = true;
        this.uploadImages = false; // Don't try to load images for non-existent service call
      }
    }
  })
this. isLoading = false;
}, 300);
}
toggleSecondCheckbox(event: any) {
  this.showSecondCheckbox = event.target.checked;
}
getnewservicecallid(){
  

  if(this.value == 'edit')
  {
    // Don't reset visit form visibility if we're currently editing a visit
    if (!this.isEditTechniciancall && this.visitId === 0) {
      this.isEditServicecall=false;
    }
    this.isDisabled = false;
    this.getservicecallbyId();
    
  }
  else{
    
    this.isEditServicecall=true;
    this.isservicecall = true;
     this.datasource = [];
    this.addnewvisit = 'newvisit';
    this.newServiceCall = false;
    this.visitId = 0;
    this.isDisabled = false;
    this.showImage = false;
    this.createTechnicianForm.enable();
    this.createTechnicianForm.reset({
      technician:6,
      dateVisit:this.currentDate
    })
    this.isEditTechniciancall=false;
  }
  
}
getpoolspecialist(){
  this.getnewservicecallid();
this.servicecallservice.getpoolspecialist().subscribe((response:any)=>{
if(response){
this.poolspecialist = response.value.sort((a: any, b: any) => a.name.localeCompare(b.name));
}
})
}
getstatus(){
this.servicecallservice.getstatus().subscribe((response:any)=>{
  if(response)
  {
this.status = response.value;
  }
})
}
getissuedescription(){
  this.servicecallservice.getissuedescription().subscribe((response:any)=>{
    if(response)
    {
       this.issuedescription = response.value
    }
  })
}
onStatusChange(event: any) {
  
  const selectedIssueId = event.target.value;

  // Disable buttons and form if issue ID is 1 or 2
  if (selectedIssueId === '7' || selectedIssueId === '8' ||selectedIssueId === '9' || 
    selectedIssueId === '12'|| selectedIssueId === '13' || selectedIssueId === '14'||
    selectedIssueId === '15' || selectedIssueId === '16' ||selectedIssueId === '17' || 
    selectedIssueId === '18'|| selectedIssueId === '19' || selectedIssueId === '20') {
    this.isDisabled = true;
    this.createTechnicianForm.disable();

  } else {
    this.isDisabled = false;
    this.createTechnicianForm.enable();
  }
}
getspadetails(){
  if(this.value == 'edit')
    {
      this.servicecallservice.getspadetailsByServiceCallId(this.serviceCallId).subscribe((response:any)=>{
        if(response)
        {
          
          //this.getservicecallbyId();
          this.spadetail = response.value
        }
      })
    }
    else{
      this.servicecallservice.getspadetails(this.clientId).subscribe((response:any)=>{
        if(response)
        {
          
          this.spadetail = response.value

        }
      })
    }
  
}
newvisit(){
this.isEditServicecall = true;
this.isEditTechniciancall = false;
this.visitId=0;
this.addnewvisit = 'newvisit';
this.createTechnicianForm.reset({
  technician:['6']
})
}
onSubmit(){
  console.log('Form submission started');
  const requestModel: any = this.createServiceCallForm.value;
  const requestModel1 :any = this.createTechnicianForm.value;
  
  // Debug: Check if invoice is in the form data
  console.log('🔍 INVOICE DEBUG - Invoice field value:', requestModel1.invoice);

  Object.keys(requestModel).forEach((key) => {
    if (requestModel[key] === "") {
      requestModel[key] = null;
    } 
    if (requestModel[key] === 0) {
      requestModel[key] = null;
    } 
    if (key === "poolspecialist" && requestModel[key] !== null) {
      requestModel[key] = requestModel[key].toString();
    }
    if (key === "issueproblem" && requestModel[key] !== null) {
      requestModel[key] = requestModel[key].toString();
    }
    if (key === "spa" && requestModel[key] !== null) {
      requestModel[key] = requestModel[key].toString();
    }
    if (key === "status" && requestModel[key] !== null) {
      requestModel[key] = requestModel[key].toString();
    }
  });
  Object.keys(requestModel1).forEach((key) => {
    if (requestModel1[key] === "") {
      requestModel1[key] = null;
    } 
    if (requestModel1[key] === 0) {
      requestModel1[key] = null;
    }
    if (key === "technician" && requestModel1[key] !== null) {
      requestModel1[key] = requestModel1[key].toString();
    }
    if (key === "photosDossier" && typeof requestModel1[key] === "string") {
      requestModel1[key] = requestModel1[key].toLowerCase() === "true";
    }
  });
  if (requestModel1.hourVisit) {
    requestModel1.hourVisit = this.formatTimeSpan(requestModel1.hourVisit);
}

if (requestModel1.durationTime) {
    requestModel1.durationTime = this.formatDuration(requestModel1.durationTime);
}
if(this.createServiceCallForm.valid && this.createTechnicianForm.valid){
  console.log('Form is valid. Processing submission...');
  this.isLoading = true;
  setTimeout(() => {
        if(this.serviceCallId >0){
          console.log('Updating existing service call - images are handled separately via Cloudinary');
          requestModel.serviceCallId = this.serviceCallId;
          
          // Images are now handled separately via Cloudinary - no need to send image data
          // Remove any old image properties
          delete requestModel.images;
          delete requestModel.clearExistingImages;
          delete requestModel.imagesPath;
          
          this.servicecallservice.updateServiceCall(requestModel).subscribe(
            (Response: any) => {
              console.log('Service call update response:', Response);
              if(this.visitId > 0){
                requestModel1.VisitId = this.visitId;
                requestModel1.status = requestModel.status;
                if(requestModel1.isClosed == true){
                  requestModel1.EmailTemplateId = 17;
                }
                console.log('🔍 Updating technician with invoice data:', requestModel1);
                console.log('🔍 Invoice value being sent:', requestModel1.invoice);
                this.servicecallservice.updatetechniciandetail(requestModel1).subscribe((response:any)=>{
                  console.log('🔍 Update technician response:', response);
                  if(Response.isSuccess == true)
                  {
                    
                    // Images handled by Cloudinary - no action needed
                    this.getservicecallbyId();
                    this.gettechniciandetail();
                  }
                  else{
                    this.toaster.error(Response.value.error.message);
                   }
                  })
              }
              else{
                if(this.addnewvisit=='newvisit'){
                  requestModel1.serviceCallId = this.serviceCallId;
                this.servicecallservice.createtechniciandetail(requestModel1).subscribe((response:any)=>{
                  if(Response.isSuccess == true)
                  {
                    this.getservicecallbyId();
                    // Keep visit visible after save - don't clear addnewvisit
                    // this.addnewvisit = ''; // REMOVED - keep visit visible
                    // Images handled by Cloudinary - no action needed
                    this.removeImage();
                    this.gettechniciandetail();
                    // this.myOutput.emit({ success: true, id: this.serviceCallId });
                    this.toaster.success('Record Created Successfully');
                  }
                  else{
                    this.toaster.error(Response.value.error.message);
                   }
                  })
                }
                
              }
              this.isLoading = false;
              this.toaster.success('Record Updated Successfully');
              this.myOutput.emit({ success: true, id: this.serviceCallId });
            },
            (error) => {
              console.error('Error updating service call:', error);
              this.isLoading = false;
              this.toaster.error('Error updating service call');
            }
          );
        }
        else{
          console.log('Creating new service call with images count:', this.cloudinaryImages.length);
          requestModel.clientId = this.clientId;
          
          // Make sure images are included when creating a new service call too
          // Images handled by Cloudinary - no action needed
          console.log('Request prepared with images');
          
          this.servicecallservice.createServiceCall(requestModel).subscribe(
            (Response: any) => {
              console.log('Service call create response:', Response);
              this.visitId = Response.value.id;
              this.servicecallnumber = Response.value.value;
              this.serviceCallId = Response.value.spaModel_Id
              this.serviceCallNumberModal.show();
              
              if(this.visitId > 0){
                requestModel1.VisitId = this.visitId;
                requestModel1.status = requestModel.status;
                this.servicecallservice.updatetechniciandetail(requestModel1).subscribe((response:any)=>{
                  if(Response.isSuccess == true)
                  {
                    this.removeImage();
                    // Images handled by Cloudinary - no action needed
                    this.getservicecallbyId();
                    this.gettechniciandetail();
                    
                  }
                  else{
                    this.toaster.error(Response.value.error.message);
                   }
                  })
              }
              else{
                if(this.addnewvisit=='newvisit'){
                  requestModel1.serviceCallId = this.serviceCallId;
                this.servicecallservice.createtechniciandetail(requestModel1).subscribe((response:any)=>{
                  if(Response.isSuccess == true)
                  {
                    this.getservicecallbyId();
                    // Keep visit visible after save - don't clear addnewvisit
                    // this.addnewvisit = ''; // REMOVED - keep visit visible
                    // Images handled by Cloudinary - no action needed
                    this.removeImage();
                    this.gettechniciandetail();
                    // this.myOutput.emit({ success: true, id: this.serviceCallId });
                    this.toaster.success('Record Created Successfully');
                  }
                  else{
                    this.toaster.error(Response.value.error.message);
                   }
                  })
                }
                
              }
              this.isLoading = false;
              this.toaster.success('Record Updated Successfully');
              
              this.myOutput.emit({ success: true, id: this.serviceCallId });
            },
            (error) => {
              console.error('Error creating service call:', error);
              this.isLoading = false;
              this.toaster.error('Error creating service call');
            }
          );
        }
      
      }, 300);
    }

  else {
    console.log('Form is invalid. Validation errors:', this.getFormValidationErrors());
    window.scrollTo(100, 0);
    this.createServiceCallForm.markAllAsTouched();
    this.createTechnicianForm.markAllAsTouched();
    return;
  }
  
  }
  
 formatDate(dateString: string): string {
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Returns 'YYYY-MM-DD'
}

private formatTimeSpan(time: string): string {
  if (!time) return '';
  // If the time contains a space, it's a datetime string
  if (time.includes(' ')) {
    const [date, timePart] = time.split(' ');
    return timePart;
  }
  return time;
}

private formatDuration(duration: string): string {
  if (!duration) return '';
  
  // If it's already in HH:MM format without AM/PM, return as is
  if (duration.match(/^\d{1,2}:\d{2}$/) && !duration.includes('AM') && !duration.includes('PM')) {
    return duration;
  }
  
  // If it contains AM/PM, convert to 24-hour format and treat as duration
  if (duration.includes('AM') || duration.includes('PM')) {
    try {
      const date = new Date('1970-01-01 ' + duration);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.log('Error formatting duration:', error);
      return duration;
    }
  }
  
  // If it's a datetime string, extract just the time part
  if (duration.includes(' ')) {
    const [date, timePart] = duration.split(' ');
    return this.formatDuration(timePart);
  }
  
  return duration;
}
gettechniciandetail() {
  this.isLoading = true;
  this.servicecallservice.getTechnicianDetails(this.serviceCallId).subscribe(
    (response: any) => {
      if (response.value !== null && response.isSuccess === true) {
        this.isLoading = false;
        this.datasource = response.value;
        
        // Format times and durations consistently
        this.datasource = this.datasource.map(item => ({
          ...item,
          hourVisit: this.formatTimeSpan(item.hourVisit),
          durationTime: this.formatDuration(item.durationTime)
        }));
      }
    }
  );
}
getTechnicianNamelist(){
  this.servicecallservice.getTechnicianNamelist().subscribe((response:any)=>{
    if(response){
this.techniciannamelist = response.value;
    }
  })
}
getPaymentMethodlist(){
  this.servicecallservice.getPaymentMethodlist().subscribe((response:any)=>{
    if(response){
this.paymentMethodlist = response.value;
    }
  })
}
editTechnician(id:number){
 
 this.visitId = id;
 this.isEditTechniciancall=true;
 this.isEditServicecall = true;
    this.servicecallservice.getTechnicianDeteilByid(id).subscribe((response:any)=>{
  if(response){
    
    this.createTechnicianForm.patchValue({
      technician: response.value[0].technician , // Default to empty string if not available
      dateVisit: this.formatDate(response.value[0].dateOfVisit),
      hourVisit: response.value[0].dateVisit, // Use formatDate if needed
      durationTime:response.value[0].hourVisit,
      durationnextVisit: response.value[0].nextVisitDuration ,
      complete: response.value[0].complete , 
      photosDossier: response.value[0].photosDossier ,
      spaAccessible: response.value[0].spaAccessible ,
      bloquerTech: response.value[0].isDroppable , 
      techniciancomments: response.value[0].technicianComments , 
      notes: response.value[0].notes , 
      payment :!!response.value[0].paymentMethod,
      paymentMethod: response.value[0].paymentMethod ,
      missingParts: response.value[0].missingParts ,
      sPieces: response.value[0].sPieces ,
      sMo: response.value[0].sMo ,
      SousTotal: response.value[0].sousTotal ,
      tps: response.value[0].tps ,
      tvq: response.value[0].tvq ,
      grandtotal: response.value[0].grandTotal ,
      invoice: response.value[0].invoice || '' // Add invoice field
    });
    
    // Debug: Confirm invoice field is being set
    console.log('🔍 INVOICE FIELD DEBUG - Setting invoice in form:', response.value[0].invoice);
    console.log('🔍 INVOICE FIELD DEBUG - Form value after patch:', this.createTechnicianForm.get('invoice')?.value);
    
  if(response.value[0].paymentMethod > 0){
    this.showSecondCheckbox = true;
  }
  this.emilAddress = response.value[0].email;
  }
    })
  
}

// loadImage(id: number): void {
  
//   this.servicecallservice.getImageById(id).subscribe((response) => {
//         const objectURL = URL.createObjectURL(response); // Convert Blob to URL
//         this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL); // Trust the URL
//       },
//       (error) => {
//         if (error.status === 500) { 
//           this.imageUrl = null; // Set to null if image not found
//         }
//       }
//     );
// }

// loadImage(id: number): void {
//   
//   this.servicecallservice.getImageById(id).subscribe(
//     (responses: { fileData: string; contentType: string }[]) => {
//       // Convert each response to a sanitized URL
//       this.showImage = true;
//       this.imageUrls = responses.map((response) => {
//         // Create a Base64 data URL using the ContentType
//         const base64DataUrl = `data:${response.contentType};base64,${response.fileData}`;
//         // Sanitize the URL
//         return this.sanitizer.bypassSecurityTrustUrl(base64DataUrl);
//       });
//     },
//     (error) => {
//       if (error.status === 500) {
//         this.imageUrls = []; // Set to empty if no images are found
//       }
//     }
//   );
// }
loadImage(id: number): void {
  // Skip loading images if serviceCallId is invalid or 0
  if (!id || id === 0) {
    console.log('Skipping image load - invalid serviceCallId:', id);
    this.showImage = false;
    return;
  }
  
  // Old loadImage method - now replaced with Cloudinary loadImagesForServiceCall
  console.log('loadImage called - redirecting to Cloudinary image loading');
  // Images are now loaded via loadImagesForServiceCall method using Cloudinary
}

onImageClick(imageUrl: any): void {
  this.selectedImageUrl = imageUrl; // Set the clicked image URL
}

  // Old extractRelativePathFromUrl method removed - not needed with Cloudinary

  async deleteImage(imageData: {publicId: string, url: string, uploadedBy: string}, index: number): Promise<void> {
    // Get current user info
    const currentUsername = localStorage.getItem('username') || 'admin';
    const isAdmin = true; // Admin can delete all images - you can get this from your auth service
    
    // Check permissions
    if (!this.imageApiService.canDeleteImage(imageData.publicId, currentUsername, isAdmin)) {
      this.toaster.error(
        this.currentLanguage === 'fr' 
          ? 'Vous ne pouvez supprimer que vos propres images' 
          : 'You can only delete your own images'
      );
      return;
    }
    
    const confirmMessage = this.currentLanguage === 'fr' 
      ? 'Êtes-vous sûr de vouloir supprimer cette image ?'
      : 'Are you sure you want to delete this image?';
    
    if (!confirm(confirmMessage)) return;

    try {
      // Delete from Cloudinary immediately
      await this.imageApiService.deleteImage(imageData.publicId);
      
      // No storage removal needed - images deleted from Cloudinary directly
      
      // Remove from local array
      this.cloudinaryImages.splice(index, 1);
      
      // Hide image container if no images left
      this.showImage = this.cloudinaryImages.length > 0;
      
      this.toaster.success(
        this.currentLanguage === 'fr' ? 'Image supprimée avec succès!' : 'Image deleted successfully!'
      );
    } catch (error) {
      console.error('Delete failed:', error);
      this.toaster.error(
        this.currentLanguage === 'fr' ? 'Erreur lors de la suppression' : 'Failed to delete image'
      );
    }
  }

  // Load existing images for a service call
  async loadImagesForServiceCall(serviceCallNumber: string): Promise<void> {
    if (!serviceCallNumber) return;
    
    try {
      const images = await this.imageApiService.getImagesForServiceCall(serviceCallNumber);
      this.cloudinaryImages = images.map(img => ({
        publicId: img.publicId,
        url: img.thumbnailUrl,
        uploadedBy: img.uploadedBy || 'admin'
      }));
      
      this.showImage = this.cloudinaryImages.length > 0;
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  // Check if current user can delete an image
  canDeleteImage(publicId: string): boolean {
    const currentUsername = localStorage.getItem('username') || 'admin';
    const isAdmin = true; // Admin page - can delete all images
    return this.imageApiService.canDeleteImage(publicId, currentUsername, isAdmin);
  }
deleteTechnician(visitId: number) {
   this.visitId = visitId;
  const modalElement = document.getElementById('secondModal');
  if (modalElement) {
    this.secondModal.show(); // Show the modal
  }
}
confirmDelete(){
  this.isLoading = true;
  this.servicecallservice.deletevisitdetails(this.visitId).subscribe((response:any)=>{
    if(response.value.isSuccess == true)
      {
        this.isLoading = false;
        const btnSamElement = document.getElementById('closedeletemodal');
          if (btnSamElement) {
            btnSamElement.click();
          }
          this.isEditServicecall = false;
          this.gettechniciandetail();
        this.toaster.success('Success' ,'Record Deleted Successfully');
        
      }
      else{
        this.isLoading = false;
        this.toaster.error('Failer' ,'Record not Delete.');
      }
  })
}
calculateSums(): void {
  const sPieces = parseFloat(this.createTechnicianForm.get('sPieces')?.value) || 0;
  const sMo = parseFloat(this.createTechnicianForm.get('sMo')?.value) || 0;

  const sousTotal = sPieces + sMo;
  const tps = sousTotal * 0.05;
  const tvq = sousTotal * 0.09975;
  const grandTotal = sousTotal + tps + tvq;

  this.createTechnicianForm.patchValue({
    SousTotal: sousTotal.toFixed(2),
    tps: tps.toFixed(2),
    tvq: tvq.toFixed(2),
    grandtotal: grandTotal.toFixed(2)
  });
}

getEmailTemplate(id: any){
  console.log('Getting email template for ID:', id);
  this.isLoading = true;
  this.servicecallservice.GetEmailTemplateByTemplateId(id).subscribe({
    next: (response: any) => {
      console.log('Full API response:', response);
      if(response && response.isSuccess) {
        // The data is in the Value property of the Result<TValue> response
        let templateData = response.value;
        console.log('Template data from response:', templateData);
        
        // Check if the response has a Value property (Result<TValue> structure)
        if('Value' in response) {
          console.log('Found Value property (capital V):', response.Value);
          templateData = response.Value;
        }
        
        if(templateData && templateData !== null && templateData !== undefined) {
          // Handle both array and single object responses
          if(Array.isArray(templateData) && templateData.length > 0) {
            this.templateDataList = templateData;
          } else if(typeof templateData === 'object' && templateData !== null) {
            this.templateDataList = [templateData];
          } else {
            console.log('Template data is not in expected format:', templateData);
            this.isTemplateUpdate = false;
            this.isLoading = false;
            return;
          }
          
          console.log('Template data list:', this.templateDataList);
          console.log('Template data received:', this.templateDataList[0]);
          
          // Load both French and English content
          this.emailTemplateForm.patchValue({
            templateBodyFR: this.templateDataList[0].templateBodyFR || '',
            templateBodyEN: this.templateDataList[0].templateBodyEN || this.templateDataList[0].emailTemplateBody || '',
            templateSubjectFR: this.templateDataList[0].templateSubjectFR || '',
            templateSubjectEN: this.templateDataList[0].templateSubjectEN || this.templateDataList[0].emailTemplateSubject || ''
          });
          
          // Set initial content based on selected language
          if (this.selectedLanguage === 'fr') {
            this.dataEmailBody = this.templateDataList[0].templateBodyFR || '';
            this.dataEmailSubject = this.templateDataList[0].templateSubjectFR || '';
            this.emailTemplateForm.patchValue({
              emailTemplateBody: this.templateDataList[0].templateBodyFR || ''
            });
          } else {
            this.dataEmailBody = this.templateDataList[0].templateBodyEN || this.templateDataList[0].emailTemplateBody || '';
            this.dataEmailSubject = this.templateDataList[0].templateSubjectEN || this.templateDataList[0].emailTemplateSubject || '';
            this.emailTemplateForm.patchValue({
              emailTemplateBody: this.templateDataList[0].templateBodyEN || this.templateDataList[0].emailTemplateBody || ''
            });
          }
          
          // Check if template exists by looking at the masterEmailTemplateId
          const templateExists = this.templateDataList[0].masterEmailTemplateId && 
                                this.templateDataList[0].masterEmailTemplateId > 0;
          
          if(templateExists) {
            this.isTemplateUpdate = true;
            console.log('Template update mode: EDIT (template exists in database)');
          } else {
            this.isTemplateUpdate = false;
            console.log('Template update mode: ADD (no template in database)');
          }
        } else {
          console.log('No template data found in response');
          this.isTemplateUpdate = false;
        }
      } else {
        console.log('API response indicates failure');
        this.isTemplateUpdate = false;
      }
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error loading email template:', error);
      console.log('API call failed for template ID:', id);
      this.isTemplateUpdate = false;
      this.isLoading = false;
    }
  });
}

// Method to switch between French and English template editing
switchLanguage(language: string): void {
  console.log('=== SWITCHING LANGUAGES ===');
  console.log('Current language:', this.selectedLanguage);
  console.log('Switching to:', language);
  
  // Save current content to the current language before switching
  this.saveCurrentLanguageContent(this.selectedLanguage);
  
  this.selectedLanguage = language;
  
  // Force change detection to update the form control binding
  this.cdr.detectChanges();
  
  // Update the editor content based on selected language
  if (language === 'fr') {
    const frenchBody = this.emailTemplateForm.get('templateBodyFR')?.value || '';
    const frenchSubject = this.emailTemplateForm.get('templateSubjectFR')?.value || '';
    
    console.log('French content - Body:', frenchBody, 'Subject:', frenchSubject);
    
    this.dataEmailBody = frenchBody;
    this.dataEmailSubject = frenchSubject;
    this.emailTemplateForm.patchValue({
      emailTemplateBody: frenchBody
    });
    
    console.log('After switch - templateSubjectFR:', this.emailTemplateForm.get('templateSubjectFR')?.value);
  } else {
    const englishBody = this.emailTemplateForm.get('templateBodyEN')?.value || '';
    const englishSubject = this.emailTemplateForm.get('templateSubjectEN')?.value || '';
    
    console.log('English content - Body:', englishBody, 'Subject:', englishSubject);
    
    this.dataEmailBody = englishBody;
    this.dataEmailSubject = englishSubject;
    this.emailTemplateForm.patchValue({
      emailTemplateBody: englishBody
    });
    
    console.log('After switch - templateSubjectEN:', this.emailTemplateForm.get('templateSubjectEN')?.value);
  }
  console.log('=== END SWITCH ===');
}

// Method to save current editor content to the appropriate language field
saveCurrentLanguageContent(language?: string): void {
  const currentContent = this.emailTemplateForm.get('emailTemplateBody')?.value || '';
  const currentSubject = this.dataEmailSubject || '';
  
  const targetLanguage = language || this.selectedLanguage;
  
  console.log('=== SAVING CONTENT ===');
  console.log('Saving to language:', targetLanguage);
  console.log('Current content:', currentContent);
  console.log('Current subject:', currentSubject);
  
  if (targetLanguage === 'fr') {
    this.emailTemplateForm.patchValue({
      templateBodyFR: currentContent,
      templateSubjectFR: currentSubject
    });
    console.log('Saved to French fields');
  } else {
    this.emailTemplateForm.patchValue({
      templateBodyEN: currentContent,
      templateSubjectEN: currentSubject
    });
    console.log('Saved to English fields');
  }
  console.log('=== END SAVE ===');
}
onTemplateSubmit(): void{
  // Save current editor content to the appropriate language field
  this.saveCurrentLanguageContent();
  
  this.isLoading = true;
  const requestModel: any= {
    emailTemplateName: 'Service Call Template', // Add template name
    emailTemplateBody: this.emailTemplateForm.get('emailTemplateBody')?.value, // Legacy field
    templateBodyFR: this.emailTemplateForm.get('templateBodyFR')?.value,
    templateBodyEN: this.emailTemplateForm.get('templateBodyEN')?.value,
    templateSubjectFR: this.emailTemplateForm.get('templateSubjectFR')?.value,
    templateSubjectEN: this.emailTemplateForm.get('templateSubjectEN')?.value,
    masterEmailTemplateId : this.templateId
  }
  
  console.log('=== REQUEST MODEL ===');
  console.log('Request being sent to backend:', requestModel);
  console.log('Template ID:', this.templateId);
  console.log('Is Template Update:', this.isTemplateUpdate);
  console.log('=== END REQUEST ==='); 
  
  // Debug: Check if user is logged in and has a token
  console.log('=== AUTHENTICATION DEBUG ===');
  console.log('Token exists:', !!localStorage.getItem('jwtToken'));
  console.log('Token value:', localStorage.getItem('jwtToken') ? 'Present' : 'Missing');
  console.log('=== END AUTH DEBUG ===');
  
  // Try using CommonService approach which seems to work for other API calls
  this.commonservice.post('api/EmailSechedule/SaveMasterEmailTemplate', requestModel).subscribe({
    next: (Response: any) => {
      console.log('API Response:', Response);
      console.log('Response structure:', {
        hasResponse: !!Response,
        hasValue: !!Response?.value,
        isSuccess: Response?.value?.isSuccess,
        hasError: !!Response?.value?.error,
        errorMessage: Response?.value?.error?.message
      });
      
      if(Response && Response.isSuccess == true){
        if(this.isTemplateUpdate === false)
        {
          this.toaster.success('Email template created successfully.');
        }
        else{
          const btnSamElement = document.getElementById('closeEmailmodel');
            if (btnSamElement) {
              btnSamElement.click();
            }
          this.toaster.success('Email template updated successfully.');
        }
        this.isLoading = false;
      }
      else{
        const errorMessage = Response?.error?.message || 'An error occurred while saving the template';
        console.log('Error details:', {
          response: Response,
          error: Response?.error,
          errorMessage: errorMessage
        });
        this.toaster.error(errorMessage);
        this.isLoading = false;
      }
    },
    error: (error: any) => {
      console.error('API Error:', error);
      this.toaster.error('Failed to save template: ' + (error.message || 'Unknown error'));
      this.isLoading = false;
    }
  });

}
sendWorkOrder(){
  // Validate required fields
  if (!this.visitId) {
    this.toaster.error('Visit ID is required to send work order');
    return;
  }
  
  if (!this.templateId) {
    this.toaster.error('Work order template is required to send work order');
    return;
  }
  
  if (!this.emilAddress) {
    this.toaster.error('Client contact information is required to send work order');
    return;
  }

  // Always reload client details to ensure we have current client data
  console.log('🔍 Current clientId in data:', this.data[0]?.clientId);
  console.log('🔍 Expected clientId for this service call:', this.data[0]?.serviceCallId);
  console.log('🔍 Component clientId property:', this.clientId);
  console.log('🔍 All available properties in data[0]:', Object.keys(this.data[0] || {}));
  console.log('🔍 Full data[0] object at work order time:', this.data[0]);
  
  // Force reload client details to get fresh data
  if (this.data[0]?.spaId) {
    console.log('🔍 Reloading client details by spaId:', this.data[0].spaId);
    this.loadClientDetailsBySpaId(this.data[0].spaId);
    // Wait a moment for the client details to load, then proceed
    setTimeout(() => {
      console.log('🔍 Client details reloaded, clientId now:', this.data[0]?.clientId);
      console.log('🔍 Client SMS preference after reload:', this.data[0]?.sms);
      console.log('🔍 Client phone numbers after reload:', {
        home: this.data[0]?.home,
        work: this.data[0]?.work,
        spouse: this.data[0]?.spouse,
        other: this.data[0]?.other
      });
      this.sendWorkOrderEmail();
    }, 2000); // Increased timeout to ensure data is loaded
    return;
  } else {
    console.log('🔍 No spaId available, cannot reload client details');
  }
  
  this.sendWorkOrderEmail();
}

private sendWorkOrderEmail(): void {
  console.log('Sending work order with:', { visitId: this.visitId, templateId: this.templateId, email: this.emilAddress });
  
  // Get form data for template variables
  const formData = this.createServiceCallForm.value;
  const technicianData = this.createTechnicianForm.value;
  
  // Get client language preference from client profile (default to French if no preference)
  const clientLanguagePreferences = [this.data[0]?.langPref || 'fr'];
  
  console.log('App user language setting:', this.currentLanguage);
  console.log('Client language preference from profile:', this.data[0]?.langPref);
  console.log('Client language preferences being sent:', clientLanguagePreferences);
  
  // Debug SMS configuration
  console.log('🔍 SMS Configuration Debug:');
  console.log('  - Client SMS preference:', this.data[0]?.sms);
  console.log('  - SMS will be sent:', this.data[0]?.sms === true);
  console.log('  - EmailClient preference:', this.data[0]?.emailClient);
  console.log('  - Email will be sent:', this.data[0]?.emailClient === true);
  console.log('  - Mobile number for SMS:', this.getMobileNumberForSMS());
  console.log('  - Client ID loaded:', this.data[0]?.clientId);
  console.log('  - Client data loaded properly:', !!this.data[0]?.firstName);
  
  // If client data is not loaded properly, don't send SMS
  if (!this.data[0]?.clientId || !this.data[0]?.firstName) {
    console.log('⚠️ Client data not loaded properly, SMS may not work correctly');
  }
  
  // Use EmailSendService like the working admin send-email page
  const requestModel = {
    masterEmailTemplateId: this.templateId,
    masterSMSTemplateId: this.templateId, // Use the same template ID as email for work orders
    recipients: [this.emilAddress], // Email address for work order
    visitDate: formData.datePlacement || "2025-05-23", // Use actual visit date from form
    sms: [this.data[0]?.sms === true], // Only send SMS if explicitly true
    emailClient: [this.data[0]?.emailClient === true], // Only send email if explicitly true
    mobileNumber: this.getMobileNumberForSMS(), // Get proper mobile number for SMS
    clientLanguagePreferences: clientLanguagePreferences, // Include language preferences
    clientId: this.data[0]?.clientId || 0, // Include client ID for template data (use actual client ID from data)
    serviceCallId: this.data[0]?.serviceCallId, // Include service call ID for template data
    visitId: this.visitId, // Include visit ID for template data
    // Pass actual client data for template variables
    clientNumber: this.data[0]?.clientNumber || this.data[0]?.serviceCallId?.toString(),
    clientName: this.data[0]?.firstName || "N/A",
    lastName: this.data[0]?.lastName || "N/A", 
    serviceCallNumber: this.data[0]?.serviceCallNumber || this.data[0]?.serviceCallId?.toString(),
    reference: this.data[0]?.serviceCallNumber || "REF-" + (this.data[0]?.serviceCallId || "N/A"),
    problem: this.data[0]?.issueDescription || this.data[0]?.serviceCallDescription || "N/A",
    notes: this.data[0]?.comments || this.data[0]?.notes || "N/A",
    // Pass visit data for template variables - try form data first, then data[0]
    technicianName: this.getTechnicianName(this.createTechnicianForm.value.technician) || this.data[0]?.technicianName || "N/A",
    duration: this.createTechnicianForm.value.durationTime || this.data[0]?.duration || "N/A",
    isCompleted: this.createTechnicianForm.value.complete || this.data[0]?.isCompleted || false,
    isPaid: this.createTechnicianForm.value.payment || this.data[0]?.isPaid || false,
    paymentMethod: this.getPaymentMethodName(this.createTechnicianForm.value.paymentMethod) || this.data[0]?.paymentMethod || "N/A",
    visitNotes: this.createTechnicianForm.value.notes || this.data[0]?.notes || this.data[0]?.visitNotes || "N/A"
  };
  
  console.log('Client data available:', this.data[0]);
  console.log('Mobile number from client data:', this.data[0]?.streetNumber);
  console.log('firstName from client data:', this.data[0]?.firstName);
  console.log('lastName from client data:', this.data[0]?.lastName);
  console.log('clientNumber from client data:', this.data[0]?.clientNumber);
  console.log('serviceCallNumber from client data:', this.data[0]?.serviceCallNumber);
  console.log('issueDescription from client data:', this.data[0]?.issueDescription);
  console.log('comments from client data:', this.data[0]?.comments);
  console.log('Client language preference (langPref):', this.data[0]?.langPref);
  console.log('Full client data object being used:', JSON.stringify(this.data[0], null, 2));
  
  // Also check form data for visit information
  console.log('Form data - technician:', this.createTechnicianForm.value);
  console.log('Form data - service call:', this.createServiceCallForm.value);
  
  console.log('EmailSendService request model:', requestModel);
  console.log('EmailSendService request model JSON:', JSON.stringify(requestModel, null, 2));
  console.log('🔍 DEBUG: emailClient flag is set to:', requestModel.emailClient);
  console.log('🔍 DEBUG: Raw client emailClient preference:', this.data[0]?.emailClient);
  console.log('🔍 DEBUG: Raw client sms preference:', this.data[0]?.sms);
  console.log('🔍 DEBUG: All available client properties:', Object.keys(this.data[0] || {}));
  console.log('🔍 DEBUG: Client emailSend property:', this.data[0]?.emailSend);
  console.log('🔍 DEBUG: Client spaId (should trigger client loading):', this.data[0]?.spaId);
  console.log('🔍 DEBUG: Client clientId (should not be 0):', this.data[0]?.clientId);
  
  this.sendingEmailService.SendEmailConfirmation(requestModel).subscribe({
    next: (response: any) => {
      console.log('Work order send response:', response);
      if (response && (response.statusCode === 200 || response.isSuccess === true)) {
        this.toaster.success(response.message || 'Work order sent successfully');
      } else {
        this.toaster.error(response.message || 'Failed to send work order');
      }
    },
    error: (error) => {
      console.error('Error sending work order:', error);
      console.error('Error details:', {
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        message: error.message
      });
      this.toaster.error(error.error?.message || error.message || 'An error occurred while sending the work order');
    }
  });
}
updateMinToDate() {
  
  const fromDate = this.createServiceCallForm.get('dateReception')?.value;
  if (fromDate) {
    this.minToDate = fromDate; // Set min date for ToDate input
    this.createServiceCallForm.get('datePlacement')?.updateValueAndValidity(); // Trigger validation
  }
}

onHourVisitChange(): void {
  
  this.createTechnicianForm.get('hourVisit')?.valueChanges.subscribe((hourVisitValue: string) => {
    if (hourVisitValue) {
      this.minDurationTime = hourVisitValue; // Set `min` attribute for durationTime
      this.createTechnicianForm.get('durationTime')?.setValue(''); // Reset durationTime
    }
  });
}
async onFileChange(event: any): Promise<void> {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  // Get service call number for folder organization
  const serviceCallNumber = this.createServiceCallForm.get('serviceCallNumber')?.value || this.servicecallnumber || 'temp-' + Date.now();
  
  this.uploadingImage = true;
  
  try {
    for (const file of Array.from(files)) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.toaster.error(`Unsupported file type: ${file.name}`);
        continue;
      }

      // Get current username (you'll need to get this from your auth service)
      const currentUsername = localStorage.getItem('username') || 'admin'; // Replace with your auth logic
      
      // Upload to Cloudinary immediately
        const result = await this.imageApiService.uploadImage(file, serviceCallNumber, currentUsername, 'admin');
        
        // Add to display array immediately
      this.cloudinaryImages.push({
        publicId: result.publicId,
        url: result.thumbnailUrl,
        uploadedBy: 'admin'
      });
    }
    
    this.showImage = this.cloudinaryImages.length > 0;
    this.toaster.success(`${files.length} image(s) uploaded successfully!`);
    
  } catch (error) {
    console.error('Upload failed:', error);
    this.toaster.error('Failed to upload images');
  } finally {
    this.uploadingImage = false;
    event.target.value = ''; // Clear input
  }
}
getFileExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    default:
      return ''; // Unsupported type
  }
}
// Old processFile method removed - now using Cloudinary direct upload

// Method to remove the uploaded image and show the edit icon again
removeImage(): void {
  
  this.imagePreview = null;
  this.base64Image = null;
  // Cloudinary images handled separately
  
  // Reset form control if it exists
  if (this.createServiceCallForm && this.createServiceCallForm.get('images')) {
    this.createServiceCallForm.get('images')?.setValue(null);
  }
  
  // If we're also using the technician form, reset it as well
  if (this.createTechnicianForm && this.createTechnicianForm.get('images')) {
    this.createTechnicianForm.get('images')?.setValue(null);
  }
  
  return;
}

convertFileToBase64(file: File): void {
  const reader = new FileReader();

  reader.onload = () => {
    this.base64Image = reader.result as string; // Store Base64 image
    //console.log('Base64 image generated:', this.base64Image); // Debug
  };

  reader.onerror = (error) => {
    console.error('Error converting file to Base64:', error);
    this.base64Image = null;
  };

  reader.readAsDataURL(file); // Read file as Base64
}

// Helper method to identify form validation errors
getFormValidationErrors() {
  const errors: any = {};
  Object.keys(this.createServiceCallForm.controls).forEach(key => {
    const control = this.createServiceCallForm.get(key);
    if (control && control.errors) {
      errors[key] = control.errors;
    }
  });
  return errors;
}

loadClientDetails(clientId: number): void {
  console.log('Loading client details for clientId (client number):', clientId);
  // Use the same method as the service call page: GetClientDetailsByClientNumber
  this.servicecallservice.GetClientDetailsByClientNumber(clientId).subscribe({
    next: (response: any) => {
      console.log('Client details response:', response);
      console.log('Client details response.value:', response.value);
      if (response && response.isSuccess && response.value && response.value.length > 0) {
        const clientData = response.value[0]; // Access first element like service call page does
        console.log('Client data (first element):', clientData);
        console.log('Available fields in client data:', Object.keys(clientData || {}));
        
        // Update the client data with the fetched details using the same pattern
        console.log('🔍 BEFORE UPDATE - Current clientId:', this.data[0]?.clientId);
        console.log('🔍 BEFORE UPDATE - New clientId from API:', clientData.clientId);
        console.log('🔍 BEFORE UPDATE - emailClient from API:', clientData.emailClient);
        console.log('🔍 BEFORE UPDATE - sms from API:', clientData.sms);
        
        this.data[0] = {
          ...this.data[0],
          clientId: clientData.clientId,
          clientNumber: clientData.clientNumber,
          firstName: clientData.firstName,
          lastName: clientData.lastName,
          email: clientData.primaryEmail || clientData.email || this.data[0]?.email, // Use primaryEmail like service call page
          sms: clientData.sms,
          emailClient: clientData.emailClient,
          streetNumber: clientData.streetNumber || clientData.mobileNumber || clientData.phoneNumber || clientData.phone || clientData.cellPhone || clientData.mobile,
          langPref: clientData.langPref || 'fr' // Get client's language preference (default to French)
        };
        
        console.log('🔍 AFTER UPDATE - clientId:', this.data[0]?.clientId);
        console.log('🔍 AFTER UPDATE - emailClient:', this.data[0]?.emailClient);
        console.log('🔍 AFTER UPDATE - sms:', this.data[0]?.sms);
        console.log('Updated client data with details:', this.data[0]);
        console.log('Client data mapping - clientId:', clientData.clientId, 'clientNumber:', clientData.clientNumber, 'firstName:', clientData.firstName, 'lastName:', clientData.lastName);
        console.log('Mobile number sources - streetNumber:', clientData.streetNumber, 'mobileNumber:', clientData.mobileNumber, 'phoneNumber:', clientData.phoneNumber, 'phone:', clientData.phone, 'cellPhone:', clientData.cellPhone, 'mobile:', clientData.mobile);
        console.log('Full client data object for debugging:', JSON.stringify(clientData, null, 2));
      }
    },
    error: (error) => {
      console.log('Error loading client details:', error);
    }
  });
}

  loadClientDetailsByServiceCallId(): void {
    console.log('Loading client details by service call ID:', this.serviceCallId);
    
    // First, get the client ID from the service call ID using spa details
    this.servicecallservice.getspadetailsByServiceCallId(this.serviceCallId).subscribe({
      next: (spaResponse: any) => {
        console.log('Spa details response from service call ID:', spaResponse);
        
        if (spaResponse && spaResponse.isSuccess && spaResponse.value && spaResponse.value.length > 0) {
          const spaData = spaResponse.value[0];
          console.log('Spa data from service call ID:', spaData);
          console.log('Available fields in spa data:', Object.keys(spaData || {}));
          
          // Extract client ID from spa data (it should be in the Id field)
          const clientId = spaData.Id;
          console.log('Extracted client ID from spa data:', clientId);
          
          if (clientId) {
            // Now get full client details using the client service
            this.clientService.getClientById(clientId).subscribe({
              next: (clientResponse: any) => {
                console.log('Full client details response:', clientResponse);
                console.log('Client response isSuccess:', clientResponse?.isSuccess);
                console.log('Client response value:', clientResponse?.value);
                
                if (clientResponse && clientResponse.isSuccess && clientResponse.value && clientResponse.value.length > 0) {
                  const clientData = clientResponse.value[0];
                  console.log('Full client data:', clientData);
                  console.log('Available fields in client data:', Object.keys(clientData || {}));
                  
                  // Update the client data with the fetched details
                  console.log('🔍 BEFORE UPDATE - Current clientId:', this.data[0]?.clientId);
                  console.log('🔍 BEFORE UPDATE - New clientId from API:', clientData.clientId);
                  console.log('🔍 BEFORE UPDATE - firstName from API:', clientData.firstName);
                  console.log('🔍 BEFORE UPDATE - lastName from API:', clientData.lastName);
                  console.log('🔍 BEFORE UPDATE - emailClient from API:', clientData.emailClient);
                  console.log('🔍 BEFORE UPDATE - sms from API:', clientData.sms);
                  
                  this.data[0] = {
                    ...this.data[0],
                    clientId: clientData.clientId || clientData.idClient,
                    clientNumber: clientData.clientNumber || clientData.numClient,
                    firstName: clientData.firstName,
                    lastName: clientData.lastName,
                    email: clientData.primaryEmail || clientData.email || this.data[0]?.email,
                    sms: clientData.sms,
                    emailClient: clientData.emailClient,
                    streetNumber: clientData.streetNumber || clientData.mobileNumber || clientData.phoneNumber || clientData.phone || clientData.cellPhone || clientData.mobile,
                    langPref: clientData.langPref || 'fr'
                  };
                  
                  console.log('🔍 AFTER UPDATE - clientId:', this.data[0]?.clientId);
                  console.log('🔍 AFTER UPDATE - firstName:', this.data[0]?.firstName);
                  console.log('🔍 AFTER UPDATE - lastName:', this.data[0]?.lastName);
                  console.log('🔍 AFTER UPDATE - emailClient:', this.data[0]?.emailClient);
                  console.log('🔍 AFTER UPDATE - sms:', this.data[0]?.sms);
                  console.log('Updated client data with full details:', this.data[0]);
                } else {
                  console.log('No full client data found for client ID:', clientId);
                }
              },
              error: (clientError) => {
                console.log('Error loading full client details:', clientError);
              }
            });
          } else {
            console.log('No client ID found in spa data');
          }
        } else {
          console.log('No spa data found for service call ID:', this.serviceCallId);
        }
      },
      error: (spaError) => {
        console.log('Error loading spa details by service call ID:', spaError);
      }
    });
  }

  getTechnicianName(technicianId: any): string {
    if (!technicianId) return "N/A";
    const technician = this.techniciannamelist.find((t: any) => t.technicianId === technicianId);
    return technician ? technician.technicianName : "N/A";
  }

  getPaymentMethodName(paymentMethodId: any): string {
    if (!paymentMethodId) return "N/A";
    const paymentMethod = this.paymentMethodlist.find((p: any) => p.paymentMethodId === paymentMethodId);
    return paymentMethod ? paymentMethod.paymentMethodName : "N/A";
  }

  getMobileNumberForSMS(): string[] {
    // Try to get mobile number from various phone fields in order of preference
    const clientData = this.data[0];
    if (!clientData) return [];

    // Check different phone number fields in order of preference
    // streetNumber is the primary phone field based on console logs
    const mobileNumber = clientData.streetNumber || clientData.StreetNumber ||
                        clientData.home || clientData.Home || 
                        clientData.work || clientData.Work || 
                        clientData.spouse || clientData.Spouse || 
                        clientData.other || clientData.Other;

    console.log('🔍 SMS Mobile Number Check:');
    console.log('  - streetNumber:', clientData.streetNumber || clientData.StreetNumber);
    console.log('  - home:', clientData.home || clientData.Home);
    console.log('  - work:', clientData.work || clientData.Work);
    console.log('  - spouse:', clientData.spouse || clientData.Spouse);
    console.log('  - other:', clientData.other || clientData.Other);
    console.log('  - Selected mobile number:', mobileNumber);

    return mobileNumber ? [mobileNumber] : [];
  }

  loadClientDetailsBySpaId(spaId: number): void {
    console.log('Loading client details by spaId:', spaId);
    console.log('Current data[0] before loading client details:', this.data[0]);
    
    // Try to get client data from the parent service call page form
    // The parent component should have the client form filled when a client is selected
    console.log('🔍 Trying to get client data from parent service call page');
    
    // Check if we can access the parent component's client data
    // The clientId should be available from the parent component
    if (this.clientId && this.clientId > 0) {
      console.log('🔍 Found clientId from parent component:', this.clientId);
      
      // Use the existing loadClientDetails method that works
      this.loadClientDetails(this.clientId);
    } else {
      console.log('🔍 No clientId from parent, checking if client data is in input');
      
      // Check if client data was passed through the data input
      if (this.data && this.data[0] && this.data[0].clientId && this.data[0].clientId > 0) {
        console.log('🔍 Found clientId in input data:', this.data[0].clientId);
        this.loadClientDetails(this.data[0].clientId);
      } else {
        console.log('❌ No client data available - client must be selected first');
      }
    }
  }

  private fallbackToSpaMapping(): void {
    console.log('🔍 No client data available - this should not happen in normal operation');
    console.log('🔍 Please ensure a client is selected before creating/editing service calls');
    console.log('❌ Cannot send work order notifications without client data');
  }

  private loadFullClientDetails(clientId: number): void {
    console.log('🔍 Loading full client details for client ID:', clientId);
    
    // Use the existing client service to get real client data
    console.log('🔍 Using client service to get real client data for ID:', clientId);
    
    this.clientService.getClientById(clientId).subscribe({
      next: (response: any) => {
        console.log('🔍 Client service response:', response);
        
        if (response && response.isSuccess && response.value && response.value.length > 0) {
          const clientData = response.value[0];
          console.log('🔍 Client data from service:', clientData);
          console.log('🔍 Available fields:', Object.keys(clientData || {}));
          
          // Update the client data with the fetched details
          this.data[0] = {
            ...this.data[0],
            clientId: clientData.clientId || clientData.idClient || clientId,
            clientNumber: clientData.clientNumber || clientData.numClient,
            firstName: clientData.firstName,
            lastName: clientData.lastName,
            email: clientData.primaryEmail || clientData.email || this.data[0]?.email,
            sms: clientData.sms,
            emailClient: clientData.emailClient,
            streetNumber: clientData.streetNumber,
            langPref: clientData.langPref || 'fr',
            // Map all phone fields for SMS
            home: clientData.home,
            work: clientData.work,
            spouse: clientData.spouse,
            other: clientData.other
          };
          
          console.log('✅ Client data updated from service:', this.data[0]);
        } else {
          console.log('❌ No client data returned from service');
        }
      },
      error: (error) => {
        console.log('❌ Error loading client data from service:', error);
      }
    });
  }

loadVisitDetails(visitId: number): void {
  console.log('Loading visit details for visitId:', visitId);
  this.servicecallservice.getTechnicianDeteilByid(visitId).subscribe({
    next: (response: any) => {
      console.log('Visit details response:', response);
      console.log('Visit details response.value:', response.value);
      console.log('Available fields in visit response:', Object.keys(response.value || {}));
      if (response && response.value && response.value.length > 0) {
        const visitData = response.value[0]; // Get the first element from the array
        console.log('Visit data (first element):', visitData);
        console.log('Available fields in visit data:', Object.keys(visitData || {}));
        console.log('Full visit data object:', JSON.stringify(visitData, null, 2));
        
        // Update the data with visit details (technician info, duration, etc.)
        this.data[0] = {
          ...this.data[0],
          technicianName: visitData.technicianName,
          visitDate: visitData.dateOfVisit, // Use dateOfVisit from DTO
          visitingTime: visitData.hourVisit, // Use hourVisit from DTO
          duration: visitData.durationTime || visitData.nextVisitDuration, // Use durationTime from DTO
          isCompleted: visitData.complete, // Use complete from DTO
          isPaid: visitData.paymentMethod !== undefined && visitData.paymentMethod !== null, // Check if paymentMethod exists
          paymentMethod: visitData.paymentMethod,
          nextVisitDuration: visitData.nextVisitDuration,
          missingParts: visitData.missingParts,
          notes: visitData.notes || this.data[0]?.notes,
          // Also try to get client info from visit if available
          clientId: visitData.clientId || this.data[0]?.clientId,
          clientNumber: visitData.clientNumber || this.data[0]?.clientNumber,
          firstName: visitData.firstName || this.data[0]?.firstName,
          lastName: visitData.lastName || this.data[0]?.lastName,
          email: visitData.email || this.data[0]?.email,
          sms: visitData.sms || this.data[0]?.sms,
          emailClient: visitData.emailClient || this.data[0]?.emailClient,
          streetNumber: visitData.streetNumber || visitData.mobileNumber || this.data[0]?.streetNumber,
          langPref: visitData.langPref || this.data[0]?.langPref || 'fr' // Get client's language preference (default to French)
        };
        console.log('Updated data with visit details:', this.data[0]);
        console.log('Visit data mapping - technicianName:', visitData.technicianName, 'duration:', visitData.durationTime || visitData.nextVisitDuration, 'isCompleted:', visitData.complete, 'isPaid:', visitData.paymentMethod !== undefined && visitData.paymentMethod !== null);
        console.log('Visit data mapping - paymentMethod:', visitData.paymentMethod, 'visitingTime:', visitData.hourVisit, 'nextVisitDuration:', visitData.nextVisitDuration);
        console.log('Client info from visit - firstName:', visitData.firstName, 'lastName:', visitData.lastName, 'clientNumber:', visitData.clientNumber, 'mobile:', visitData.streetNumber || visitData.mobileNumber);
        console.log('Full visit data object for debugging:', JSON.stringify(visitData, null, 2));
        console.log('All available fields in visit data:', Object.keys(visitData || {}));
      }
    },
    error: (error) => {
      console.log('Error loading visit details:', error);
    }
  });
}
}