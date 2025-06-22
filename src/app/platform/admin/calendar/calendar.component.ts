import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarService } from './calendar.service';
import { CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';
import { statusList, technicianList } from '../../../shared/Models/technicianListModel';
declare var window: any;
import { interval, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  providers: [DatePipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    TranslateModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  selectedTechnicianId: any = 0;
  selectedStatusId: any = 0;
  selectedDate: any = new Date();
  technicianList: technicianList[] = [];
  filtertechnicianList: technicianList[] = [];
  serviceStatusList: any[] = [];
  clientsList: any = [];
  assignedJobList: any = [];
  isLoading = false;
  calendarModal: any;
  selectedValue: number = 0;
  allPriorities = [1, 2, 3, 4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  filterStatusList: statusList[] = [];
  fromDate: any = null;
toDate: any = null;
  years: number[] = [];
  selectedYear: any; // Stores the selected year
  selectedMonth: any;
  language: any;
  currentLanguage: string = 'en'; // Default language
  private subscription: Subscription = new Subscription();
  monthesList: any[]=[];
  calendarForm: FormGroup;
  minToDate: string = '';
  setPriority = false;
  priority: any;
  filtersCollapsed = false;

  constructor(
    
    private calendarService: CalendarService,
    private datePipe: DatePipe,
    private toaster: ToastrService,
    private router: Router,
    private commonservice: CommonService,
  ) { 
    this.calendarForm = new FormGroup('');
  }

  ngOnInit(): void {
    this.subscription = this.commonservice.languageChange$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
    
    this.selectedDate = this.datePipe.transform(
      this.selectedDate,
      'yyyy-MM-dd'
    );
    this.calendarModal = new window.bootstrap.Modal(
      document.getElementById('calendarModal')
    );
    this.generateYearRange();
    this.getMonthes();
    this.createformgroup();
    this.getTechnicianList();
    this.onTechnicianChange();
    this.getAssignedJobList();
    this.getServiceStatusList();
    this.getClientsList();
  }
  
  createformgroup() {
    // Get current year and month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    this.calendarForm = new FormGroup({
      fromDate: new FormControl(null),
      toDate: new FormControl(null),
      selectedYear: new FormControl(currentYear.toString()),
      selectedMonth: new FormControl(currentMonth.toString()),
    });
    
    // Set the selected values for the component
    this.selectedYear = currentYear.toString();
    this.selectedMonth = currentMonth.toString();
    
    // Apply the filter with default values after a short delay to ensure data is loaded
    setTimeout(() => {
      this.onToDateChange();
    }, 100);
  }

  private getTechnicianList() {
    this.calendarService.getTechniciansList(0).subscribe((response: any) => {
      if (response && response.value) {
        this.technicianList = response.value.map((technician: any) => ({
          ...technician,
        }));
      }
    });
  }

  private getMonthes() {
    
    
    this.calendarService.getMonthesList().subscribe((response: any) => {
      if (response) {
        this.monthesList = response.value;
      }
    });
  }


  private getServiceStatusList() {
    
    
    this.calendarService.getServiceStatusList(0).subscribe((response: any) => {
      if (response) {
        this.serviceStatusList = response.value;
      }
    });
  }

  private getClientsList() {
    
    this.calendarService.getClientsList(0).subscribe((response: any) => {
      if (response) {
        this.clientsList = [];
        this.clientsList = response.value;
      }
    });
  }

  private getAssignedJobList() {
    
    const sortByPriority = (jobs: any[]) =>
      jobs.sort((a: any, b: any) => (a.priority || Infinity) - (b.priority || Infinity));
    if(this.priority === "1")
    {
      this.isLoading = true;
      var datePipe = new DatePipe('en-US');
      const date = datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
      this.calendarService
        .getAssignedJobList(date, this.selectedStatusId)
        .subscribe((response: any) => {
          if (response) {
            
            if (response) {
              this.assignedJobList = response.value.map((job: any) => ({
                  ...job,
                  cssClass: job.serviceCallStatus_labelEn === 'COMPLETED' ? 'red-row' : ''
              }));
              this.isLoading = false;
          }
            this.assignedJobList =response.value;
             this.isLoading = false;
          }
        });
    }
    else{
      this.isLoading = true;
    var datePipe = new DatePipe('en-US');
    const date = datePipe.transform(this.selectedDate, 'yyyy-MM-dd');
    this.calendarService
      .getAssignedServiceCallJobList(date, this.selectedStatusId,this.setPriority)
      .subscribe((response: any) => {
        if (response) {
          
          if (response) {
            this.assignedJobList = sortByPriority(
              response.value.map((job: any) => ({
                ...job,
                cssClass: job.serviceCallStatus_labelEn === 'COMPLETED' ? 'red-row' : '',
              }))
            );
          }
          this.isLoading = false
        }
      });
    }
    
  }
  getAvailablePriorities(currentJob: any): number[] {
    // Collect all priorities currently selected except the current job
    const selectedPriorities = this.assignedJobList
      .filter((job: { priority: any; }) => job !== currentJob && job.priority) // Exclude current job
      .map((job: { priority: any; }) => job.priority);

    // Return only priorities that are not already selected
    return this.allPriorities.filter(
      (priority) => !selectedPriorities.includes(priority)
    );
  }
  currentItem: any;
  technicianItem: any;
  onDragStart(item: any, techitem: any, sender: any) {

    this.currentItem = item;
    this.technicianItem = techitem;
    this.sender = sender;
  }

  sender: any;
  receiver: any;

  onDrop(statusId: any, data: any, receiver: any) {
    
    // alert(this.sender)
    // alert(receiver)
    if (this.sender == 1 && receiver == 2) {
      this.showConfirmationModal(
        'Attention!',
        `Do you want to move service from Waiting List to ${data.technicianName}?`,
        () => this.insertUpdateVisitEvent(data, statusId)
      );
    } else if (this.sender == 2 && receiver == 1) {
      this.showConfirmationModal(
        'Attention!',
        `Do you want to move service from  ${this.technicianItem.technicianName} to Waiting list?`,
        () => this.insertUpdateVisitEvent(data, statusId)
      );
    } else if (this.sender == 2 && receiver == 2) {
      this.showConfirmationModal(
        'Attention!',
        `Do you want to move service from  ${this.technicianItem.technicianName} to ${data.technicianName}`,
        () => this.insertUpdateVisitEvent(data, (statusId = 1))
      );
    }
  }

  modalTitle: string = '';
  modalMessage: string = '';
  public confirmActionFn: () => void = () => { };
  showConfirmationModal(
    title: string,
    message: string,
    confirmAction: () => void
  ) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.confirmActionFn = confirmAction;
    this.calendarModal.show();
  }

  confirmAction() {
    this.confirmActionFn();
    if (this.calendarModal) {
      this.calendarModal.hide();
      // this.calendarModal = null;
    }
  }

  private insertUpdateVisitEvent(data: any, statusId: number) {

    let params = {
      TechnicianId: data == null ? 0 : data.id,
      TechnicianName: data == null ? '' : data.technicianName,
      IdVisit:
        this.currentItem.idVisit == undefined ? 0 : this.currentItem.idVisit,
      IdServiceCall: this.currentItem.idServiceCall,
      DateOfVisit: this.selectedDate,
      StatusId: statusId,
    };
    this.calendarService
      .insertUpdateVisitEvent(params)
      .subscribe((response: any) => {
        if (response) {
          this.getAssignedJobList();
          this.getClientsList();
        }
      });
  }

  onDragOver(event: any, data: any) {

    event.preventDefault();
  }

  onDateChange() {
    this.getAssignedJobList();
    this.getClientsList();
  }

  onTechnicianChange() {
    
    this.isLoading = true;
    this.calendarService
      .getTechniciansList(this.selectedTechnicianId)
      .subscribe((response: any) => {
        if (response && response.value) {
          this.filtertechnicianList = response.value.map((technician: any) => ({
            ...technician,
          }));
          this.isLoading = false;
        }
      });
  }

  onStatusChange() {
    
    this.isLoading = true;
      // this.calendarService.getServiceStatusList(this.selectedStatusId).subscribe((response: any) => {
      //   if (response && response.value) {
      //     this.filterStatusList = response.value.map((technician: any) => ({
      //       ...technician,
      //     }));
      //     this.isLoading = false;
      //   }
      // });
      this.calendarService.getClientsList(this.selectedStatusId).subscribe((response: any) => {
        if (response) {
          this.clientsList = [];
          this.clientsList = response.value;
        }
      });
      this.isLoading = false;
    this.getAssignedJobList();
  }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private scrollDirection: 'left' | 'right' | null = null;
  private scrollSpeed = 5; // Adjust this for desired scroll speed
  private scrolling = false;

  // Method to handle drag over and initiate horizontal scrolling
  onDragOverScroll(event: DragEvent): void {
    
    const container = this.scrollContainer.nativeElement as HTMLElement;
    const threshold = 50; // Distance from edge to trigger scroll
    const { clientX } = event;
    const containerRect = container.getBoundingClientRect();

    if (clientX > containerRect.right - threshold) {
      // Near the right edge, start scrolling to the right
      this.startScrolling('right');
    } else if (clientX < containerRect.left + threshold) {
      // Near the left edge, start scrolling to the left
      this.startScrolling('left');
    } else {
      // Outside the scroll zones, stop scrolling
      this.stopScrolling();
    }

    event.preventDefault();
  }

  // Starts continuous scrolling in the specified horizontal direction
  private startScrolling(direction: 'left' | 'right'): void {
    if (this.scrollDirection === direction && this.scrolling) return;

    this.scrollDirection = direction;
    this.scrolling = true;

    const container = this.scrollContainer.nativeElement as HTMLElement;

    // Recursive scroll function using requestAnimationFrame
    const scroll = () => {
      if (!this.scrolling) return;

      if (this.scrollDirection === 'right') {
        container.scrollLeft += this.scrollSpeed;
      } else if (this.scrollDirection === 'left') {
        container.scrollLeft -= this.scrollSpeed;
      }

      requestAnimationFrame(scroll); // Keep scrolling as long as dragging near edge
    };

    requestAnimationFrame(scroll);
  }

  // Stops the scrolling
  private stopScrolling(): void {
    this.scrolling = false;
    this.scrollDirection = null;
  }

  // Stop scrolling when dragging ends
  @HostListener('dragend')
  onDragEnd(): void {
    this.stopScrolling();
  }

  // Clean up on component destroy
  ngOnDestroy(): void {
    this.stopScrolling();
  }
  onOptionSelect(event: any, job: any) {
    
    const selectedValue = event.target.value;
    this.priority = selectedValue;
    const rqstmodel: any = {
      Priority: selectedValue,
      VisitId: job.idVisit,
      date: this.selectedDate,
      technicianId: job.technicianId,
      ispriorityset: true
    }
    
    console.log('Sending priority request:', rqstmodel);
    
    this.calendarService.addPriority(rqstmodel).subscribe((response: any) => {
      console.log('Priority response:', response);
      this.setPriority = true;
      if (response.value === "Priority updated successfully.") {
        this.toaster.success('Priority updated successfully.', 'Success');
        this.getAssignedJobList();
      }
      else {
        this.toaster.warning('The specified priority is already assigned', 'Warning');
        this.getAssignedJobList();
      }
    })
  }

  // servicecall(event: any) {
  //   
  //   const queryParams = {
  //     clientId: event.idClient,
  //     serviceCallId: event.idServiceCall,
  //     additionValue: ''
  //   };
  //   const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
  //   );
  //   this.router.navigate(['/web/admin/service-call'], {
  //     queryParams: { id: encryptedParams },
  //   });
  // }
  servicecall(event: any) {
    ;
    const queryParams = {
      clientId: event.idClient,
      serviceCallId: event.idServiceCall,
      additionValue: ''
    };
    const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams));
  
    // Construct the full URL using the current location
    const baseUrl = `${window.location.origin}/#/` // Get the base URL of your app
    const newUrl = this.router.serializeUrl(
      this.router.createUrlTree(['/web/admin/service-call'], {
        queryParams: { id: encryptedParams },
      })
    );
  
    // Open the full URL in a new tab
    window.open(`${baseUrl}${newUrl}`, '_blank');
  }
  stopPropagation(event: MouseEvent): void {
    
    event.stopPropagation();
  }
  onToDateChange(){
    const { fromDate, toDate } = this.calendarForm.value;
    
    this.isLoading =true;
    if(fromDate !=null && toDate != null){
      this.selectedYear = '';
      this.selectedMonth = ''
    }
    const rqstmodel = {
     fromDate : fromDate,
     toDate : toDate,
     year:this.selectedYear,
     month:this.selectedMonth
    }
    this.calendarService.getwaitingStatusList(rqstmodel).subscribe((response: any) => {
      if (response) {
        this.clientsList = [];
        this.clientsList = response.value;
      }
    });
    this.isLoading = false;
  }
  // generateYearRange(): void {
    
  //   const currentYear = new Date().getFullYear();
  //   const startYear = 1900;
  //   this.years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
    
  // }
  generateYearRange(): void {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const startYear = 1900;
    this.years = Array.from({ length: nextYear - startYear + 1 }, (_, i) => nextYear - i);
}
  selectYear(value: any ): void {
    
    const years = (value.target as HTMLSelectElement).value;
    if (years) {
      this.selectedYear = years;
      if(this.selectedMonth == ""){
        this.selectedMonth = null
      }
      //this.selectedMonth = null
      this.toDate = null
      this.fromDate = null
      this.onToDateChange();
    } else {
      console.warn('No year selected');
    }
    //console.log('Selected Year:', year);
  }
  onSelectMonth(event: any):void{
    
    const selectedValue = (event.target as HTMLSelectElement).value;
    const selectedMonth = this.monthesList.find(month => month.id === +selectedValue);
    if(this.currentLanguage == 'fr'){
      this.selectedMonth = selectedMonth.value
    }
    else{
      this.selectedMonth = selectedMonth.name
    }
    //this.selectedMonth = selectedMonth
    if(this.selectedYear == ""){
      this.selectedYear = null;
    }
    //this.selectedYear = null;
    this.toDate = null
    this.fromDate = null
    this.onToDateChange();
  }
  removefilter() {
    
    this.calendarForm.reset({
      fromDate: null,
      toDate: null,
      selectedYear: '',
      selectedMonth: '',
    });
    this.selectedYear = ''; // Reset selectedYear and selectedMonth explicitly
    this.selectedMonth = '';
    this.toDate = null;
    this.fromDate = null;
    // Refresh the client list or perform other actions
    this.getClientsList();
  }
  updateMinToDate() {
    
    const fromDate = this.calendarForm.get('fromDate')?.value;
    if (fromDate) {
      this.minToDate = fromDate; // Set min date for ToDate input
      this.calendarForm.get('toDate')?.updateValueAndValidity(); // Trigger validation
    }
  }

  toggleFilters(): void {
    this.filtersCollapsed = !this.filtersCollapsed;
  }
}
