import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../../../core/services/common.service';
import { ServiceCallService } from '../service-call.service';
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
  //isservicecalleditdata=false;
  currentDate: any;
  templateDataList: any[]=[];
  dataEmailBody: string = '';
  editor = ClassicEditor;
  public configEmailBody = {
    toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
  
}
  templateId: number = 11;
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
  base64Images: string[] = [];
  selectedImageUrl: any;
  language: any;
  currentLanguage: string = 'en'; // Default language
  private subscription: Subscription = new Subscription();
  uploadImages = false;
  showImage = false;

constructor(
    private servicecallservice : ServiceCallService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private router: Router,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer,
    private commonservice : CommonService
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
  
  // Always enable image uploads
  this.uploadImages = true;
  
  // Initialize base64Images array
  this.base64Images = [];
  
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
    technician: [{ value: '6', disabled: this.isDisabled }],
    dateVisit: [{ value: this.currentDate, disabled: this.isDisabled }],
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
      emailTemplateBody:['']
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
    window.scrollTo(0, 500);
  this.servicecallservice.getservicecallbyid(this.serviceCallId).subscribe((response:any)=>{
  if(response){
    this.uploadImages = true;
    this.imageUrls=[];
    this.loadImage(this.serviceCallId);
  this.gettechniciandetail();
  this.servicecallnumber= response.value.serviceCallNumber;
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
    this.isEditServicecall=false;
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
this.poolspecialist = response.value;
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
    requestModel1.durationTime = this.formatTimeSpan(requestModel1.durationTime);
}
if(this.createServiceCallForm.valid){
  console.log('Form is valid. Processing submission...');
  this.isLoading = true;
  setTimeout(() => {
        if(this.serviceCallId >0){
          console.log('Updating existing service call with images count:', this.base64Images.length);
          requestModel.serviceCallId = this.serviceCallId;
          
          // Make sure images are included in the request
          requestModel.images = this.base64Images.length > 0 ? this.base64Images : [];
          console.log('Request prepared with images');
          
          this.servicecallservice.updateServiceCall(requestModel).subscribe(
            (Response: any) => {
              console.log('Service call update response:', Response);
              // Reset the base64Images array after submission
              this.base64Images = [];
              if(this.visitId > 0){
                requestModel1.VisitId = this.visitId;
                requestModel1.status = requestModel.status;
                if(requestModel1.isClosed == true){
                  requestModel1.EmailTemplateId = 17;
                }
                this.servicecallservice.updatetechniciandetail(requestModel1).subscribe((response:any)=>{
                  if(Response.isSuccess == true)
                  {
                    
                    this.base64Images = ['']
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
                    this.addnewvisit = '';
                    this.base64Images=['']
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
          console.log('Creating new service call with images count:', this.base64Images.length);
          requestModel.clientId = this.clientId;
          
          // Make sure images are included when creating a new service call too
          requestModel.images = this.base64Images.length > 0 ? this.base64Images : [];
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
                    this.base64Images=['']
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
                    this.addnewvisit = '';
                    this.base64Images=['']
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
  if (!time) {
    // Handle the case where 'time' is null, undefined, or empty
    console.error('Invalid time input:', time);
    return '00:00'; // Return a default value, or handle it based on your requirements
  }

  const [hours, minutes] = time.split(':');
  
  // Handle invalid time format (e.g., missing ':' or invalid hours/minutes)
  if (!hours || !minutes) {
    console.error('Invalid time format:', time);
    return '00:00'; // Return a default value, or handle it based on your requirements
  }

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}
gettechniciandetail(){

  this.servicecallservice.getTechnicianDetails(this.serviceCallId).subscribe((response:any)=>{
    if(response)
      //this.isEditServicecall=true;
      this.datasource = response.value;
      //this.visitId = response.value.visitId;

  }) 
  // this.datasource = []
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
    });
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
  ;
  this.servicecallservice.getImageById(id).subscribe(
    (responses: { fileData: string; contentType: string }[]) => {
      if(responses == null)
      {
        this.showImage = false;
      }
      this.showImage = true; // Ensure the image container is visible
      this.imageUrls = []; // Clear previous images

      const processImage = (index: number) => {
        if (index >= responses.length) {
          return; // Stop when all images are processed
        }

        // Get the current response and create a Base64 data URL
        const response = responses[index];
        const base64DataUrl = `data:${response.contentType};base64,${response.fileData}`;

        // Sanitize the URL
        const sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(base64DataUrl);

        // Show the sanitized URL
        this.imageUrls.push(sanitizedUrl);

        // Use setTimeout to simulate sequential loading
        setTimeout(() => processImage(index + 1), 1000); // Adjust delay as needed
      };

      // Start processing the first image
      processImage(0);
    },
    (error) => {
      if (error.status === 500) {
        this.imageUrls = []; // Clear images if no images are found
      }
    }
  );
}

onImageClick(imageUrl: any): void {
  this.selectedImageUrl = imageUrl; // Set the clicked image URL
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
  
  this.isLoading = true;
  this.servicecallservice.GetEmailTemplateByTemplateId(id).subscribe((response:any)=>{
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
onTemplateSubmit(): void{
  
  this.isLoading = true;
  const requestModel: any= {
    emailTemplateBody:  this.emailTemplateForm.get('emailTemplateBody')?.value,
    masterEmailTemplateId : this.templateId
  } 
  
  this.servicecallservice.AddUpdateEmailTemplate(requestModel).subscribe((Response: any ) =>{
    if(Response.value.isSuccess == true){
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
      this.toaster.error(Response.value.error.message);
      this.isLoading = false;
    }
  });

}
sendmail(){
  const rqstmodel : any ={
  visitId : this.visitId,
  emailTemplateId : this.templateId
  }
  this.servicecallservice.sendMail(rqstmodel).subscribe((response : any)=>{
if(response.isSuccess == true){

}
  })
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
onFileChange(event: any): void {
  
  const files: FileList = event.target.files; // Get the list of files
  if (files && files.length > 0) {
    // Clear previous selections
    this.imagePreview = null;
    
    this.selectedFiles = Array.from(files); // Convert FileList to an array

    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

    // Validate each file's type
    for (const file of this.selectedFiles) {
      const fileType = file.type || this.getFileExtension(file.name);
      if (!allowedTypes.includes(fileType)) {
        alert(`Unsupported file type: ${file.name}. Please upload JPEG, PNG, or HEIC images.`);
        return; // Stop further processing
      }
    }

    // Process each valid file
    this.selectedFiles.forEach(file => {
      this.processFile(file);
    });
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
processFile(file: File): void {
  console.log('Processing file:', file.name, 'type:', file.type);
  const reader = new FileReader();

  reader.onload = () => {
    const base64String = reader.result as string;
    this.base64Images.push(base64String); // Store each Base64 string
    console.log('Image processed successfully. Total images:', this.base64Images.length);
    this.imagePreview = base64String;    // Optional: Display image preview
  };

  reader.onerror = (error) => {
    console.error('Error reading file:', error);
  };

  reader.readAsDataURL(file);
}

// Method to remove the uploaded image and show the edit icon again
removeImage(): void {
  
  this.imagePreview = null;
  this.base64Image = null;
  this.base64Images = [];  // Clear the array of base64 images
  
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
}