import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TechnicianVisitServiceService } from './technician-visit-service.service';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
import { TranslateModule } from '@ngx-translate/core';
import { GooglemapComponent } from '../googlemap/googlemap.component';
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
      GooglemapComponent
  ],
  templateUrl: './technician-visit-details.component.html',
  styleUrl: './technician-visit-details.component.scss'
})
export class TechnicianVisitDetailsComponent {
  date: any;
  isLoading = false;
  showGoogleMaps: boolean = false;
  techServiceJobsForm: FormGroup;
  technicianId: any;
  technicianName: string='';
  searchDate: any;
  seriveJobsList: any[] = [];
  currentDate: any;
  daysAllowedInCalender: number = 0;
  inputDays: number = 0;
  clientId: number = 0;
  spaId: number = 0;
  userId :any;
  days: any;
  sendData: any[] = [];

  constructor(
    private router: Router,
    private commonservice: CommonService,
    private technicianVisitService: TechnicianVisitServiceService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private datePipe: DatePipe
  ) {
    this.techServiceJobsForm = new FormGroup('');
  }
  
  ngOnInit() {
    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')
    this.techServiceJobsForm = this.formBuilder.group({
      technicianId: [0],
      searchDate: [this.currentDate, Validators.required]

    });
      
    this.GetTechnicianIdByUserLogin();
    
  }

  GetTechnicianIdByUserLogin(): void {
 
    
    this.userId = localStorage.getItem('userId');
    this.days = localStorage.getItem('assignTechnicianDays');
    
  }
 

  onSearchServiceJobsByDate(): void {
    
    this.searchDate = this.techServiceJobsForm.get('searchDate')?.value;
    const selectedDate = new Date(this.searchDate);

  // Calculate the difference in days
  const currentDate = new Date();
  const differenceInTime = selectedDate.getTime() - currentDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  if (differenceInDays <= 0) {
    if (this.userId > 0 && this.searchDate !== null) {
      this.technicianVisitService.GetServiceJobsForTechnician(this.userId, this.searchDate).subscribe((response: any) => {

        if (response !== null) {
          
          //this.seriveJobsList = response.value;
          const jobList = response.value;
          this.seriveJobsList = jobList
                                .sort((a: any, b: any) => a.priority - b.priority)
                                .map((job: any, index: number) => ({
                                  ...job,
                                  displayIndex: index + 1, // Add 1-based index for display
                                  cssClass: job.serviceCallStatus_labelEn === 'COMPLETED' ? 'red-row' : ''
                                }));

          this.isLoading = false;
        }
          if (this.seriveJobsList.length > 0) {
     
          }
          else {
            this.toaster.info("No record found");
          }

      })
      

    }
    
  }
  if(differenceInDays <= this.days){
    if (this.userId > 0 && this.searchDate !== null) {
      this.technicianVisitService.GetServiceJobsForTechnician(this.userId, this.searchDate).subscribe((response: any) => {
        if (response !== null) {
          //this.seriveJobsList = response.value;
          
          const jobList = response.value;
          this.seriveJobsList = jobList
                                .sort((a: any, b: any) => a.priority - b.priority)
                                .map((job: any, index: number) => ({
                                  ...job,
                                  displayIndex: index + 1, // Add 1-based index for display
                                  cssClass: job.serviceCallStatus_labelEn === 'COMPLETED' ? 'red-row' : ''
                                }));
          if (this.seriveJobsList.length > 0) {
     
          }
          else {
            this.toaster.info("No record found");
          }

        }
      });

    }
  }
   else{
    this.toaster.warning(`You cannot view data beyond ${this.days} days from today. Please select a valid date.`,
      "Invalid Date");
      return;
   }   
  }
  // , idClient : number, idSpa: number, technician_id: number
  jobServiceDetails(idVisit: number, idClient: number, idSpa: number,technician_id: number,idServiceCall: number ): void {
    
    const queryParams = {
      visitId: idVisit

    };
    sessionStorage.setItem('clientId', idClient.toString());
    sessionStorage.setItem('spaId', idSpa.toString());
    sessionStorage.setItem('technicianId', technician_id.toString());
    sessionStorage.setItem('serviceCallId', idServiceCall.toString());
    const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
    );
    // this.router.navigate(['/web/technician/manage-technician'], {
    //   queryParams: { id: encryptedParams },
    // });
    const baseUrl = `${window.location.origin}/#/` // Get the base URL of your app
    const newUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/web/technician/manage-technician'], {
        queryParams: { id: encryptedParams },
      })
    );
  
    // Open the full URL in a new tab
    window.open(`${baseUrl}${newUrl}`, '_blank');
    

  }

  showRoute(id:number){
    this.sendData.push({
      clientId: id    
    });
    this.showGoogleMaps = false;
    setTimeout(() => {
        this.showGoogleMaps = true;
    }, 0);
  }
}
