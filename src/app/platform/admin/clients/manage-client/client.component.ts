import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ClientService } from '../client.service';
import { FilterModel, SearchFilterModel } from '../../../../core/models/common-model';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../core/services/common.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CustomDatePipe } from '../../../../shared/customDate/custom-date.pipe';
import { PhoneMaskDirective } from '../../../../shared/directives/phone-mask.directive';
import { DialogComponent } from '../../../../shared/dialog/dialog.component';
import { WhiteSpaceBlock } from '../../../../shared/validators/WhitespaceValidators';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
declare var window: any;

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    PhoneMaskDirective,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatSortModule,
    MatPaginatorModule
],

  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
})
export class ClientComponent {

  clientlist: any[] = [];
  searchclientlist: any[] = [];
  filtermodel: FilterModel;
  searchfiltermodel: SearchFilterModel;
  selectedClient: any[] = [];
  selectedClient1: boolean = true;
  spaDetails: any[] = [];
  upComingServiceCall: any;
  clientName: string = '';
  clientNumber: string = '';
  clientid: number = 0;
  clientForm: FormGroup;
  spaForm: FormGroup;
  selectedValue: string = '';

  
  allDataLoaded = false;
  //area: any[] = [];
  provinces: any[] = [];
  isClientSelected: boolean = false;
  MOBILE: string = '';
  isInputDisabled: boolean = true;
  isAddingNewClient = false; // To track the client form status
  selectedFilter: string = 'Name';
  isSearchDisabled: boolean = false;
  isButtonDisabled: boolean = true;
  isDeleteButtonDisabled = true;
  isdeletebutton = true;
  spaBrands: { id: number; value: string }[] = [];
  //spaBrandId: any;
  spaModel: any[] = [];
  poolSpecialist: any[] = [];
  allSpaDetails: any[] = [];
  spaId: number = 0;
  searchQuery: string = '';
  isSpaDeleteButtonDisabled = true;
  blacklist: any;
  isBlackListed = false;
  newClientnumber: any;
  hasClientNumberData = true;
  isSearchtable = false;
  deleteclient: any;
  modalTitle: string = '';
  modalMessage: string = '';
  confirmButtonText: string = 'Delete';
  private confirmActionFn: () => void = () => {};
  actionbuttondata: any;
  isLoading = false;
  filterValue: any;
  spaBrandId: any;
  OldServiceCall: any[]=[];
  adminToken: any;
  edit: any;
  dataSource = new MatTableDataSource<any>([]);
  spaDetailsdataSource = new MatTableDataSource<any>([]);
  newServicecallData = new MatTableDataSource<any>([]);
  language: any;
  currentLanguage: string = 'en'; // Default language
  private subscription: Subscription = new Subscription();
  
  @ViewChild('oldServicePaginator') oldServicePaginator!: MatPaginator;
  @ViewChild('spaPaginator') spaPaginator!: MatPaginator;
  @ViewChild('newServicecallPaginator') newServicecallPaginator!: MatPaginator;

  ngOnInit(): void {
    this.subscription = this.commonservice.languageChange$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
    this.getAllClientList();
    this.createformgroup();
    //this.getAllArea();
    this.getAllProvinces();
    this.queryPrms();
    this.createformgroup1();
    this.deleteclient = new window.bootstrap.Modal(
      document.getElementById('deleteclient')
    );
    this.getSpaBrand();
    this.getPoolSpecialist();
  }
  constructor(
    private clientservice: ClientService,
    private router: Router,
    private commonservice: CommonService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private toaster: ToastrService,
    private elementRef: ElementRef,
    private route : ActivatedRoute,
  ) {
    //this.clientlist = new Array<any>();
    this.clientForm = new FormGroup('');
    this.spaForm = new FormGroup('');
    this.filtermodel = new FilterModel();
    this.searchfiltermodel = new SearchFilterModel();
    this.translate.setDefaultLang('en');
  }
  @HostListener('window:click', ['$event'])
  onClick(event: Event) {
   const targetElement = event.target as HTMLElement;
   const inputElement = this.elementRef.nativeElement.querySelector('input');
   const searchTableDiv = this.elementRef.nativeElement.querySelector(
     '.table-responsive.search_table'
   );

   // Check if click is outside both the input element and search table div
   if (
     inputElement &&
     !inputElement.contains(targetElement) &&
     searchTableDiv &&
     !searchTableDiv.contains(targetElement)
   ) {
     this.isSearchtable = false;
   }
  }

  switchLanguage(lang: string) {
    this.translate.use(lang); // Switch language
  }

  displayedColumns: string[] = ['clientNumber', 'firstName', 'lastName'];
  displayedSearchColumns: string[] = [
    'clientNumber',
    'FirstName',
    'LastName',
    'SpouseFirstName',
    'SpouseLastName',
  ];

  displayedColumns1: string[] = [
    'serviceCallNumber',
    'receptionDate',
    'placementDate',
    'issueDescription',
    'serviceCallDescription',
  ];
  displayedColumns2: string[] = [
    'spaBrandName',
    'spaModelName',
    'poolSpecialistName',
  ];

  onHouseChange(event: any): void {
    ;
    this.selectedValue = event.target.value;
  }

  queryPrms() {
    this.route.queryParams.subscribe(params => {
      this.convertToken(params['id']);
    })
  }
  convertToken(token: any) {
    if (!token) {
      console.log('No token provided to convert');
      return;
    }
    
    try {
      this.adminToken = this.commonservice.decrypt(token);
      if (!this.adminToken) {
        console.log('Failed to decrypt token');
        return;
      }
      
      this.adminToken = this.adminToken.split('$'); // Assuming there's more than one part
      if (!this.adminToken || this.adminToken.length === 0) {
        console.log('Invalid token format after split');
        return;
      }
      
      const clientIdString = this.adminToken[0]; // Adjust index if needed
      if (!clientIdString) {
        console.log('Missing client ID in token');
        return;
      }
      
      const parsedClientId = JSON.parse(clientIdString);
      if (parsedClientId && parsedClientId.clientId) {
        this.clientid = parsedClientId.clientId;
        this.edit = parsedClientId.data;
        if(this.edit === 'edit'){
          this.selectClient(this.clientid);
        }
      }
    } catch (error) {
      console.error('Error processing token:', error);
    }
  }
  
onChange(){
  
  this.searchQuery = '';

  this.getAllClientList()
}
selectClient(event : any){
  
  this.isButtonDisabled = false;
  
  if(event == 'Yes'){
    this.isSearchtable = false;
    this.searchQuery= '';
  }
  else
  {
    console.log('Select client event:', event);
    // Convert clientID to clientId if needed
    this.clientid = event.clientID || event.ClientID || event;
    console.log('Using client ID:', this.clientid);
    
    this.clientservice.getClientDataById(this.clientid).subscribe({
      next: (response : any) => {
        console.log('Client data response:', response);
        if(response.isSuccess == true || response.Value)
        {
          // Handle both lowercase 'value' and uppercase 'Value'
          this.selectedClient = response?.value || response?.Value || [];
          console.log('Selected client data:', this.selectedClient);
          
          if(this.filterValue != '' && this.filterValue!=undefined){
            this.getClientById();
          }
          
          this.blacklist = (response?.value || response?.Value || [])[0]?.blackList;
          if(this.blacklist == true){
            this.isBlackListed = true;
          }
          else{
            this.isBlackListed = false;
          }
          
          if (this.selectedClient && this.selectedClient.length > 0) {
            console.log('Patching form with data:', this.selectedClient[0]);
            this.clientForm.patchValue(this.selectedClient[0]);
            if (!this.selectedClient[0].house || !this.selectedClient[0].streetNumber) {
              this.clientForm.patchValue({
                house: '2'
              });
            }
          } else {
            console.error('No client data available to display');
          }
          
          this.isAddingNewClient=true;
          this.getOldServiceCall();
          this.getUpcomingServiceCall();
          this.getSpaDetails();
          this.isClientSelected = true;
          this.enableFormFields();
        }
        else 
        {
          console.error('Failed to get client data, isSuccess=false');
          this.clientForm.reset();
          this.isClientSelected = false;
        }
      },
      error: (err) => {
        console.error('Error fetching client data:', err);
        this.clientForm.reset();
        this.isClientSelected = false;
      }
    });
  }
}

createformgroup(){
  
  this.clientForm = this.formBuilder.group({
    clientNumber: [{ value: '', disabled: true },[Validators.required]],
    firstName: [{ value: '', disabled: true }, [Validators.required]],
    lastName: [{ value: '', disabled: true },[Validators.required]],
    blackList: [{ value: false, disabled: true },],
    spouseFirstName: [{ value: '', disabled: true }],
    spouseLastName: [{ value: '', disabled: true }],
    raisedSpa: [{ value: false, disabled: true }],
    app: [{ value: '', disabled: true }],
    civic: [{ value: '', disabled: true }],
    street: [{ value: '', disabled: true }],
    city: [{ value: '', disabled: true }],
    province: [{ value: '9', disabled: true }],
    postalCode: [{ value: '', disabled: true }],
    //area: [{ value: '', disabled: true },[Validators.required]],
    house: [{ value: '2', disabled: true }],
    streetNumber: [{ value: '', disabled: true },[Validators.required]],
    home: [{ value: '', disabled: true }],
    ext1: [{ value: '', disabled: true }],
    spouse: [{ value: '', disabled: true }],
    ext2: [{ value: '', disabled: true }],
    work: [{ value: '', disabled: true }],
    ext3: [{ value: '', disabled: true }],
    other: [{ value: '', disabled: true }],
    ext4: [{ value: '', disabled: true }],
    primaryEmail: [{ value: '', disabled: true },[Validators.email]],
    secondaryEmail: [{ value: '', disabled: true }, [Validators.email]],
    notes: [{ value: '', disabled: true }],
    comments: [{ value: '', disabled: true }],
    externalbreaker:[{ value: false, disabled: true }],
    both : [{ value: false, disabled: true }],
    sms : [{ value: false, disabled: true }],
    emailClient : [{ value: false, disabled: true }]
    
  });
}
createformgroup1(){
  this.spaForm = this.formBuilder.group({
    spaBrandLabel:['',Validators.required],
    spaModelLabel:['',Validators.required],
    poolSpecialistNAme : ['',Validators.required],
    series:['',Validators.required],
    purchaseDate : ['',Validators.required],
    warrantydate:['']
  })
}

  get primaryEmail() {
    return this.clientForm.get('primaryEmail');
  }

  get secondaryEmail() {
    return this.clientForm.get('secondaryEmail');
  }

  get fb() {
    return this.clientForm.controls;
  }

  //getAllArea() {
  //  this.clientservice.getAllArea().subscribe((response: any) => {
  //    if (response.isSuccess == true) {
  //      this.area = response.value;
  //    }
  //  });
  //}
  getAllProvinces() {
    this.clientservice.getAllProvinces().subscribe((response: any) => {
      if (response.isSuccess == true) {
        this.provinces = response.value || response.Value || [];
      }
    });
  }
  removefilter(){
    
    this.searchQuery = '';
    this.filterValue = '';
    this.selectedFilter='Name';
    this.getAllClientList();
  }

  @ViewChild('firstInput') firstInputField!: ElementRef;

  addNewClient() {
    this.isAddingNewClient = false;
    this.isBlackListed = false;
    this.clientid = 0;
    this.isButtonDisabled = false;
    this.selectedClient1 = true;
    this.isDeleteButtonDisabled = true;
    this.clientForm.reset({
      house: '2',
      province: '9',
      //area: '',
    });
    this.searchQuery = '';
    //this.selectedClient = [];
    this.getAllClientList();
    this.enableFormFields();
    if (this.firstInputField) {
      this.firstInputField.nativeElement.focus();
    }
  }
  enableFormFields() {
    this.clientForm.enable();
  }

applyFilter(event: any) {
  ;
  this.filterValue = event.target.value.trim().toLowerCase();

  if (this.filterValue.length > 0) {
    if (this.selectedFilter === '' ? 'Name' : this.selectedFilter) {
      this.setPaginatorModel(this.filterValue, this.selectedFilter);
      this.clientservice.getClientBySearch(this.searchfiltermodel).subscribe((response: any) => {
        if (response.isSuccess) {
          this.isSearchtable = true;
          this.searchclientlist = response.value;
          
        }
      });
    }
  } else {
    this.isSearchtable = false;
    this.getAllClientList();
  }
}

  setPaginatorModel(searchText: string, selectedvalue: string) {
    
    this.searchfiltermodel.text = searchText;
    this.searchfiltermodel.searchBy = selectedvalue;
  }
  getOldServiceCall() {
    
    this.clientservice
      .getOldServiceCall(this.clientid)
      .subscribe((response: any) => {
        if (response) {
          this.dataSource.data = response.value || response.Value || [];
          this.dataSource.paginator = this.oldServicePaginator;
          this.OldServiceCall = response.value || response.Value || [];
          this.isAddingNewClient = true;
        }
      });
  }
  getUpcomingServiceCall() {
    this.clientservice
      .getUpcomingServiceCall(this.clientid)
      .subscribe((response: any) => {
        if (response) {

          this.newServicecallData.data = response.data.serviceCall;
          this.newServicecallData.paginator = this.newServicecallPaginator;
          this.upComingServiceCall = response.data.serviceCall;
          //this.selectedClient = true;
          this.isAddingNewClient = true;
        }
      });
  }
  getSpaDetails() {
   
    this.clientservice
      .getSpaDetails(this.clientid)
      .subscribe((response: any) => {
        if (response) {
          
          this.spaDetailsdataSource.data = response.data.spas;
          this.spaDetailsdataSource.paginator = this.spaPaginator;
          this.spaDetails = response.data.spas;
          this.isAddingNewClient = true;
        }
      });
  }

  getClientById(){
    
    this.clientservice.getClientById(this.clientid ).subscribe((response : any) => {
      if(response.isSuccess == true)
      {
        this.clientlist = response.value || response.Value || [];
      }
    })
  }


  getAllClientList() {
    
    this.isLoading = true;
    console.log('Fetching client list...');
    setTimeout(() => {
    this.clientservice
      .getAllClientList()
      .subscribe({
        next: (response: any) => {
          console.log('Raw API response:', response);
          if (response && (response.isSuccess === true || response.Value)) {
            // Handle both lowercase 'value' and uppercase 'Value'
            let clientData = response.value || response.Value || [];
            console.log('Client data extracted:', clientData);
            
            // Transform data if needed to match expected format
            if (clientData.length > 0 && 'ClientID' in clientData[0]) {
              console.log('Transforming field names from uppercase to lowercase');
              this.clientlist = clientData.map((client: any) => ({
                clientID: client.ClientID,
                clientNumber: client.ClientNumber,
                firstName: client.FirstName,
                lastName: client.LastName,
                totalRecords: client.TotalRecords || 0
              }));
            } else {
              this.clientlist = clientData;
            }
            
            console.log('Final client list:', this.clientlist);
            
            // Update the MatTableDataSource
            const dataSource = new MatTableDataSource<any>(this.clientlist);
            Object.assign(this.clientlist, { data: this.clientlist, paginator: this.oldServicePaginator });
          } else {
            console.error('Invalid response format:', response);
            this.clientlist = [];
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching client list:', err);
          this.isLoading = false;
        }
      });
    }, 100);
  }

  showConfirmationModal(
    title: string,
    message: string,
    confirmAction: () => void
  ) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.confirmActionFn = confirmAction;
    this.deleteclient.show();
  }

  actionbutton(event: any) {
    
    this.actionbuttondata = event;
    if (event == 'deleteclient') {
      {
        if((!this.OldServiceCall || this.OldServiceCall.length === 0) &&
          (!this.upComingServiceCall || this.upComingServiceCall.length === 0)){
            this.isdeletebutton = true;
          this.showConfirmationModal(
            this.translate.instant('MODAL.ConfirmDelete'),
            this.translate.instant('MODAL.DeleteClient'),
            () => this.deleteClient()
          );
        } else {
          this.isdeletebutton = false;
          this.showConfirmationModal(
            'Attention!',
            this.translate.instant('MODAL.AttnClient'),
            () => this.deleteClient()
          );
        }
      }
    } else {
        const btnSamElement = document.getElementById('btnsam');
        if (btnSamElement) {
          btnSamElement.click();
        }
      this.isdeletebutton = true;
      this.showConfirmationModal(
        this.translate.instant('MODAL.ConfirmDelete'),
        this.translate.instant('MODAL.DeleteSpa'),
        () => this.deleteSpa()
      );
    }
  }
  deleteClient() {
    ;

    this.clientservice
      .DeleteClient(this.clientid)
      .subscribe((response: any) => {
        if (response.isSuccess == true) {
          this.toaster.success('Client Deleted successfully', 'Success');
          const btnSamElement = document.getElementById('closemodal');
          if (btnSamElement) {
            btnSamElement.click();
          }
          this.getAllClientList();
          this.clientForm.reset({
            house: '2',
            province: '9',
            //area: '',
          });
          this.isBlackListed = false;
          this.isAddingNewClient = false;
        }
      });
  }

  deleteSpa() {
    ;
    this.deleteclient.show();
    this.clientservice.DeleteSpa(this.spaId).subscribe((response: any) => {
      if (response.isSuccess == true) {
        this.toaster.success('Spa Deleted successfully', 'Success');
        this.getSpaDetails();
        const btnSamElement = document.getElementById('closemodal');
        if (btnSamElement) {
          btnSamElement.click();
        }
      } else {
        this.toaster.error('Spa not Delete', 'error');
      }
    });
  }

  confirmDeleteSpa(event: any) {
    ;
    if (event == 'client' && this.actionbuttondata == 'deleteclient') {
      this.deleteClient();
    } else {
      this.deleteSpa();
    }
  }
addnewSpaDetail(){
  this.isSpaDeleteButtonDisabled = true;
  this.spaId = 0;
  
  // Set default brand ID 53 and get models for this brand
  const defaultBrandId = 53;
  this.getSpaModel(defaultBrandId);
  
  // Reset form with default values
  this.spaForm.reset({
    spaBrandLabel: defaultBrandId.toString(),
    spaModelLabel: '',
    poolSpecialistNAme: ''
    // warrantydate field intentionally omitted
  });
  
  // After models are loaded, set default model ID
  setTimeout(() => {
    if (this.spaModel && this.spaModel.length > 0) {
      // Find if model 223 exists in the models list
      const modelExists = this.spaModel.some(model => model.id == 223);
      if (modelExists) {
        this.spaForm.patchValue({
          spaModelLabel: '223'
        });
      }
    }
  }, 500);
}
  getSpaBrand() {
    this.clientservice.getSpaBrand().subscribe((response: any) => {
      if (response && response.data) {        
        this.spaBrands = response.data.sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);     
      } else if (response && (response.value || response.Value)) {
        this.spaBrands = (response.value || response.Value).sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      }
    });
  }

  // To get spa dropdown data
  getSpaModel(brandId:any){
    this.spaBrandId = brandId;
    this.clientservice.getSpaModelByBrand(this.spaBrandId).subscribe((response: any) => {
      if (response && response.data){
        this.spaModel = response.data.sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      }
    });
  }

  onSpaBrandChange(event: any): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      const value = parseInt(selectedValue, 10);
      if (!isNaN(value)) {
        this.getSpaModel(value);
      }
    }
  }

  getPoolSpecialist() {
    this.clientservice.getPoolSpecialist().subscribe((response: any) => {
      if (response && response.data) {
        this.poolSpecialist = response.data.sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      } else if (response && (response.value || response.Value)) {
        this.poolSpecialist = (response.value || response.Value).sort((a: { id: number; value: string }, b: { id: number; value: string }) => 
          a?.value && b?.value ? a.value.localeCompare(b.value) : 0);
      }
    });
  }
  getSpaDetailsByClientId(spaId :any) {
    this.isLoading = true;
    this.clientservice
      .getSpaDetailsByClientId(spaId)
      .subscribe((response: any) => {
        if (response.isSuccess == true) {
          
          this.isSpaDeleteButtonDisabled = false;
          this.spaId = response.value.spaId;
          
          // Format dates if needed
          const purchaseDate = this.formatDate(response.value.purchaseDate);
          const warrantyDate = this.formatDate(response.value.warrantyDate);
          
          // Check if spaBrandLabel exists, if not use default (53)
          const brandId = response.value.spaBrandLabel || 53;
          this.getSpaModel(brandId);
          
          this.spaForm.reset();
          setTimeout(() => {
            // Check if spaModelLabel exists, if not use default (223)
            const modelId = response.value.spaModelLabel || '223';
            
            this.spaForm.patchValue({
              spaBrandLabel: brandId,
              spaModelLabel: modelId,
              poolSpecialistNAme: response.value.poolSpecialistNAme || '',
              series: response.value.serialNo || '',
              purchaseDate: purchaseDate,
              warrantydate: warrantyDate
            });
            this.isLoading = false
          }, 1500);
          
        }
      });
  }


  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  blockwhitespaces(event: any) {
    WhiteSpaceBlock(event);
  }

  ScRedirect() {
    
    if(this.clientid>0){
      const queryParams = {
        clientId: this.clientid,
        newservicecall : true
      };
      const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
      );
      this.router.navigate(['/web/admin/service-call'], {
        queryParams: { id: encryptedParams },
      });
    }
    else{
      this.router.navigate(['/web/admin/service-call'])
    }
    
  }
  servicecall(event:any){
    
    const queryParams = {
      clientId: this.clientid,
      serviceCallId:event.serviceCallId,
      additionValue:''
    };
    const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
    );
    this.router.navigate(['/web/admin/service-call'], {
      queryParams: { id: encryptedParams },
    });
  }

onSubmit(){
  
  const requestModel: any = this.clientForm.value;
  ['work', 'streetNumber' ,'spouse', 'home', 'other'].forEach(field => {
    if (requestModel[field]) {
      requestModel[field] = requestModel[field].replace(/\D/g, '');
    }
  })
  Object.keys(requestModel).forEach((key) => {
    if (requestModel[key] === "") {
      requestModel[key] = null;
    } else if (typeof requestModel[key] === 'string') {
      requestModel[key] = requestModel[key].toUpperCase();
    }
  });
  
  if(this.clientForm.valid){
  
  if(this.clientid> 0){
    requestModel.clientId = this.clientid;
    this. isLoading = true;
    setTimeout(() => {
      
    this.clientservice.updateclient(requestModel).subscribe(( Response: any ) =>{
      if(Response.value.isSuccess == true)
      {
          this.isBlackListed = false;
          this.isAddingNewClient=true;
         this.toaster.success('Client Updated successfully');
         
         this.getAllClientList();
         setTimeout(() => {
          this.selectClient({ clientID: this.clientid });
        }, 300);
        this. isLoading=false;
         this.searchQuery = '';
      }
      else{
        this.toaster.error(Response.value.error.message);
      }
    })
  }, 100);
  }
else{
  this.clientservice.createClient(requestModel).subscribe((Response : any ) =>{
  if(Response.value.isSuccess == true){
    this.toaster.success('Client created Successfully');
    this.newClientnumber = requestModel.clientNumber;
    this.showclientnumberdata(this.newClientnumber);
    
  }
  else{
    this.toaster.error(Response.value.error.message);
    this.getAllClientList();
  }
})
}
}
else {
  // Check if any fields are invalid
  const firstInvalidControl = Object.keys(this.clientForm.controls).find(control => {
    return this.clientForm.controls[control].invalid;
  });

  if (firstInvalidControl) {
    window.scrollTo(0, 0); // Scroll to the first invalid control
    this.clientForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
  }

  return;
}
}
showclientnumberdata(newClientnumber:any){
  
if(this.newClientnumber){
  this.selectedFilter = 'Client Number';
  this.hasClientNumberData = true;
  this.searchQuery = this.newClientnumber;
  this.searchClients();
}
}

  searchClients() {
    
    if (this.searchQuery) {
      this.setPaginatorModel(this.searchQuery, this.selectedFilter);
      this.clientservice
        .getClientBySearch(this.searchfiltermodel)
        .subscribe((response: any) => {
          if (response.isSuccess) {
            this.clientlist = response.value;
            if (this.clientlist.length > 0) {
              this.selectClient(this.clientlist[0]);
            }
          }
        });
    }
  }
  onSubmitspa() {
    ;
    if (this.spaForm.valid) {
      const requestModel: any = this.spaForm.value;
      requestModel.spaBrandLabel = typeof requestModel.spaBrandLabel === 'string' ? requestModel.spaBrandLabel : String(requestModel.spaBrandLabel);
      requestModel.spaModelLabel = typeof requestModel.spaModelLabel === 'string' ? requestModel.spaModelLabel : String(requestModel.spaModelLabel);
      requestModel.clientId = this.clientid;
      requestModel.purchaseDate = this.formatDate(requestModel.purchaseDate);
      // Still include warrantydate in the request if it exists
      if (requestModel.warrantydate) {
        requestModel.warrantydate = this.formatDate(requestModel.warrantydate);
      } else {
        requestModel.warrantydate = null;
      }
      if (this.spaId > 0) {
        requestModel.spaId = this.spaId;
        this.clientservice
          .updateSpaDetails(requestModel)
          .subscribe((response: any) => {
            if (response.isSuccess) {
              this.toaster.success('Spa Updated successfully');
              this.getSpaDetails();
              const btnSamElement = document.getElementById('btnsam');
              if (btnSamElement) {
                btnSamElement.click();
              }
            }
          });
      } else {
        this.clientservice
          .saveSpaDetails(requestModel)
          .subscribe((response: any) => {
            if (response.isSuccess) {
              this.toaster.success('SPA Added Successfully.');
              this.spaId = response.value.spaId;
              this.getSpaDetails();
              const btnSamElement = document.getElementById('btnsam');
              if (btnSamElement) {
                btnSamElement.click();
              }
            }
          });
      }
    }
    else{
      window.scrollTo(0, 0); //scroll to the first invalid control 
       this.spaForm.markAllAsTouched(); // Mark all controls as touched to show validation errors
            return;
    }
  }
  removeBraces(event: any) {
    
    const formName = event.target.name;
    const formData = event.target.value;

    const cleanedPhone = formData.replace(/\D/g, '');
    this.clientForm.patchValue({ [formName]: cleanedPhone }); // Update the control value here
    if (cleanedPhone.length === 0) {
      this.clientForm.patchValue({ [formName]: '' });
    }
  }
  formatPostalCode(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.toUpperCase();

    // Remove any non-alphanumeric characters
    value = value.replace(/[^A-Za-z0-9]/g, '');

    // Enforce the format: A0A 0A0
    const formattedValue = [];

    for (let i = 0; i < value.length && i < 6; i++) {
      if (i === 3) {
        // Add space after the third character
        formattedValue.push('  ');
      }
      if (i % 2 === 0) {
        // Even index - should be alphabetical
        if (/[A-Za-z]/.test(value[i])) {
          formattedValue.push(value[i]);
        }
      } else {
        // Odd index - should be numeric
        if (/\d/.test(value[i])) {
          formattedValue.push(value[i]);
        }
      }
    }

    // Join the formatted value into a string
    inputElement.value = formattedValue.join('');
  }


   
//Angular Mat Sorting 
sortData(sort: Sort) {
  
  const data = this.clientlist.slice();
  if (!sort.active || sort.direction === '') {
    this.clientlist = data;
    return;
  }

  this.clientlist = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'clientNumber': return this.compare(a.clientNumber, b.clientNumber, isAsc);
      case 'firstName': return this.compare(a.firstName, b.firstName, isAsc);
      case 'lastName': return this.compare(a.lastName, b.lastName, isAsc);
      default: return 0;
    }
  });
}

compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}


sortServiceData(sort: Sort) {
  
  const data = this.selectedClient.slice();
  if (!sort.active || sort.direction === '') {
    this.selectedClient = data;
    return;
  }

  this.selectedClient = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'serviceCallNumber': return this.compare(a.serviceCallNumber, b.serviceCallNumber, isAsc);
      case 'receptionDate': return this.compare(a.receptionDate, b.receptionDate, isAsc);
      case 'placementDate': return this.compare(a.placementDate, b.placementDate, isAsc);
      case 'issueDescription': return this.compare(a.issueDescription, b.issueDescription, isAsc);
      case 'serviceCallDescription': return this.compare(a.serviceCallDescription, b.serviceCallDescription, isAsc);
      default: return 0;
    }
  });
}



sortUpcomingServiceData(sort: Sort) {
  
  const data = this.selectedClient.slice();
  if (!sort.active || sort.direction === '') {
    this.selectedClient = data;
    return;
  }

  this.selectedClient = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'serviceCallNumber': return this.compare(a.serviceCallNumber, b.serviceCallNumber, isAsc);
      case 'receptionDate': return this.compare(a.receptionDate, b.receptionDate, isAsc);
      case 'placementDate': return this.compare(a.placementDate, b.placementDate, isAsc);
      case 'issueDescription': return this.compare(a.issueDescription, b.issueDescription, isAsc);
      case 'serviceCallDescription': return this.compare(a.serviceCallDescription, b.serviceCallDescription, isAsc);
      default: return 0;
    }
  });
}


sortSpaData(sort: Sort) {
  
  const data = this.spaDetails.slice();
  if (!sort.active || sort.direction === '') {
    this.spaDetails = data;
    return;
  }

  this.spaDetails = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'spaBrandName': return this.compare(a.spaBrandName, b.spaBrandName, isAsc);
      case 'spaModelName': return this.compare(a.spaModelName, b.spaModelName, isAsc);
      case 'poolSpecialistName': return this.compare(a.poolSpecialistName, b.poolSpecialistName, isAsc);
      default: return 0;
    }
  });
}
preventMultipleSpaces(event: KeyboardEvent): void {
  
  const input = (event.target as HTMLInputElement).value;

  // Prevent typing a space if the last character is already a space
  if (event.key === ' ' && input.endsWith(' ')) {
    event.preventDefault();
  }
}

sanitizeInput(): void {
  if (this.searchQuery) {
    // Ensure that extra spaces after punctuation are removed on the fly
    this.searchQuery = this.searchQuery.replace(/(\.|\?|!)\s{2,}/g, '$1 ');
  }
}

}



