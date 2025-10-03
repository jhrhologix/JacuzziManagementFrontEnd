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
import { ImageApiService } from '../../../core/services/image-api.service';
import { Subscription } from 'rxjs';
import { ServiceCallService } from '../../admin/service-call/service-call.service';

interface ServiceCallResponse {
  isSuccess: boolean;
  value: {
    serviceCallNumber: string;
    description: string;
    notes: string;
    placementDate: string;
    receptionDate: string;
    poolSpecialistId: number;
    statusId: number;
    issueClassId: number;
  };
}

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
  clientData: any;
  serviceCallData: any;
  technicianForm: FormGroup;
  visitStatusList: Array<{ id: number; name: string }> = [];
  uploadImages = false;
  showImage = false;
  uploadingImage = false;
  cloudinaryImages: Array<{publicId: string, url: string, uploadedBy: 'admin' | 'technician'}> = [];
  @ViewChild(ClientDetailsComponent) clientDetailsComponent!: ClientDetailsComponent;

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
     private imageApiService: ImageApiService
  ) {
    this.technicianForm = this.fb.group({
      serviceCallNumber: [''],
      description: [''],
      notes: [''],
      placementDate: [''],
      receptionDate: [''],
      poolSpecialistId: [''],
      statusId: [''],
      issueClassId: ['']
    });

    this.serviceCallForm = this.fb.group({
      serviceCallNumber: [{value: '', disabled: true}],
      dateReception: [{value: '', disabled: true}],
      datePlacement: [{value: '', disabled: true}],
      poolSpecialist: [{value: '', disabled: true}],
      issue: [{value: '', disabled: true}],
      status: [{value: '', disabled: true}],
      description: [{value: '', disabled: true}],  // Issue #13: Readonly for tech
      notes: [{value: '', disabled: true}],  // Service call notes readonly for tech
      comments: [{value: '', disabled: true}]  // Service call comments readonly for tech
    });
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

    // First, get the parameters from the URL
    this.queryPrms();

    // Initialize forms
    this.initializeForms();

    // Load data after parameters are set
    this.loadStatus();
    this.loadTechnicianDetails();
    this.loadTechnicianServiceCalls();
    this.loadServiceCallHistory();
    this.getClientDetailByVisitId();
    this.fetchPaymentMethods();
  }

  private initializeForms(): void {
    // Initialize any additional form setup here if needed
    console.log('Initializing forms...');

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
      paymentMode: new FormControl(false),
      images: new FormControl(),
      invoice: new FormControl()
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
      issue: [''],
      status: [''],
      description: [''],
      notes: [''],
      comments: ['']
    });
  }

  queryPrms() {
    this.route.queryParams.subscribe(params => {
      this.convertToken(params['id']);
    })
  }
  convertToken(token: any) {
    console.log('=== START convertToken ===');
    console.log('Raw token:', token);
    
    try {
      this.adminToken = this.commonservice.decrypt(token);
      console.log('Decrypted token:', this.adminToken);
      
      const parsedData = JSON.parse(this.adminToken);
      console.log('Parsed data:', parsedData);
      
      // Extract all IDs from the parsed data
      this.visitId = parsedData.visitId || 0;
      this.clientId = parsedData.clientId || 0;
      this.spaId = parsedData.spaId || 0;
      this.technicianId = parsedData.technicianId || 0;
      this.serviceCallId = parsedData.serviceCallId || 0;
      
      // Log all IDs
      console.log('=== All IDs Summary ===');
      console.log('All IDs:', {
        visitId: this.visitId,
        technicianId: this.technicianId,
        clientId: this.clientId,
        spaId: this.spaId,
        serviceCallId: this.serviceCallId
      });
    } catch (error: any) {
      console.error('Error in convertToken:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack
      });
    }
    console.log('=== END convertToken ===');
  }

  pageSizeOptions: number[] = [5, 10, 20];

  @ViewChild(MatPaginator) paginator!: MatPaginator;



  loadStatus(): void {
    this.isLoading = true;
    console.log('Loading status...');
    
    // Load service call status
    this.technicianService.getParticularServiceCallStatus().subscribe(
      (response) => {
        this.isLoading = false;
        console.log('Service call status response:', response);
        if(response.statusCode == 200) {
          this.changeStatus = response.data;
          console.log('Service call status loaded:', this.changeStatus);
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching service call status:', error);
      }
    );

    // Load visit status
    console.log('Fetching visit status...');
    this.technicianService.getVisitStatus().subscribe(
      (response) => {
        console.log('Visit status API response:', response);
        if(response.isSuccess) {
          this.visitStatusList = response.value;
          console.log('Visit status list loaded:', this.visitStatusList);
        } else {
          console.error('Invalid response:', response);
        }
      },
      (error) => {
        console.error('Error fetching visit status:', error);
      }
    );
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

  convertMinutesToHours(minutes: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  extractTime(datetimeString: string): string {
    if (!datetimeString) return '';
    // If it's already just a time string, return it
    if (!datetimeString.includes(' ')) return datetimeString;
    
    const date = new Date(datetimeString);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  }

  convertToDateFormat(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  }

  // Modified duration handling
  onDurationChange(event: any) {
    const value = event.target.value;
    if (!value) return;
    
    // Convert to minutes
    const [hours, minutes] = value.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;
    
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    
    // Convert back to HH:mm format
    const roundedHours = Math.floor(roundedMinutes / 60);
    const remainingMinutes = roundedMinutes % 60;
    
    const formattedTime = `${roundedHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
    this.visitForm.get('durationNextVisit')?.setValue(formattedTime, { emitEvent: false });
  }

  // Add method to format time consistently
  formatTimeForDisplay(time: string): string {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Modify loadTechnicianDetails to handle time consistently
  loadTechnicianDetails(): void {
    this.isLoading = true;
    const id = this.visitId;
    
    console.log('=== Loading Technician Details ===');
    console.log('Visit ID:', id);
    
    this.technicianService.getAllTechnicianDetailTechnicianPageByID(id).subscribe(
      (response:any) => {
        if (response.value !== null && response.isSuccess === true) {
          this.isLoading = false;
          this.technicianData = response.value[0];
          
          console.log('=== Raw Technician Data ===');
          console.log('Full response:', response);
          console.log('Technician data:', this.technicianData);
          
          // Set the IDs from the response
          if (this.technicianData.clientId) {
            this.clientId = this.technicianData.clientId;
            console.log('Setting clientId from response:', this.clientId);
          }
          if (this.technicianData.serviceCallId) {
            this.serviceCallId = this.technicianData.serviceCallId;
            console.log('Setting serviceCallId from response:', this.serviceCallId);
          }
          if (this.technicianData.spaId) {
            this.spaId = this.technicianData.spaId;
            console.log('Setting spaId from response:', this.spaId);
          }
          
          // Set payment status based on paid value
          this.isPaymentChange = this.technicianData.paid === true;
          this.technicianName = this.technicianData.technicianName;

          console.log('=== Visit Section Values ===');
          console.log('Paid Status:', this.technicianData.paid);
          console.log('Payment Method:', this.technicianData.paymentMethod);
          console.log('Payment Change Status:', this.isPaymentChange);
          console.log('Status:', this.technicianData.status);
          console.log('Complete:', this.technicianData.complete);
          console.log('Date of Visit:', this.technicianData.dateOfVisit);
          console.log('Time From:', this.technicianData.dateVisit);
          console.log('Time To:', this.technicianData.hourVisit);
          console.log('Duration:', this.technicianData.nextVisitDuration);
          console.log('Pending Parts:', this.technicianData.missingParts);
          console.log('Notes:', this.technicianData.notes);
          console.log('Comments:', this.technicianData.technicianComments);

          // Issue #12: Check if payment method exists to show dropdown
          // paymentMode checkbox should be true if paymentMethod has a value
          const hasPaymentMethod = this.technicianData.paymentMethod != null && 
                                   this.technicianData.paymentMethod !== '' && 
                                   this.technicianData.paymentMethod !== 0;

          // Format times consistently
          const timeFrom = this.formatTimeSpan(this.technicianData.dateVisit);
          const timeTo = this.formatTimeSpan(this.technicianData.hourVisit);
          const duration = this.formatTimeSpan(this.technicianData.nextVisitDuration);

          this.visitForm.patchValue({
            technician: this.technicianData.technicianName,
            dateOfVisit: this.formatServicecallDate(this.technicianData.dateOfVisit),
            timeFrom: timeFrom,
            timeTo: timeTo,
            durationNextVisit: duration,
            completed: this.technicianData.complete,
            paid: this.technicianData.paid === true,
            paymentMode: hasPaymentMethod,  // Check if payment method exists
            paymentMethod: this.technicianData.paymentMethod == null || this.technicianData.paymentMethod == '' ? '' : this.technicianData.paymentMethod,
            pendingParts: this.technicianData.missingParts,
            notes: this.technicianData.notes,
            comments: this.technicianData.technicianComments,
            serviceRequester: this.technicianData.poolSpecialist_name,
            status: this.technicianData.status || '',
            invoice: this.technicianData.invoice
          });

          console.log('=== Form Values After Patch ===');
          console.log('Visit Form Values:', this.visitForm.value);
          console.log('Payment Method from DB:', this.technicianData.paymentMethod);
          console.log('Has Payment Method:', hasPaymentMethod);
          console.log('Payment Method Control:', this.visitForm.get('paymentMethod')?.value);
          console.log('Payment Mode Control:', this.visitForm.get('paymentMode')?.value);
          console.log('Paid Control:', this.visitForm.get('paid')?.value);
          console.log('Status Control:', this.visitForm.get('status')?.value);

          // Load service calls and client details after setting the IDs
          this.loadTechnicianServiceCalls();
          this.getClientDetailByVisitId();

          // Issue #12: Show payment dropdown if payment method exists
          if(hasPaymentMethod) {
            this.isPaymentChange = true;
            console.log('Payment method exists, showing dropdown. Method ID:', this.technicianData.paymentMethod);
          } else {
            this.isPaymentChange = false;
            console.log('No payment method, hiding dropdown');
          }

          if(this.technicianData.complete == true || this.technicianData.sPieces != null) {
            console.log('=== Payment Form Values ===');
            console.log('SPieces:', this.technicianData.sPieces);
            console.log('SMo:', this.technicianData.sMo);
            console.log('SousTotal:', this.technicianData.sousTotal);
            console.log('TPS:', this.technicianData.tps);
            console.log('TVQ:', this.technicianData.tvq);
            console.log('GrandTotal:', this.technicianData.grandTotal);

            this.completePaymentForm.patchValue({
              sPieces: this.technicianData.sPieces,
              sMo: this.technicianData.sMo,
              sousTotal: this.technicianData.sousTotal,
              tps: this.technicianData.tps,
              tvq: this.technicianData.tvq,
              grandTotal: this.technicianData.grandTotal
            });
            this.isCheckboxChecked = true;
            console.log('Payment form values set and checkbox checked');
          }
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching technician details:', error);
      }
    );
  }


  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return '';
      }
      
      // Format as yyyy-MM-dd HH:mm:ss
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
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
      const timeFrom = this.visitForm.get('timeFrom')?.value;
      const timeTo = this.visitForm.get('timeTo')?.value;
      const dateOfVisit = this.visitForm.get('dateOfVisit')?.value;

      // Format visit date to dd-MM-yyyy
      const formatVisitDate = (date: string) => {
        if (!date) return null;
        const dateObj = new Date(date);
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const year = dateObj.getUTCFullYear();
        return `${day}-${month}-${year}`;
      };

      // Format time to HH:mm
      const formatTime = (time: string) => {
        if (!time) return null;
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      };

      const formattedVisitDate = dateOfVisit ? formatVisitDate(dateOfVisit) : null;
      const formattedStartTime = timeFrom ? formatTime(timeFrom) : null;
      const formattedEndTime = timeTo ? formatTime(timeTo) : null;

      const model = {
        idVisit: this.visitId,
        ...this.visitForm.value,
        startDate: this.formatTimeSpan(this.visitForm.get('timeFrom')?.value),
        endDate: this.formatTimeSpan(this.visitForm.get('timeTo')?.value),
        nextVisitDuration: this.formatTimeSpan(this.visitForm.get('durationNextVisit')?.value),
        completed: this.visitForm.get('completed')?.value,
        neededParts: this.visitForm.get('pendingParts')?.value,
        notes: this.visitForm.get('notes')?.value,
        comments: this.visitForm.get('comments')?.value,
        paymentMethodId: this.visitForm.get('paymentMethod')?.value,
        montantPieces: this.completePaymentForm.get('sPieces')?.value,
        montantMO: this.completePaymentForm.get('sMo')?.value,
        sousTotal: this.completePaymentForm.get('sousTotal')?.value,
        tps: this.completePaymentForm.get('tps')?.value,
        tvq: this.completePaymentForm.get('tvq')?.value,
        total: this.completePaymentForm.get('grandTotal')?.value,
        visitDate: formattedVisitDate,
        invoice: this.visitForm.get('invoice')?.value
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

      console.log('Saving visit form with model:', model);

      this.technicianService.updateTechnicainVisitDetails(model).subscribe(
        (response: any) => {
          if (response.statusCode == 200) {
            this.isLoading = false;
            this.loadTechnicianDetails();
            this.removeImage();
            this.toaster.success('Visit details updated successfully', 'Success');
          } else {
            this.isLoading = false;
            this.toaster.error(response.message || 'Failed to update visit details', 'Error');
          }
        },
        (error) => {
          this.isLoading = false;
          this.toaster.error(error.message || 'Error updating visit details', 'Error');
        }
      );
    }
  }
  



loadTechnicianServiceCalls(): void {
  console.log('Loading service calls with serviceCallId:', this.serviceCallId);
  if (!this.serviceCallId || this.serviceCallId <= 0) {
    console.warn('Invalid serviceCallId:', this.serviceCallId);
    return;
  }

  this.technicianService.getServiceCallDetailsForTechnician(this.serviceCallId).subscribe({
    next: (response: any) => {
      console.log('Service call response:', response);
      if (response?.statusCode === 200 && response?.data) {
        const serviceCallData = response.data;
        console.log('Service call data:', serviceCallData);
        
        // Update the service call form with the data
        this.serviceCallForm.patchValue({
          serviceCallNumber: serviceCallData.numServiceCall || '',
          dateReception: serviceCallData.receptionDate ? this.formatDate(serviceCallData.receptionDate) : null,
          datePlacement: serviceCallData.placementDate ? this.formatDate(serviceCallData.placementDate) : null,
          poolSpecialist: serviceCallData.poolSpecialist || '',
          issue: serviceCallData.issue || '',
          status: serviceCallData.serviceCallStatus || '',
          description: serviceCallData.issueDescription || '',
          notes: serviceCallData.notes || '',
          comments: serviceCallData.comments || ''
        });

        console.log('Service call form values after patch:', this.serviceCallForm.value);
        
        // Enable photo uploads and load existing images from Cloudinary
        this.uploadImages = true;
        if (serviceCallData.numServiceCall) {
          this.loadImagesForServiceCall(serviceCallData.numServiceCall);
        }
      } else {
        console.warn('No service call data found in response');
      }
    },
    error: (error: any) => {
      console.error('Error loading service calls:', error);
    }
  });
}

loadServiceCallHistory(): void {
  console.log('Loading service call history with visitId:', this.visitId);
  if (!this.visitId || this.visitId <= 0) {
    console.warn('Invalid visitId:', this.visitId);
    return;
  }

  this.technicianService.getServiceCallHistory(this.visitId).subscribe({
    next: (response: any) => {
      console.log('Service call history response:', response);
      if (response?.statusCode === 200 && response?.data) {
        const historyData = response.data.map((item: any) => ({
          ...item,
          date: item.visitDate ? this.formatServicecallDate(item.visitDate) : null,
          status: item.serviceCallStatus || '',
          issue: item.issueLabel || '',
          technician: item.poolSpecialist || ''
        }));
        console.log('Processed history data:', historyData);
        this.dataSourceService = historyData;
      } else {
        console.warn('No history data found or invalid response format');
        this.dataSourceService = [];
      }
    },
    error: (error) => {
      console.error('Error loading service call history:', error);
      this.dataSourceService = [];
    }
  });
}

formatServicecallDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
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



async onFileChange(event: any): Promise<void> {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  // Get service call number and username
  const serviceCallNumber = this.serviceCallForm.get('serviceCallNumber')?.value || 'temp-' + Date.now();
  const currentUsername = localStorage.getItem('username') || 'technician'; // Get from your auth service
  
  this.uploadingImage = true;
  
  try {
    for (const file of Array.from(files)) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.toaster.error(`Unsupported file type: ${file.name}`);
        continue;
      }

      // Upload to Cloudinary immediately with technician username
      const result = await this.imageApiService.uploadImage(file, serviceCallNumber, currentUsername, 'technician');
      
      // No storage needed - images are in Cloudinary
      
      // Add to display array
      this.cloudinaryImages.push({
        publicId: result.publicId,
        url: result.thumbnailUrl,
        uploadedBy: 'technician'
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
  this.base64Images = [];  // Clear the array of base64 images
  this.visitForm.patchValue({ images: null });
  return;
}

  onImageClick(imageUrl: any): void {
    this.selectedImageUrl = imageUrl; // Set the clicked image URL
  }

  getFormValidationErrors() {
    const formErrors: any = {};
    Object.keys(this.serviceCallForm.controls).forEach(key => {
      const controlErrors = this.serviceCallForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  async deleteImage(imageData: {publicId: string, url: string, uploadedBy: string}, index: number): Promise<void> {
    // Get current user info
    const currentUsername = localStorage.getItem('username') || 'technician';
    const isAdmin = false; // Technician page - can only delete own images
    
    // Check permissions - technicians can only delete their own images
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

  // Check if current user can delete an image (technicians can only delete their own)
  canDeleteImage(publicId: string): boolean {
    const currentUsername = localStorage.getItem('username') || 'technician';
    const isAdmin = false; // Technician page - restricted permissions
    
    // Debug logging
    console.log(`🔍 Technician: Checking delete permission for image: ${publicId}`);
    console.log(`👤 Current username: ${currentUsername}`);
    console.log(`🔑 Is admin: ${isAdmin}`);
    
    const canDelete = this.imageApiService.canDeleteImage(publicId, currentUsername, isAdmin);
    console.log(`✅ Can delete: ${canDelete}`);
    
    return canDelete;
  }

loadImages(id: number): void {
  // Skip loading images if serviceCallId is invalid or 0
  if (!id || id === 0) {
    console.log('Skipping image load - invalid serviceCallId:', id);
    this.showImage = false;
    return;
  }
  
  // Images now loaded from Cloudinary - this method is deprecated
  
  this.servicecallservice.getImageById(id).subscribe(
    (responses: { fileData: string; contentType: string }[]) => {
      if(responses == null)
      {
        this.showImage = false;
      }
      this.showImage = true; // Ensure the image container is visible
      this.imageUrls = []; // Clear previous images
          // Images handled by Cloudinary - no flags needed // Reset deletion flag when loading fresh images

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
      console.log('Error loading images for serviceCallId:', id, 'Error:', error.status);
      if (error.status === 500 || error.status === 404) {
        this.imageUrls = []; // Clear images if no images are found or service call doesn't exist
        this.showImage = false;
      }
    }
  );
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
  console.log('Loading client details with clientId:', this.clientId);
  if (!this.clientId || this.clientId <= 0) {
    console.warn('Invalid clientId:', this.clientId);
    return;
  }

  this.technicianService.getClientDetailForTechnician(this.clientId).subscribe({
    next: (response: any) => {
      console.log('Client detail response:', response);
      if (response?.isSuccess === true && response?.value) {
        const clientData = response.value[0];
        if (clientData) {
          this.email = clientData.emailClient || null;
          this.clientData = clientData;
          console.log('Client data set:', this.clientData);
          
          // Update the client details component if it exists
          if (this.clientDetailsComponent) {
            this.clientDetailsComponent.clientData = {
              ...this.clientData,
              clientName: `${this.clientData.firstName} ${this.clientData.lastName}`.trim()
            };
          }
        } else {
          console.warn('No client data found in response value');
        }
      } else {
        console.warn('Invalid response format or no success:', response);
      }
    },
    error: (error) => {
      console.error('Error fetching client details:', error);
    }
  });
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

showServicecall(element: any): void {
  console.log('Service call element:', element);
  const queryParams = {
    serviceCallId: element.serviceCallId || element.servicecallId
  };
  
  this.router.navigate(['/web/technician/manage-technician'], { queryParams });
}

saveServiceCall(): void {
  if (this.serviceCallForm.valid) {
    this.isLoading = true;
    
    const formData = this.serviceCallForm.value;
    
    // Use the same approach as admin component - use form.value directly
    const requestModel: any = this.serviceCallForm.value;
    
    // Add required fields that aren't in the form
    requestModel.serviceCallId = this.serviceCallId;

    
    // Images are now handled separately via Cloudinary - no need to send image data
    // Remove any old image properties
    delete requestModel.images;
    delete requestModel.clearExistingImages;
    delete requestModel.imagesPath;

    // Apply the same preprocessing as admin component
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

    console.log('Saving service call with full data:', requestModel);
    console.log('Service call form valid:', this.serviceCallForm.valid);
    console.log('Form errors:', this.getFormValidationErrors());

    this.servicecallservice.updateServiceCall(requestModel).subscribe({
      next: (response: any) => {
        if (response?.isSuccess) {
          this.toaster.success('Service call updated successfully');
          
          // Check if we need to reload images before resetting the flag
          // Images handled by Cloudinary - no reload needed
          
          // Clear image preview after successful save
          this.imagePreview = null;
          this.removeImage();
          this.loadServiceCallHistory();
          
          // Don't reload images if we deleted some - the current imageUrls array already shows the correct state
          // if (shouldReloadImages) {
          //   setTimeout(() => {
          //     this.loadImages(this.serviceCallId);
          //   }, 1000);
          // }
        } else {
          this.toaster.error(response?.message || 'Failed to update service call');
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error updating service call:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.error);
        console.error('Full error response:', JSON.stringify(error.error));
        
        if (error.status === 401) {
          this.toaster.error('Authentication failed. Please log in again.', 'Unauthorized');
        } else if (error.status === 400) {
          this.toaster.error('Invalid data sent to server. Please check all fields.', 'Bad Request');
        } else {
          this.toaster.error(error?.message || 'Error updating service call', 'Error');
        }
        this.isLoading = false;
      }
    });
  }
}
}







