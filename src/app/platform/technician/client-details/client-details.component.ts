import { Component, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FilterModel, SearchFilterModel } from '../../../core/models/common-model';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TechnicianService } from '../technician.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../core/services/common.service';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatTableModule],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent implements OnInit, OnChanges {
  @Input() clientData: any;
  clientlist: any[] = [];
  searchclientlist: any[] = [];
  filtermodel: FilterModel;
  searchfiltermodel: SearchFilterModel;
  selectedClient: any[] = [];
  provinces: any[] = [];

  upComingServiceCall: any;
  clientTechForm: FormGroup;
  selectedValue: string = '';
  isClientSelected: boolean = false;

  poolSpecialist: any[] = [];
  cltDetailList: any[] = [];
  adminToken: any;
  visitId: number = 0;
  clientId: number = 0;
  spaId: number = 0;
  technicianId: number = 0;
  technicianName: string = '';
  private confirmActionFn: () => void = () => { };
  actionbuttondata: any;
  isLoading = false;
  filterValue: any;
  numClient: string='';
  isRaised: boolean=true;
  firstName:string='';
  lastName: string='';
  spouseFirstName: string='';
  spouseLastName:string='';
  apartNo: string='';
  streetNumber: string='';
  street: string='';
  city: string='';
  province_labelFr: string='';
  postalCode: string='';
  area_abbreviationFr: string='';
  home: string='';
  spouse: string='';
  work: string='';
  other: string='';
  ext1: string='';
  ext2:string='';
  ext3:string='';
  ext4: string='';
  comments:string='';
  notes: string='';
  modifiedBy:string='';

  constructor(
    private route: ActivatedRoute,
    private techService: TechnicianService,
    private commonservice: CommonService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private toaster: ToastrService,
    private elementRef: ElementRef
  ) {
    this.clientTechForm = new FormGroup('');
    this.filtermodel = new FilterModel();
    this.searchfiltermodel = new SearchFilterModel();
    this.translate.setDefaultLang('en');
    this.createClientForm();
  }

  ngOnInit() {
    if (this.clientData) {
      this.updateFormWithClientData();
    }
    this.queryPrms();
    this.getAllProvinces();
    this.getClientDetailByVisitId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clientData'] && changes['clientData'].currentValue) {
      this.updateFormWithClientData();
    }
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
    // alert('visitId:' + this.visitId + ', clietId:' + this.clientId + ', spaId:' + this.spaId + ', techId:' + this.technicianId);
  }

  private createClientForm() {
    this.clientTechForm = this.formBuilder.group({
      numClient: [''],
      clientName: [''],
      lastName: [''],
      apartNo: [''],
      streetNumber: [''],
      street: [''],
      city: [''],
      province_labelFr: [''],
      postalCode: [''],
      home: [''],
      spouse: [''],
      work: [''],
      other: [''],
      notes: [''],
      comments: [''],
      externalBreaker: [false],
      spaLifted: [false]
    });

    // Add value change subscriptions to log changes
    this.clientTechForm.get('externalBreaker')?.valueChanges.subscribe(value => {
      console.log('ExternalBreaker value changed:', value);
    });
    this.clientTechForm.get('spaLifted')?.valueChanges.subscribe(value => {
      console.log('SpaLifted value changed:', value);
    });
  }

  private updateFormWithClientData() {
    console.log('Updating form with client data:', this.clientData);
    if (this.clientData) {
      const province = this.provinces.find(p => p.id === parseInt(this.clientData.province));
      const formData = {
        numClient: this.clientData.clientNumber || '',
        clientName: this.clientData.firstName || '',
        lastName: this.clientData.lastName || '',
        apartNo: this.clientData.app || '',
        streetNumber: this.clientData.civic || '',
        street: this.clientData.street || '',
        city: this.clientData.city || '',
        province_labelFr: province ? province.name : '',
        postalCode: this.clientData.postalCode || '',
        home: this.clientData.home || '',
        spouse: this.clientData.spouse || '',
        work: this.clientData.work || '',
        other: this.clientData.other || '',
        notes: this.clientData.notes || '',
        comments: this.clientData.comments || '',
        externalBreaker: this.clientData.isExternalBreaker === true,
        spaLifted: this.clientData.raisedSpa === true
      };
      console.log('Setting form values:', formData);
      this.clientTechForm.patchValue(formData);
    }
  }

  getAllProvinces() {
    this.techService.getAllProvinces().subscribe({
      next: (response: any) => {
        if (response.isSuccess == true) {
          this.provinces = response.value || response.Value || [];
        }
      },
      error: (error) => {
        console.error('Error fetching provinces:', error);
      }
    });
  }

  getClientDetailByVisitId(): void {
    this.techService.getClientDetailForTechnician(this.clientId).subscribe({
      next: (response: any) => {
        if (response) {
          this.clientData = response;
          console.log('Full client data:', this.clientData);
          const province = this.provinces.find(p => p.id === parseInt(this.clientData.province));
          this.clientTechForm.patchValue({
            numClient: this.clientData.clientNumber,
            clientName: this.clientData.firstName,
            lastName: this.clientData.lastName,
            apartNo: this.clientData.app,
            streetNumber: this.clientData.civic,
            street: this.clientData.street,
            city: this.clientData.city,
            province_labelFr: province ? province.name : '',
            postalCode: this.clientData.postalCode,
            home: this.clientData.home,
            spouse: this.clientData.spouse,
            work: this.clientData.work,
            other: this.clientData.other,
            notes: this.clientData.notes,
            comments: this.clientData.comments,
            externalBreaker: this.clientData.isExternalBreaker === true,
            spaLifted: this.clientData.raisedSpa === true
          });
          console.log('External breaker value:', this.clientData.raisedSpa);
        }
      },
      error: (error) => {
        console.error('Error fetching client details:', error);
      }
    });
  }

  private clearClientFields(): void {
    this.notes = '';
    this.comments = '';
    this.numClient = '';
    this.firstName = '';
    this.lastName = '';
    this.spouseFirstName = '';
    this.spouseLastName = '';
    this.apartNo = '';
    this.streetNumber = '';
    this.street = '';
    this.city = '';
    this.province_labelFr = '';
    this.postalCode = '';
    this.area_abbreviationFr = '';
    this.home = '';
    this.spouse = '';
    this.work = '';
    this.other = '';
    
    // Reset form
    this.clientTechForm.reset();
  }

  onUpdateClientData(): void {
    if (!this.clientTechForm.valid) {
      this.toaster.error('Please fill in all required fields', 'Error');
      return;
    }

    this.isLoading = true;
    
    // Log the raw form values first
    console.log('Raw form values:', {
      externalBreaker: this.clientTechForm.get('externalBreaker')?.value,
      spaLifted: this.clientTechForm.get('spaLifted')?.value
    });

    const formData = {
      ...this.clientData,
      ...this.clientTechForm.value,
      visitId: this.visitId,
      modifiedBy: localStorage.getItem('userName') || 'System'
    };

    // Set both uppercase and lowercase versions of the checkbox values
    const externalBreakerValue = Boolean(this.clientTechForm.get('externalBreaker')?.value);
    const raisedSpaValue = Boolean(this.clientTechForm.get('spaLifted')?.value);
    
    formData.IsExternalBreaker = externalBreakerValue;
    formData.isExternalBreaker = externalBreakerValue;
    formData.IsRaisedSpa = raisedSpaValue;
    formData.raisedSpa = raisedSpaValue;
    
    // Log the final data being sent
    console.log('Final data being sent:', {
      IsExternalBreaker: formData.IsExternalBreaker,
      isExternalBreaker: formData.isExternalBreaker,
      IsRaisedSpa: formData.IsRaisedSpa,
      raisedSpa: formData.raisedSpa,
      rawFormValues: this.clientTechForm.value,
      clientData: this.clientData
    });
    
    this.techService.updateClientDetailByTechincian(formData).subscribe({
      next: (response: any) => {
        if (response?.value?.isSuccess === true) {
          this.toaster.success('Client details updated successfully', 'Success');
          // Log the response
          console.log('Update response:', response);
        } else {
          this.toaster.error('Error updating client details', 'Error');
          console.error('Update failed:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating client details:', error);
        this.toaster.error('Error updating client details', 'Error');
        this.isLoading = false;
      }
    });
  }

  getFormControl(controlName: string): FormControl<boolean> {
    const control = this.clientTechForm.get(controlName);
    if (!control) {
      return new FormControl<boolean>(false, { nonNullable: true });
    }
    return control as FormControl<boolean>;
  }
}
