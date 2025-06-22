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

          // Set payment mode based on payment method
          const paymentMode = this.technicianData.paymentMethod === 0 || this.technicianData.paymentMethod === null || this.technicianData.paymentMethod === '';

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
            paymentMode: paymentMode,
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
          console.log('Payment Method Control:', this.visitForm.get('paymentMethod')?.value);
          console.log('Payment Mode Control:', this.visitForm.get('paymentMode')?.value);
          console.log('Paid Control:', this.visitForm.get('paid')?.value);
          console.log('Status Control:', this.visitForm.get('status')?.value);

          // Load service calls and client details after setting the IDs
          this.loadTechnicianServiceCalls();
          this.getClientDetailByVisitId();

          if(this.visitForm.get('paid')?.value === true) {
            this.isPaymentChange = true;
            console.log('Paid is true, setting isPaymentChange to true');
          } else {
            this.isPaymentChange = false;
            console.log('Paid is false, setting isPaymentChange to false');
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
onImageClick(imageUrl: any): void {
  this.selectedImageUrl = imageUrl; // Set the clicked image URL
}
showServicecall(element:any){
  console.log('Service call element:', element);
  const queryParams = {
    serviceCallId: element.serviceCallId || element.servicecallId
  };
  console.log('Query params:', queryParams);
  const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams));
  console.log('Encrypted params:', encryptedParams);
  const baseUrl = `${window.location.origin}/#/` // Get the base URL of your app
  const newUrl = this.router.serializeUrl(
    this.router.createUrlTree(['/web/technician/servicecall-history'], {
      queryParams: { id: encryptedParams },
    })
  );

  // Open the full URL in a new tab
  window.open(`${baseUrl}${newUrl}`, '_blank');
}

// Add ViewChild for client details component
@ViewChild(ClientDetailsComponent) clientDetailsComponent!: ClientDetailsComponent;

saveServiceCall(): void {
  if (!this.serviceCallForm.valid) {
    this.toaster.error('Please fill in all required fields', 'Error');
    return;
  }

  this.isLoading = true;
  const requestModel = {
    serviceCallId: this.serviceCallId,
    serviceCallNumber: this.serviceCallForm.get('serviceCallNumber')?.value,
    receptionDate: this.serviceCallForm.get('dateReception')?.value,
    placementDate: this.serviceCallForm.get('datePlacement')?.value,
    poolSpecialistId: this.serviceCallForm.get('poolSpecialist')?.value,
    issueClassId: this.serviceCallForm.get('issue')?.value,
    statusId: this.serviceCallForm.get('status')?.value,
    description: this.serviceCallForm.get('description')?.value,
    notes: this.serviceCallForm.get('notes')?.value,
    comments: this.serviceCallForm.get('comments')?.value
  };
  
  console.log('Saving service call:', requestModel);

  this.servicecallservice.updateServiceCall(requestModel).subscribe({
    next: (response: any) => {
      if (response?.isSuccess === true) {
        this.toaster.success('Service call updated successfully', 'Success');
        this.loadTechnicianServiceCalls(); // Reload the data
      } else {
        this.toaster.error(response?.message || 'Error updating service call', 'Error');
      }
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error updating service call:', error);
      this.toaster.error(error?.message || 'Error updating service call', 'Error');
      this.isLoading = false;
    }
  });
}
}







