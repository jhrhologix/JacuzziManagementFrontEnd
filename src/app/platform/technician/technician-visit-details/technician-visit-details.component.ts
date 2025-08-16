import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TechnicianVisitServiceService } from './technician-visit-service.service';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { GooglemapComponent } from '../googlemap/googlemap.component';
import { VisitService } from './visit.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-technician-visit-details',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    ToastrModule,
    TranslateModule,
    GooglemapComponent,
    MatDialogModule
  ],
  templateUrl: './technician-visit-details.component.html',
  styleUrl: './technician-visit-details.component.scss'
})
export class TechnicianVisitDetailsComponent implements OnInit {
  date: any;
  isLoading = false;
  showGoogleMaps: boolean = false;
  techServiceJobsForm!: FormGroup;
  technicianId: any;
  technicianName: string='';
  searchDate: any;
  seriveJobsList: any[] = [];
  currentDate: any;
  daysAllowedInCalender: number = 0;
  inputDays: number = 0;
  clientId: number = 0;
  spaId: number = 0;
  userId: any;
  days: any;
  sendData: any[] = [];
  hasInProgressVisit = false;

  constructor(
    private router: Router,
    private commonservice: CommonService,
    private technicianVisitService: TechnicianVisitServiceService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private datePipe: DatePipe,
    private visitService: VisitService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.currentDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.techServiceJobsForm = this.formBuilder.group({
      technicianId: ['', Validators.required],
      searchDate: [this.currentDate, Validators.required]
    });

    // Subscribe to date changes
    this.techServiceJobsForm.get('searchDate')?.valueChanges.subscribe(() => {
      this.onSearchServiceJobsByDate();
    });

    const userId = localStorage.getItem('userId');
    console.log('Retrieved userId from localStorage:', userId);

    if (userId) {
      this.isLoading = true;
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        console.error('Invalid userId format in localStorage');
        this.toaster.error('Invalid user ID format. Please log in again.');
        this.router.navigate(['/auth/login']);
        return;
      }
      
      this.technicianVisitService.GetTechnicianIdByUserId(numericUserId).subscribe({
        next: (response: any) => {
          console.log('Technician ID response:', response);
          if (response && response.value && response.value.length > 0) {
            const technicianData = response.value[0];
            console.log('Raw technician data from response:', technicianData);
            
            // Extract the technicianId from the response object
            const technicianId = technicianData.technicianId;
            
            if (!technicianId || isNaN(technicianId)) {
              console.error('Invalid technician ID format:', technicianData);
              this.toaster.error('Invalid technician ID format. Please contact your administrator.');
              return;
            }
            
            console.log('Setting technician ID:', technicianId);
            this.techServiceJobsForm.patchValue({
              technicianId: technicianId
            });
            // Automatically search for today's visits
            this.onSearchServiceJobsByDate();
          } else {
            console.error('No technician ID found in response');
            this.toaster.error('You are not associated with any technician. Please contact your administrator.');
            this.router.navigate(['/web/technician/technician-visit']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error getting technician ID:', error);
          this.toaster.error('Failed to get technician information. Please try again later.');
          this.isLoading = false;
        }
      });
    } else {
      console.error('No userId found in localStorage');
      this.toaster.error('User ID not found. Please log in again.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSearchServiceJobsByDate(): void {
    if (!this.techServiceJobsForm.valid) {
      const searchDate = this.techServiceJobsForm.get('searchDate');
      if (searchDate?.invalid) {
        this.toaster.error('Please select a valid date');
      }
      return;
    }

    const searchDate = this.techServiceJobsForm.get('searchDate')?.value;
    const technicianId = Number(this.techServiceJobsForm.get('technicianId')?.value);

    console.log('Searching with:', { technicianId, searchDate });

    if (!technicianId || isNaN(technicianId)) {
      this.toaster.error('Invalid technician ID. Please try again.');
      return;
    }

    this.isLoading = true;
    this.technicianVisitService.GetServiceJobsForTechnician(technicianId, searchDate).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        if (response && response.value) {
          this.seriveJobsList = response.value
            .map((job: any, index: number) => ({
              ...job,
              displayIndex: index + 1,
              completed: job.completed === undefined ? null : job.completed,
              cssClass: this.getVisitStatusClass(job.completed === undefined ? null : job.completed)
            }));
          this.hasInProgressVisit = this.seriveJobsList.some(v => v.completed === null);
        } else {
          this.seriveJobsList = [];
          this.toaster.info('No visits found for the selected date');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching service jobs:', error);
        this.toaster.error('Failed to fetch service jobs. Please try again later.');
        this.isLoading = false;
      }
    });
  }

  getVisitStatusClass(completed: boolean | null): string {
    if (completed === null) return 'in-progress';
    if (completed === false) return '';
    if (completed === true) return 'completed';
    return '';
  }

  private showConfirmation(title: string, message: string): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title, message }
    });

    return dialogRef.afterClosed().toPromise();
  }

  async handleNotificationClick(event: Event, item: any): Promise<void> {
    event.stopPropagation();

    // Check for uncompleted visits before this one
    const hasUncompletedBefore = this.seriveJobsList.some(v => 
      (v.completed === false || v.completed === 0) && 
      this.seriveJobsList.indexOf(v) < this.seriveJobsList.indexOf(item)
    );

    if (hasUncompletedBefore) {
      const message = this.translate.instant('VISIT.IncompleteVisitsBefore');
      const proceed = await this.showConfirmation(
        'Warning',
        message
      );
      if (!proceed) return;
    }

    // Check for in-progress visit
    if (this.hasInProgressVisit && item.completed !== null) {
      const proceed = await this.showConfirmation(
        'Warning',
        'There is another visit in progress. Proceed anyways?'
      );
      if (!proceed) return;
    }

    // Show confirmation dialog
    const message = item.completed === null
      ? 'You have already advised the client. Proceed anyways?'
      : 'Do you want to send your arrival notification to the client?';

    const proceed = await this.showConfirmation('Confirm', message);
    if (!proceed) return;

    try {
      // First update the visit status to in-progress (null)
      await this.visitService.updateVisitStatus(item.idVisit, null).toPromise();
      item.completed = null;
      this.hasInProgressVisit = true;

      // Then send the notification
      await this.visitService.sendNotification(item.idVisit, item.idClient).toPromise();

      this.toaster.success('Notification sent successfully');
      
      // Refresh the visits list after successful notification
      if (this.techServiceJobsForm.valid) {
        this.onSearchServiceJobsByDate();
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      this.toaster.error('Failed to send notification');
    }
  }

  showRoute(id: number): void {
    this.sendData = [{
      clientId: id    
    }];
    this.showGoogleMaps = false;
    setTimeout(() => {
      this.showGoogleMaps = true;
    }, 0);
  }

  navigateToServiceCall(item: any): void {
    try {
      console.log('=== START navigateToServiceCall ===');
      console.log('Full item object:', JSON.stringify(item, null, 2));
      
      // Create query parameters with all necessary data
      const queryParams = {
        visitId: item.idVisit,
        clientId: item.idClient || 0,
        spaId: item.idSpa || 0,
        technicianId: this.techServiceJobsForm.get('technicianId')?.value || 0,
        serviceCallId: item.idServiceCall || 0
      };
      
      console.log('Query params before encryption:', queryParams);
      const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams));
      console.log('Encrypted params:', encryptedParams);
      
      const baseUrl = `${window.location.origin}/#/`;
      const newUrl = this.router.serializeUrl(
        this.router.createUrlTree(['/web/technician/manage-technician'], {
          queryParams: { id: encryptedParams },
        })
      );

      console.log('Final URL:', `${baseUrl}${newUrl}`);
      
      // Open in new tab
      window.open(`${baseUrl}${newUrl}`, '_blank');
      console.log('=== END navigateToServiceCall ===');
    } catch (error: any) {
      console.error('Error navigating to service call:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack
      });
      this.toaster.error('Failed to open service call details');
    }
  }

  // Add page focus event handler
  @HostListener('window:focus')
  onFocus() {
    if (this.techServiceJobsForm.valid) {
      this.onSearchServiceJobsByDate();
    }
  }
}
