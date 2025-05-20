import { Component, ElementRef } from '@angular/core';
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
export class ClientDetailsComponent {
  clientlist: any[] = [];
  searchclientlist: any[] = [];
  filtermodel: FilterModel;
  searchfiltermodel: SearchFilterModel;
  selectedClient: any[] = [];

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
    this.queryPrms();
    this.getClientDetailByVisitId();


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
  createClientForm(): void {
    this.clientTechForm = this.formBuilder.group({
      visitId: [0],
      clientId: [0],
      numClient: [''],
      isRaised: [true],
      clientName: [''],
       firstName: [''],
       lastName: [''],
      spouseFirstName: [''],
      spouseLastName: [''],
      apartNo: [''],
      streetNumber: [''],
      street: [''],
      city: [''],
      province_labelFr: [''],
      postalCode: [''],
      area_abbreviationFr: [''],
      home: [''],
      spouse: [''],
      work: [''],
      other: [''],
      ext1: [''],
      ext2: [''],
      ext3: [''],
      ext4: [''],
      comments: [''],
      notes: [''],
      modifiedBy: ['']

    });
     this.clientTechForm.get('numClient')?.disable();
     
     this.clientTechForm.get('clientName')?.disable();
     this.clientTechForm.get('firstName')?.disable();
     this.clientTechForm.get('lastName')?.disable();
     this.clientTechForm.get('spouseFirstName')?.disable();
     this.clientTechForm.get('spouseLastName')?.disable();
     this.clientTechForm.get('apartNo')?.disable();
     this.clientTechForm.get('streetNumber')?.disable();
     this.clientTechForm.get('street')?.disable();
     this.clientTechForm.get('city')?.disable();
     this.clientTechForm.get('province_labelFr')?.disable();
     this.clientTechForm.get('postalCode')?.disable();
     this.clientTechForm.get('area_abbreviationFr')?.disable();
     this.clientTechForm.get('home')?.disable();
     this.clientTechForm.get('spouse')?.disable();
     this.clientTechForm.get('work')?.disable();
     this.clientTechForm.get('other')?.disable();
    //  this.clientTechForm.get('numClient')?.disable();
    //  this.clientTechForm.get('numClient')?.disable();


  }
  getClientDetailByVisitId(): void {
    
    if (this.visitId > 0) {
      this.techService.getClientDetailForTechincian(this.visitId).subscribe((response: any) => {
        if (response.isSuccess  === true) {
          
          this.cltDetailList = response.value;
          var nts = response.value[0].notes;
          this.notes= nts;
          
          var cmt = response.value[0].comments;
          this.comments= cmt;

          this.numClient= response.value[0].numClient;
          var fName= response.value[0].firstName;
          this.firstName = fName;
          this.lastName = response.value[0].lastName;
          this.spouseFirstName = response.value[0].spouseFirstName;
          this.spouseLastName = response.value[0].spouseLastName;
          this.apartNo= response.value[0].apartNo;
          this.streetNumber = response.value[0].streetNumber;
          this.street = response.value[0].street;
          this.city = response.value[0].city;
          this.province_labelFr = response.value[0].province_labelFr;
          this.postalCode = response.value[0].postalCode;
          this.area_abbreviationFr = response.value[0].area_abbreviationFr;
          this.home = response.value[0].home;
          this.spouse = response.value[0].spouse;
          this.work = response.value[0].work;
          this.other = response.value[0].other;
        //  alert('Nclt:' + this.numClient + ', fName:' + this.firstName +  ', lastName:'  + this.lastName + ',city:' + this.city  + ', pin code:'  + this.postalCode +  'Notes:' + nts + ', commm:' + cmt);
          this.clientTechForm.patchValue({
            visitId: this.visitId,
            numClient:this.numClient,
           firstName:this.firstName,
           lastName:this.lastName,
           clientName: this.firstName + ' ' + this.lastName,
           spouseFirstName:this.spouseFirstName,
           spouseLastName:this.spouseLastName,
           apartNo:this.apartNo,
           streetNumber:this.streetNumber,
           street:this.street,
           city:this.city,
           province_labelFr:this.province_labelFr,
           postalCode:this.postalCode,
            area_abbreviationFr:this.area_abbreviationFr,
            home:this.home,
            spouse:this.spouse,
            work:this.work,
            other:this.other,
            notes: nts,
            comments: cmt,
            modifiedBy: this.technicianName
          });
        }

      });
    }

  }
  onUpdateClientData(): void {

    this.isLoading = true;

    const requestModel: any = this.clientTechForm.value;
    
    this.techService.updateClientDetailByTechincian(requestModel).subscribe((Response: any) => {
      
      if (Response.value.isSuccess === true) {
        this.isLoading = false;
        this.getClientDetailByVisitId();
        this.toaster.success('Client detail updated successfully.','Success');
        ///alert('Client detail updated successfully.');

      }
      else {
        this.toaster.error('Error updating client details','Error');
        this.isLoading = false;
      }
    });
  }
}
