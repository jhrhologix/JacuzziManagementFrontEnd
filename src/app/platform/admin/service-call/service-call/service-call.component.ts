
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonService } from '../../../../core/services/common.service';
import { ServiceCallService } from '../service-call.service';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { AddServiceCallComponent } from '../add-service-call/add-service-call.component';
import { ClientService } from '../../clients/client.service';
import { SearchFilterModel } from '../../../../core/models/common-model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ServiceCallModel } from '../servicecall-model';
declare var window: any;
@Component({
  selector: 'app-service-call',
  standalone: true,
  imports: [MatTableModule,
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            TranslateModule,
            MatIconModule,
            AddServiceCallComponent,
            MatPaginatorModule],
  templateUrl: './service-call.component.html',
  styleUrl: './service-call.component.scss',
})

export class ServiceCallComponent {

  displayedColumns: string[] = [
    'Clientid',
    'appelService',
    'dateRec',
    'datePlacement',
    'probleme',
    'statut',
    'edit',
    'delete',
  ];
  displayedSearchColumns1: string[] = [
    'clientNumber',
    'FirstName',
    'LastName',
    'SpouseFirstName',
    'SpouseLastName',
  ];
  
  serviceCallForm: FormGroup;
  adminToken: any;
  clientId: any;
  isaddclient = false;
  ServiceCallByClientId: any;
  filterValue: any;
  selectedFilter: string='Name';
  isSearchtable = false;
  searchfiltermodel: SearchFilterModel;
  searchclientlist: any[]=[];
  searchQuery: string='';
  serviceCallId: any;
  serviceCallIdToDelete: number = 0;
  //secondModal: any;
  secondModalnew:any;
  isLoading = false;
  isselectedclient = false;
  servicecalldelete = false;
  newservicecall :any;
  modalTitle: string = '';
  modalMessage: string = '';
  additionValue: any;
  emailAddress: any;
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild('createUserModal') createUserModal!: ElementRef;
  
constructor(
    private route : ActivatedRoute,
    private router: Router,
    private commonservice : CommonService,
    private servicecallservice : ServiceCallService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private clientservice : ClientService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private translate: TranslateService
  ) {
    this.serviceCallForm = new FormGroup('');
    this.searchfiltermodel = new SearchFilterModel();
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
  
  ngOnInit(){
    
    this.queryPrms();
    this.getclientdetail();
    this.createformgroup();
    this.getServiceCallByClientId();
    // this.secondModal = new window.bootstrap.Modal(
    //   document.getElementById('secondModal')
    // );
    this.secondModalnew = new window.bootstrap.Modal(
      document.getElementById('secondModalnew')
    );
    
  }


  createformgroup(){
    this.serviceCallForm = this.formBuilder.group({
      clientNumber : [''],
      firstName: [''],
      lastName : [''],

    })
  }


  showNouelDiv: boolean = false; 
  
  queryPrms() {
    this.isLoading = true;
    this.route.queryParams.subscribe(params => {
      if(params['id']){
        this.convertToken(params['id']);
      }else{
        this.isLoading = false;
        return;
      }
    })
  }
  convertToken(token: any) {
    
    if(token){
      this.adminToken = this.commonservice.decrypt(token);
      this.adminToken = this.adminToken.split('$'); // Assuming there's more than one part
      const clientIdString = this.adminToken[0]; // Adjust index if needed
      const parsedClientId = JSON.parse(clientIdString);
      this.clientId = parsedClientId.clientId;
      this.newservicecall = parsedClientId.newservicecall;
      this.serviceCallId = parsedClientId.serviceCallId;
      this.additionValue = parsedClientId.additionValue;
    }
    
  }

  sendData: any[] = [];
  toggleNouelDiv() {
    
    
    this.isaddclient=true;
    this.sendData = [];
    this.sendData.push({
      clientId: this.clientId,
      serviceCallId : 0,
      addnewservicecall:"newServiceCall",
      email:this.emailAddress,
      uploadimage : true
      
    })
    
  }
  onChange(){
  
    this.searchQuery = '';
  
    
  }
  onSubmitChild(event: any) {
    
    if (event.success == true) {
      this.getServiceCallByClientId();
      this.serviceCallId = event.id;
      this.editservicecall(this.serviceCallId);
      //this.getclientdetail();
      this.isaddclient= true;
    }
  }
  removefilter(){
    
    this.searchQuery = '';
    this.filterValue = '';
    this.isSearchtable=false;
    this.selectedFilter='Name';
  }
selectClient(event:any, additionalValue: any){
  
  this.clientId = event.clientID;
  
  this.newservicecall == true
  this.additionValue = additionalValue;
  this.isSearchtable=false;
  this.isaddclient=false;

this.getclientdetail();
this.getServiceCallByClientId();
}
  getclientdetail(){
    
    if(this.clientId){
      setTimeout(() => {
        this. isLoading = true;
        
      this.servicecallservice.GetClientDetailsByClientNumber(this.clientId).subscribe((response : any ) => {
        if(response.isSuccess == true )
          {
            this.serviceCallForm.patchValue({
            clientNumber : response.value[0].clientNumber,
            firstName: response.value[0].firstName,
            lastName : response.value[0].lastName
           });
           this.emailAddress = response.value[0].primaryEmail;
          }
          
        })
        //this.isselectedclient = true;
        this. isLoading = false;
      }, 300);
    }
    
  }

  getServiceCallByClientId() {
    
    
  if(this.clientId){
      this.servicecallservice.GetServiceCallByClientId(this.clientId).subscribe((response: any) => {
        if (response) {
          this.dataSource.data = response.data;
          this.dataSource.paginator = this.paginator;
          if(this.servicecalldelete == false && this.additionValue == ""){
            this.editservicecall(this.serviceCallId);
           
          }
          else{
            this.isaddclient = false;
            this.additionValue = '';
          }
          
         this.isselectedclient = true;
        } else {
          this.ServiceCallByClientId = [];
        }
      }
    );
    }
    
  }
  editservicecall(event:any){
    
    if(this.newservicecall == true && event == undefined ){
      this.isaddclient=false;
      this.newservicecall = false;
    }
    
    else{
      this.newservicecall = false;
      this.isaddclient=true;
    }
    //this.isaddclient=true;
    this.serviceCallId = event;
    this.sendData = [];
    this.sendData.push({
      serviceCallId: event,
      value:'edit',
      email:this.emailAddress
    })
   
  }
  applyFilter(event: any) {
    
    this.filterValue = event.target.value.trim().toLowerCase();
  
    if (this.filterValue.length > 0) {
      if (this.selectedFilter === '' ? 'Name' : this.selectedFilter) {
        this.setPaginatorModel(this.filterValue, this.selectedFilter);
        this.clientservice.getClientBySearch(this.searchfiltermodel).subscribe((response: any) => {
          if (response.isSuccess) {
            this.isSearchtable = true;
            this.searchclientlist = response.value;
            this.isaddclient=false;
          }
          this.isselectedclient = true;
        });
      }
    } else {
      this.isSearchtable = false;
      
    }
  }

  setPaginatorModel(searchText: string, selectedvalue: string) {
    
    this.searchfiltermodel.text = searchText;
    this.searchfiltermodel.searchBy = selectedvalue;
  }
  openDeleteModal(serviceCallId: number) {
    
    this.serviceCallIdToDelete = serviceCallId; // Store the ID of the service call to delete
    this.showConfirmationModal(
      this.translate.instant('MODAL.ConfirmDelete'),
      this.translate.instant('MODAL.DeleteServiceCall'),
      
    );
    this.cdr.detectChanges();
    const modalElement = document.getElementById('secondModalnew');
    if (modalElement) {
      this.secondModalnew.show(); // Show the modal
    }
}
showConfirmationModal(
  title: string,
  message: string,
  
) {
  this.modalTitle = title;
  this.modalMessage = message;
  
  this.secondModalnew.show();
}

confirmDelete() {
  if (this.serviceCallIdToDelete !== null) {
   
      this.deleteservicecall(this.serviceCallIdToDelete);
       // Reset the ID after the action
  }
}
  deleteservicecall(event : any){
    this.isLoading = true;
     this.servicecallservice.deleteservicecall(event).subscribe((response : any)=>{
      if(response.value.isSuccess == true)
      {
        this.isLoading = false;
        const btnSamElement = document.getElementById('closemodal');
          if (btnSamElement) {
            btnSamElement.click();
          }
        this.toaster.success('Success' ,'Record Deleted Successfully');
        this.getServiceCallByClientId();
        this.servicecalldelete = true;
        this.isaddclient=false;
      }
      else{
        this.toaster.error('Failer' ,'Record not Delete.');
      }
     })
  }
  onSubmit(){

  }
  clientpage(){
    
    if(this.clientId>0){
      const queryParams = {
        clientId: this.clientId,
        data:'edit',
      };
      const encryptedParams = this.commonservice.encrypt(JSON.stringify(queryParams)
      );
      this.router.navigate(['/web/admin/manage-clients'], {
        queryParams: { id: encryptedParams },
      });
    }
    else{
      this.router.navigate(['/web/admin/manage-clients'])
    }
  }

}
