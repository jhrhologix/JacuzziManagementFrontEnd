import { Component, ElementRef, HostListener } from '@angular/core';
import { TechnicianService } from '../technician.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterModel, SearchFilterModel } from '../../../core/models/common-model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../core/services/common.service';
import { MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-spa-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatTableModule,
  ],
  templateUrl: './spa-details.component.html',
  styleUrl: './spa-details.component.scss'
})
export class SpaDetailsComponent {

  clientlist: any[] = [];
  searchclientlist: any[] = [];
  filtermodel: FilterModel;
  searchfiltermodel: SearchFilterModel;
  selectedClient: any[] = [];
  spaDetails: any[] = [];
  upComingServiceCall: any;

  spaTechForm: FormGroup;
  selectedValue: string = '';
  isClientSelected: boolean = false;
  spaBrands: { id: number; value: string }[] = [];
  //spaBrandId: any;
  spaModel: any[] = [];
  poolSpecialist: any[] = [];
  allSpaDetails: any[] = [];
  spaDetailList: any[] = [];


  adminToken: any;
  visitId: number = 0;
  clientId: number = 0;
  spaId: number = 0;
  technicianId: number = 0;
  technicianName: any;
  serialNo: any;
  purdateDate: string = '';
  warrentyDate: string = '';
  private confirmActionFn: () => void = () => { };
  actionbuttondata: any;
  isLoading = false;
  filterValue: any;
  spaBrandId: any;
  brandId: number = 0;
  modelId: number = 0;
  poolSpecilistId: number = 0;
  constructor(
    private route: ActivatedRoute,
    private techService: TechnicianService,
    private router: Router,
    private commonservice: CommonService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private toaster: ToastrService,
    private elementRef: ElementRef,

  ) {
    this.spaTechForm = new FormGroup('');
    this.filtermodel = new FilterModel();
    this.searchfiltermodel = new SearchFilterModel();
    this.translate.setDefaultLang('en');
  }
  ngOnInit() {
    this.queryPrms();
    this.createSpaForm();
    this.getSpaBrand(); // Only call this if the brand list is not already loaded
    this.getPoolSpecialist();
    this.getSpaDetailByVisitId(this.visitId);

 }
  
 
 
 
 
 queryPrms() {
    this.route.queryParams.subscribe(params => {
      this.convertToken(params['id']);
    });
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
    var parsedClientId = sessionStorage.getItem('clientId');
    if (parsedClientId !== null) {

      this.clientId = parseInt(parsedClientId);
    }
    
    var parsedSpaId = sessionStorage.getItem('spaId');
    if (parsedSpaId !== null) {

      this.spaId = parseInt(parsedSpaId);
    }

    var parsedTechnicianName = sessionStorage.getItem('technicianName');
    if (parsedTechnicianName !== null) {

      this.technicianName = parsedTechnicianName;
    }

  }
  createSpaForm(): void {
    this.spaTechForm = this.formBuilder.group({
      spaId: [0],
      spaBrand_id: [0],
      spaModel_id: [0],
      poolSpecialist_id: [0],
      serialNo: [''],
      purchaseDate: [''],
      warrantydate: [''],
      modifiedBy: ['']

    });



  }
  displayedSpaColumns: string[] = [
    'Brand',
    'Model',
    'Swimming pool worker',
    '#Series',
    'Purchase',
    'Guarantee',
  ];

  getSpaBrand() {
    
    this.techService.getSpaBrand().subscribe((response: any) => {
      if (response) {
        
        this.spaBrands = response.data;
      }
    });
  }
  getSpaModel(brandId: any) {
    this.spaBrandId = brandId;
    
    this.techService.getSpaModelByBrand(this.spaBrandId).subscribe((response: any) => {
      if (response) {
      this.spaModel = response.data;

      if (this.spaModel.length > 0) {
        const firstModelId = this.spaModel[0].id;
        this.spaTechForm.patchValue({ spaModel_id: firstModelId });
      }
      }

    });
  }
  // onSpaBrandChange(event: any): void {

  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   const value = parseInt(selectedValue, this.spaId);
  //   this.getSpaModel(value);
  // }


    onSpaBrandChange(event: any): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      const brandId = parseInt(selectedValue);
      this.spaModel = []; // Clear previous models
      this.getSpaModel(brandId);
    }
  }
  
  getPoolSpecialist() {
    
    this.techService.getPoolSpecialist().subscribe((response: any) => {
      if (response) {
        this.poolSpecialist = response.data;
      }
    });
  }

  getSpaDetailByVisitId(visitId: any): void {
    if (!visitId || visitId <= 0) {
      console.error('Invalid visitId');
      return;
    }
    
    this.techService.getSpaDetailByVisitId(visitId).subscribe(
      (response: any) => {
        if (response && response.value) {
        
          this.spaDetailList = response.value;
          this.allSpaDetails=response.value;
          this.spaId = this.allSpaDetails[0].spaId;
          if (this.spaDetailList && this.spaDetailList.length > 0) {
            var spaDetails = this.spaDetailList[0];
            this.brandId = spaDetails.spaBrand_id;
            this.modelId = spaDetails.spaModel_id;
            this.poolSpecilistId = spaDetails.poolSpecialist_id;

            this.getSpaModel(this.brandId);
            const purchaseDate = this.convertToDDMMYYYY(spaDetails.purchaseDate);
            const warrantyDate = this.convertToDDMMYYYY(spaDetails.warrantyDate);
            // Update form values
            this.spaTechForm.patchValue({
              spaId: this.spaId,
              spaBrand_id: this.brandId,
              spaBrand_label: spaDetails.spaBrand_label,
              spaModel_label: spaDetails.spaModel_label,
              poolSpecialist_abbreviation: spaDetails.poolSpecialist_abbreviation,
              spaModel_id: this.modelId,
              poolSpecialist_id: this.poolSpecilistId,
              serialNo: spaDetails.serialNo,
              
              modifiedBy: this.technicianName
            });
            this.spaTechForm.patchValue({
              ...this.spaTechForm.value,
              purchaseDate: purchaseDate,
              warrantydate: warrantyDate,
            });

          }
        }
      },
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  // convertToDDMMYYYY(dateString: string): string {
  //   
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  //   const year = date.getFullYear();
  //   return `${day}-${month}-${year}`;
  // }
  convertToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';
    
    // Split the date string by "/"
    const [day, month, year] = dateString.split('/');
  
    // Return the date in YYYY-MM-DD format
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  



  onUpdateSpaData(): void {
  
    this.isLoading = true; 
    const requestModel: any = this.spaTechForm.value;
    requestModel.spaId = this.spaId
    this.techService.updateSpaDetailByTechincian(requestModel).subscribe((Response: any) => {
  
      if (Response.statusCode === 200) {
        this.isLoading = false;
        this.getSpaDetailByVisitId(this.visitId);
        
        this.toaster.success('Spa detail updated successfully.', 'Success');
        
      }
      else {
        this.toaster.error('Failed to update spa details', 'Error');
        this.isLoading = false;
      }
    });

  }

  // onSpaBrandChange(event: any): void {
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   if (selectedValue) {
  //     const brandId = parseInt(selectedValue);
  //     this.spaModel = []; // Clear previous models
  //     this.getSpaModel(brandId);
  //   }
  // }
  
  // getSpaModel(brandId: number) {
  //   this.isLoading = true;
  //   this.techService.getSpaModelByBrand(brandId).subscribe(
  //     (response: any) => {
  //       this.isLoading = false;
  //       if (response && response.data) {
  //         this.spaModel = response.data;
  //       } else {
  //         this.spaModel = [];
  //         this.toaster.warning('No models found for the selected brand.', 'Warning');
  //       }
  //     },
  //     (error) => {
  //       this.isLoading = false;
  //       this.toaster.error('Failed to fetch models.', 'Error');
  //     }
  //   );
  // }
  




}
