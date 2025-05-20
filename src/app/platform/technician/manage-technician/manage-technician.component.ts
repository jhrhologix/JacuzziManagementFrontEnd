
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TechnicianService } from '../technician.service';
import { SpaDetailsComponent } from "../spa-details/spa-details.component";
import { ClientDetailsComponent } from "../client-details/client-details.component";
import { CommonService } from '../../../core/services/common.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import heic2any from 'heic2any';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ServiceCallService } from '../../admin/service-call/service-call.service';

@Component({
  selector: 'app-manage-technician',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatPaginatorModule, ReactiveFormsModule, SpaDetailsComponent, ClientDetailsComponent,TranslateModule],
  templateUrl: './manage-technician.component.html',
  styleUrl: './manage-technician.component.scss',
  providers: [DatePipe]
})
export class ManageTechnicianComponent implements OnInit {

  changeStatus: Array<{ id: number; name: string,value : string }> = [];
//  paymentMethods: Array<{ id: number; name: string }> = [];

paymentMethods: any[]= [];
dataSourceService: any[] = [];
  visitForm!: FormGroup;
  completePaymentForm!: FormGroup;
  serviceCallForm!: FormGroup;
  adminToken: any;
  visitId : number=0;
  clientId: number=0;
  spaId: number=0;
  technicianId: number=0;
  technicianName: string='';
  serviceCallId: number=0;
  technicianData:any=[]
  isCheckboxChecked = false;
  isPaymentChange = false;
  dateVisitFormatted: any;
  imagePreview: string | ArrayBuffer | null = null;
  base64Image: string | null = null;  // To store the Base64 image
  isLoading = false;
  email: any;
  templateId: number = 13;
  imageUrl: SafeUrl | null = null;
  imageUrls: SafeUrl[] = [];
  selectedFiles: File[] = [];
  base64Images: string[] = [];
  selectedImageUrl: any;
  language: any;
  currentLanguage: string = 'en'; // Default language
  private subscription: Subscription = new Subscription();
  placementdate: any;
  receptionDate: any;
  poolSpecialist_id: any;
  serviceCallStatus_id: any;
  issueClass_id: any;

  onCompleteClick(event: Event) {
    
   
    this.isCheckboxChecked = (event.target as HTMLInputElement).checked;
  }
  onPaymentChange(event: Event) {
    this.isPaymentChange = (event.target as HTMLInputElement).checked;
  }
  constructor (
    private route : ActivatedRoute,
    private commonservice: CommonService,
    private technicianService: TechnicianService,
    private fb: FormBuilder,
    private toaster: ToastrService,
    private datePipe: DatePipe, 
     private sanitizer: DomSanitizer,
     private router: Router,
     private servicecallservice : ServiceCallService,
  ) {

  }

  onPageChange(): void {
    this.isLoading = true;

    // Simulate loading data or call adminDetails() here if needed.
    setTimeout(() => {
      this.loadTechnicianDetails();  // Fetch new data as per the paginator page
      this.isLoading = false;  // Hide loader after data is loaded
    }, 300); // Adjust delay as needed
  }

  validatePositiveNumbers(event: any) {
    const inputValue = event.target.value;
  
    // Check if the input is a number and greater than zero
    if (isNaN(inputValue) || inputValue <= 0 || /[^0-9.]/.test(inputValue)) {
      event.target.value = ''; // Clear the input or set a custom error message
      console.log('Invalid input: Must be a positive number greater than 0');
    }
  }
  


  ngOnInit(): void {
    this.subscription = this.commonservice.languageChange$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
    this.queryPrms();
    this.loadStatus();
    this.loadTechnicianDetails();
    this.loadTechnicianServiceCalls();
    this.fetchPaymentMethods();
    this.loadServiceCallHistory();
    this.getClientDetailByVisitId();
    
    this.visitForm = this.fb.group({
      technician: new FormControl({ value: '', disabled: true }),
      dateOfVisit: new FormControl({ value: '', disabled: true }),
      timeFrom: new FormControl(''),
      timeTo: new FormControl(''),
      serviceRequester: new FormControl({ value: '', disabled: true }),
      completed: new FormControl(false),
      paid: new FormControl(false),
      status: new FormControl(''),
      durationNextVisit: new FormControl(''),
      pendingParts: new FormControl(''),
      notes: new FormControl(''),
      comments: new FormControl(''),
      paymentMethod: new FormControl(''),
      images:new FormControl(),
      invoice:new FormControl()
    });

    this.completePaymentForm = this.fb.group({
      sPieces: new FormControl(''),
      sMo: new FormControl(''),
      sousTotal: new FormControl(''),
      tps: new FormControl(''),
      tvq: new FormControl(''),
      grandTotal: new FormControl() 
    });

    this.serviceCallForm = this.fb.group({
      serviceCallNumber: [''],
      dateReception: [''],
      datePlacement: [''],
      poolSpecialist: [''],
      issueProblem: [''],
      status: [''],
      description: [''],
      notes: [''],
      comments: [''],
      paymentMode:[''],
      images:['']
    });
    


  //  this.loadStatus();
  //   this.loadTechnicianDetails();
  }
  queryPrms() {
    this.route.queryParams.subscribe(params => {
      this.convertToken(params['id']);
    })
  }
  convertToken(token: any) {
    
    this.adminToken = this.commonservice.decrypt(token);
    this.adminToken = this.adminToken.split('$'); // Assuming there's more than one part
    const visitIdString = this.adminToken[0]; // Adjust index if needed
    const parsedVisitId = JSON.parse(visitIdString);
    this.visitId = parsedVisitId.visitId;
  
    var parsedTechnicianId = sessionStorage.getItem('technicianId');
    if (parsedTechnicianId !== null) {
      
      this.technicianId = parseInt(parsedTechnicianId);
    } 
    var parsedTechnicianName = sessionStorage.getItem('technicianName');
    if (parsedTechnicianName !== null) {
      
      this.technicianName= parsedTechnicianName;
    } 
    var parsedClientId = sessionStorage.getItem('clientId');
    if (parsedClientId !== null) {
      
      this.clientId = parseInt(parsedClientId);
    } 
    var parsedSpaId = sessionStorage.getItem('spaId');
    if (parsedSpaId !== null) {
      
      this.spaId = parseInt(parsedSpaId);
    } 
   
    var parsedServiceCallId = sessionStorage.getItem('serviceCallId');
    if (parsedServiceCallId !== null) {
      
      this.serviceCallId = parseInt(parsedServiceCallId);
    } 
  }

  pageSizeOptions: number[] = [5, 10, 20];

  @ViewChild(MatPaginator) paginator!: MatPaginator;



  loadStatus(): void {
    this.isLoading = true;
    this.technicianService.getParticularServiceCallStatus().subscribe(
      (response) => {
        this.isLoading = false;
        if(response.statusCode == 200)
        this.changeStatus = response.data;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching status', error);
      }
    );
  }


  convertToDateFormat(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }
  extractTime(datetimeString: string): string {
    if (!datetimeString) return '';
  
    const date = new Date(datetimeString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }
  convertMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
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


  
  
  loadTechnicianDetails(): void {
    
    this.isLoading = true;
    const  id = this.visitId;
    
    this.technicianService.getAllTechnicianDetailTechnicianPageByID(id).subscribe(
      (response:any) => {
        if ( response.value !==null && response.isSuccess === true) {
          this.isLoading = false;
          this.technicianData = response.value[0];
          if(this.technicianData.paymentMethod >0 ){
            this.isPaymentChange = true;
           
          }
          this.technicianName = this.technicianData.technicianName
          this.visitForm.patchValue({
            technician: this.technicianData.technicianName,
            dateOfVisit: this.formatServicecallDate(this.technicianData.dateOfVisit),
            timeFrom:this.technicianData.dateVisit,
            timeTo:this.technicianData.hourVisit,
            durationNextVisit: this.technicianData.nextVisitDuration,
            completed: this.technicianData.complete,
            paymentMode:!this.technicianData.paymentMethod,
            paymentMethod: this.technicianData.paymentMethod == null ||this.technicianData.paymentMethod == '' ? '':this.technicianData.paymentMethod,
            pendingParts: this.technicianData.missingParts,
            notes: this.technicianData.notes,
            comments: this.technicianData.technicianComments,
            serviceRequester: this.technicianData.poolSpecialist_name,
            status: this.technicianData.status,
            invoice:this.technicianData.invoice
            
          });
          if(this.visitForm.get('paymentMethod')?.value>0){
            this.isPaymentChange = true;
          }
          else{
            this.isPaymentChange = false;

          }
          if(this.technicianData.complete == true||this.technicianData.sPieces!=null){
            this.completePaymentForm.patchValue({
              sPieces: this.technicianData.sPieces,
              sMo: this.technicianData.sMo,
              sousTotal: this.technicianData.sousTotal,
              tps: this.technicianData.tps,
              tvq: this.technicianData.tvq,
              grandTotal: this.technicianData.grandTotal
            })
            this.isCheckboxChecked = true;
          }
          
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching technician details', error);
      }
    );
  }


  formatDate(dateString: string): string {
  
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Returns 'YYYY-MM-DD'
  }


  calculateSums(): void {
    const sPieces = parseFloat(this.completePaymentForm.get('sPieces')?.value) || 0;
    const sMo = parseFloat(this.completePaymentForm.get('sMo')?.value) || 0;

    const sousTotal = sPieces + sMo;
    const tps = sousTotal * 0.05;
    const tvq = sousTotal * 0.09975;
    const grandTotal = sousTotal + tps + tvq;

    this.completePaymentForm.patchValue({
      sousTotal: sousTotal.toFixed(2),
      tps: tps.toFixed(2),
      tvq: tvq.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    });
  }
  


  saveVisitForm(): void {
    
    this.isLoading = true;
    if (this.visitForm.valid) {
      const model = {
        idVisit: this.visitId,
        ...this.visitForm.value,

        startDate: this.formatTimeSpan(this.visitForm.get('timeFrom')?.value),
        endDate: this.formatTimeSpan(this.visitForm.get('timeTo')?.value),

        nextVisitDuration: this.visitForm.get('durationNextVisit')?.value,
        completed: this.visitForm.get('completed')?.value ,
        status: this.visitForm.get('status')?.value,
        neededParts: this.visitForm.get('pendingParts')?.value ,
        notes: this.visitForm.get('notes')?.value ,
        comments: this.visitForm.get('comments')?.value,
        paymentMethodId: this.visitForm.get('paymentMethod')?.value,
        montantPieces: this.completePaymentForm.get('sPieces')?.value ,
        montantMO: this.completePaymentForm.get('sMo')?.value ,
        sousTotal: this.completePaymentForm.get('sousTotal')?.value ,
        tps: this.completePaymentForm.get('tps')?.value,
        tvq: this.completePaymentForm.get('tvq')?.value,
        total: this.completePaymentForm.get('grandTotal')?.value,
        visitDate : this.visitForm.get('dateOfVisit')?.value ,
        invoice:this.visitForm.get('invoice')?.value
        //images : this.visitForm.get('images')?.value ,
      };
      model.technicianName = this.technicianName;
      model.serviceCallId = this.serviceCallId;
      Object.keys(model).forEach((key) => {
        if (key === 'paymentMethodId') {
          const value = model[key];
          model[key] = value === '' ? null : parseInt(value, 10);
        }
        if (model[key] === "") {
          model[key] = null;
        } 
      });
      this.technicianService.updateTechnicainVisitDetails(model).subscribe(
        (response: any) => {
          if (response.statusCode == 200) {
            this.isLoading = false;
            this.loadTechnicianDetails();
            this.removeImage();
            this.toaster.success('Visit details updated successfully', 'Success');
          } else {
            this.isLoading = false;
            this.toaster.error('Failed to update visit details', 'Error');
          }
        },
        (error) => {
          this.isLoading = false;
          this.toaster.error('Error updating visit details', 'Error');
        }
      );
    } 
  }
  



loadTechnicianServiceCalls(): void{
  
  this.technicianService.getServiceCallDetailsForTechnician(this.serviceCallId).subscribe(
    (response: any) => {
      if (response.data) {
        this.loadImage(this.serviceCallId);
        this.placementdate = response.data.placementDate;
        this.receptionDate = response.data.placementDate;
        this.poolSpecialist_id = response.data.poolSpecialist_id
        this.serviceCallStatus_id = response.data.serviceCallStatus_id
        this.issueClass_id = response.data.issueClass_id
        const receptionDate = this.formatServicecallDate(response.data.receptionDate);
        const placementDate = this.formatServicecallDate(response.data.placementDate);

        this.serviceCallForm.patchValue({
          serviceCallNumber: response.data.numServiceCall,
          dateReception: receptionDate,
          datePlacement:placementDate,
          poolSpecialist: response.data.poolSpecialist,
          issueProblem: response.data.issue,
          status: response.data.serviceCallStatus,
          description: response.data.issueDescription,
          notes: response.data.notes,
          comments: response.data.comments
        });
      }
    },
    error => {
      console.error('Error fetching service call details', error);
    }
  );
}
formatServicecallDate(dateString: string): string {
  if (!dateString) return ''; // Ensure the date string is valid
  const date = new Date(dateString); // Parse the ISO date string
  const day = String(date.getDate()).padStart(2, '0'); // Get the day and pad with zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-based, so +1)
  const year = date.getFullYear(); // Get the full year

  // Return the formatted date in `dd-MM-yyyy` format
  return `${day}-${month}-${year}`;
}

saveTechnicianService():void{
  
  if (this.serviceCallForm.valid) {
    const requestModel: any = this.serviceCallForm.value;
    requestModel.images = this.base64Images,
    requestModel.serviceCallId = this.serviceCallId
    requestModel.dateReception = this.receptionDate
    requestModel.datePlacement = this.placementdate
    
    requestModel.poolSpecialist = this.poolSpecialist_id.toString();
    requestModel.status = this.serviceCallStatus_id.toString();
    requestModel.issueProblem = this.issueClass_id.toString();
    this.servicecallservice.updateServiceCall(requestModel).subscribe(( Response: any ) =>{
      this.base64Images = ['']
      this.removeImage();
      this.loadTechnicianServiceCalls();
      this.isLoading = false;

      this.toaster.success('Record Updated Successfully');
    })
  }
  }


fetchPaymentMethods(): void {
  
  this.technicianService.getPaymentMethods().subscribe(
    (response: any) => {
      if (response.statusCode == 200) {
        this.paymentMethods = response.data; 
      } else {
        console.error('Failed to fetch payment methods');
      }
    },
  );
}



loadServiceCallHistory(): void {
  const  id = this.visitId;
  this.technicianService.getServiceCallHistory(id).subscribe(
    (response: any) => {
      if (response.statusCode == 200 && response.data != null) {
         this.dataSourceService = response.data.map((item: any) => ({
          date: item.visitDate,
          status: item.serviceCallStatus,
          issue: item.issueLabel,
          technician: item.technicianName,
          servicecallId:item.serviceCallId
        }));
      }
    },

  );
}


onFileChange(event: any): void {
  
  const files: FileList = event.target.files; // Get the list of files
  if (files && files.length > 0) {
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
  const reader = new FileReader();

  reader.onload = () => {
    const base64String = reader.result as string;
    this.base64Images.push(base64String); // Store each Base64 string
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
  this.visitForm.patchValue({ images: null });
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
getClientDetailByVisitId(): void {
  
  if (this.visitId > 0) {
    this.technicianService.getClientDetailForTechincian(this.visitId).subscribe((response: any) => {
    if(response){
      this.email = response.value[0].email;
    }
    })
      

}
}
sendMail(){
  
  const requestModel: any= {
    email:this.email,
    masterEmailTemplateId : this.templateId
  } 
  this.technicianService.sendMail(requestModel).subscribe((response: any) => {
    if(response){
      this.toaster.success('Success' ,'Notification sent Successfully');
    }
    })
}

loadImage(id: number): void {
  
  this.technicianService.getImageById(id).subscribe(
    (responses: { fileData: string; contentType: string }[]) => {
      // Convert each response to a sanitized URL
      this.imageUrls = responses.map((response) => {
        // Create a Base64 data URL using the ContentType
        const base64DataUrl = `data:${response.contentType};base64,${response.fileData}`;
        // Sanitize the URL
        return this.sanitizer.bypassSecurityTrustUrl(base64DataUrl);
      });
    },
    (error) => {
      if (error.status === 500) {
        this.imageUrls = []; // Set to empty if no images are found
      }
    }
  );
}
onImageClick(imageUrl: any): void {
  this.selectedImageUrl = imageUrl; // Set the clicked image URL
}
showServicecall(element:any){
  
  const queryParams = {
    serviceCallId:element.servicecallId

  };
  const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
  );
  const baseUrl = `${window.location.origin}/#/` // Get the base URL of your app
  const newUrl = this.router.serializeUrl(
    this.router.createUrlTree(['/web/technician/servicecall-history'], {
      queryParams: { id: encryptedParams },
    })
  );

  // Open the full URL in a new tab
  window.open(`${baseUrl}${newUrl}`, '_blank');
}
}







