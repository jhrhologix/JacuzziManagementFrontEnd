import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TechnicianService } from '../technician.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ServiceCallService } from '../../admin/service-call/service-call.service';

@Component({
  selector: 'app-technician-servicecall-history',
  standalone: true,
  imports: [TranslateModule,
    ReactiveFormsModule,
    CommonModule,
    MatTableModule,
    MatCheckboxModule],
  templateUrl: './technician-servicecall-history.component.html',
  styleUrl: './technician-servicecall-history.component.scss'
})
export class TechnicianServicecallHistoryComponent {
serviceCallForm!: FormGroup;
serviceCallId: number=0;
imageUrls: SafeUrl[] = [];
selectedFiles: File[] = [];
selectedImageUrl: any;
adminToken: any;
datasource: any[]=[];;


constructor (
  private fb: FormBuilder,
  private technicianService: TechnicianService,
  private sanitizer: DomSanitizer,
  private route : ActivatedRoute,
  private commonservice: CommonService,
  private servicecallservice : ServiceCallService
){

}
ngOnInit(): void {
  this.queryPrms();
  this.loadTechnicianServiceCalls();
  this.gettechniciandetail();
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
}
displayedColumns: string[] = [
  'Technician',
  'Date',
  'Hours',
  'Duration',
  'paid'
];
queryPrms() {
  this.route.queryParams.subscribe(params => {
    this.convertToken(params['id']);
  })
}
convertToken(token: any) {
  try {
    console.log('Received token:', token);
    this.adminToken = this.commonservice.decrypt(token);
    console.log('Decrypted token:', this.adminToken);
    const parsedData = JSON.parse(this.adminToken);
    console.log('Parsed data:', parsedData);
    this.serviceCallId = parsedData.serviceCallId;
    console.log('Decrypted serviceCallId:', this.serviceCallId);
  } catch (error) {
    console.error('Error decrypting token:', error);
    console.error('Token that failed to decrypt:', token);
  }
}
loadTechnicianServiceCalls(): void {
  if (!this.serviceCallId) {
    console.warn('No serviceCallId available');
    return;
  }

  this.technicianService.getServiceCallDetailsForTechnician(this.serviceCallId).subscribe(
    (response: any) => {
      console.log('Service call response:', response);
      if (response?.statusCode === 200 && response?.data) {
        this.loadImage(this.serviceCallId);
        
        const receptionDate = this.formatServicecallDate(response.data.receptionDate);
        const placementDate = this.formatServicecallDate(response.data.placementDate);

        this.serviceCallForm.patchValue({
          serviceCallNumber: response.data.numServiceCall,
          dateReception: receptionDate,
          datePlacement: placementDate,
          poolSpecialist: response.data.poolSpecialist,
          issueProblem: response.data.issue,
          status: response.data.serviceCallStatus,
          description: response.data.issueDescription,
          notes: response.data.notes,
          comments: response.data.comments
        });
      } else {
        console.warn('Invalid response format or no data:', response);
      }
    },
    error => {
      console.error('Error fetching service call details:', error);
    }
  );
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
formatServicecallDate(dateString: string): string {
  if (!dateString) return ''; // Ensure the date string is valid
  const date = new Date(dateString); // Parse the ISO date string
  const day = String(date.getDate()).padStart(2, '0'); // Get the day and pad with zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-based, so +1)
  const year = date.getFullYear(); // Get the full year

  // Return the formatted date in `dd-MM-yyyy` format
  return `${day}-${month}-${year}`;
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
}
