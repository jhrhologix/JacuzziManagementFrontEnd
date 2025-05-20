import { Component, OnInit } from '@angular/core';
import { SpaReportsService } from './spa-reports.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-spa-reports',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,FormsModule,TranslateModule],
  templateUrl: './spa-reports.component.html',
  styleUrl: './spa-reports.component.scss'
})
export class SpaReportsComponent implements OnInit{

  isLoading = false;

  poolSpecialists: any[] = [];
  poolSpecialistName:string='';
  visitForm: FormGroup;
  minToDate: string = '';
  toDate: string='';
  todaydate: string='';
  //soluSpaReportToDate : Date | undefined;
  constructor(private spaReportService: SpaReportsService,
    private formBuilder: FormBuilder,
  )
   {
     this.visitForm = new FormGroup('');
     //this.createForm

   }


  ngOnInit(): void {
    this.todaydate = new Date().toLocaleDateString('en-CA', { timeZone: 'UTC' });
    this.getPoolSpecialists();
    this.createformgroup();
    
    
  }
  createformgroup(){
    
    this.visitForm = this.formBuilder.group({
      soluSpaReportFromDate:['',Validators.required],
      soluSpaReportToDate:[this.todaydate,Validators.required],
      poolSpecialistName:['',Validators.required],
      schedule:[this.todaydate],
      Parts:[this.todaydate]
    }) 
  }
  reportSoluSpa(){
    
    
    if(this.visitForm.valid){
      this.isLoading = true;
      setTimeout(() => {
      const soluSpaSpecialistObject = {
        VisitDateFrom:this.visitForm.get('soluSpaReportFromDate')?.value,
        VisitDateTo:this.visitForm.get('soluSpaReportToDate')?.value,
        poolSpecialistId:this.visitForm.get('poolSpecialistName')?.value,
        
      }
      this.spaReportService.poolSpecialistReport(soluSpaSpecialistObject).subscribe((response:Blob)=>{
        this.isLoading = false;
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'PoolSpecialistData.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      })
    }, 300);
    }
    else{
      const firstInvalidControl = Object.keys(this.visitForm.controls).find(control => {
        return this.visitForm.controls[control].invalid;
      });
    
      if (firstInvalidControl) {
        window.scrollTo(0, 0); // Scroll to the first invalid control
        this.visitForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
      }
    
      return;
    }

  }
  partsReport(){
    
    this.isLoading = true;    
    let scheduleValue = this.visitForm.get('Parts')?.value;
    setTimeout(() => {
    // If scheduleValue is an empty string, set it to today's date
    if (scheduleValue === "") {
      scheduleValue = new Date().toLocaleDateString('en-CA', { timeZone: 'UTC' }); // Format as YYYY-MM-DD
    }

    const soluSpaSpecialistObject = {
      parts: scheduleValue
    };
    this.spaReportService.partsReport(soluSpaSpecialistObject).subscribe((response: Blob) => {
      this.isLoading = false;
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'PartsData.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    })
  }, 300);
  }
  scheduleReports(){
    this.isLoading = true;
    let scheduleValue = this.visitForm.get('schedule')?.value;
    setTimeout(() => {
    // If scheduleValue is an empty string, set it to today's date
    if (scheduleValue === "") {
      scheduleValue = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    const soluSpaSpecialistObject = {
      schedule: scheduleValue
    };
      this.spaReportService.scheduleReport(soluSpaSpecialistObject).subscribe((response:Blob)=>{
        this.isLoading = false;
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TechnicianSecheduleData.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      })
    }, 300);
  }
  getPoolSpecialists(): void {
    

    this.spaReportService.swimmingPoolContractor().subscribe(
      (response) => { 
        this.poolSpecialists= response.data; 
      },
      (error) => {
        console.error('Error fetching pool specialists', error);
      }
    );
  }
  updateMinToDate() {
    const fromDate = this.visitForm.get('soluSpaReportFromDate')?.value;
    if (fromDate) {
      this.minToDate = fromDate; // Set min date for ToDate input
      this.visitForm.get('soluSpaReportToDate')?.updateValueAndValidity(); // Trigger validation
    }
  }
  onSubmit()
  {
    
  }
}

