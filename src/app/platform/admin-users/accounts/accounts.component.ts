import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AdminService } from './admin.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, TouchedChangeEvent, Validators  } from '@angular/forms'; 
import { AdminModule } from '../../admin/admin.module';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { WhiteSpaceBlock } from '../../../shared/validators/WhitespaceValidators';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AdminModel } from './adminModel';


@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    MatTableModule, 
    MatCheckboxModule, 
    FormsModule, 
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    TranslateModule,
    CKEditorModule
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit, AfterViewInit {
  roles: any[] = [];
  isLoading = false;
dataSource = new MatTableDataSource<AdminModel>([]); 
createUserForm: FormGroup;
changePasswordForm:FormGroup;
techniciannamelist: any[]=[];
selectedOldTechnicianId='';  
selectedNewTechnicianId=''; 
isTemplateUpdate = false;
templateId = 13;
CloseServiceCallId = 17;
emailTemplateForm : FormGroup;
editor = ClassicEditor;
editor1 = ClassicEditor;
public configEmailBody = {
  toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],

}

public configEmailBody1 = {
  toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],

}
@ViewChild(MatPaginator) paginator!: MatPaginator;
@ViewChild('createUserModal') createUserModal!: ElementRef;


  displayedColumns: any[] = [
    'userName',
    'name',
    'assignDays',
    'email',
    'roleName',
    'isDeleted',
    //'isActive',
     //'isLocked',

  ];

  elementToDelete!: AdminModel;
  templateDataList: any []=[];
  dataEmailBody: string='';
  dataSMSBody: any;
  dataCloseServiceCallBody:any;
  questions: any[]=[];
  


  constructor(
    private adminService: AdminService,
     private fb: FormBuilder,
     private toastr: ToastrService, 
     private el: ElementRef) {
      this.emailTemplateForm= new FormGroup('');
    this.createUserForm = this.fb.group({
      lastName: ['', Validators.required],
      firstName: ['', Validators.required],
      userName: ['', Validators.required],
      Password: ['', [Validators.required,Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      secretQuestion: ['', Validators.required],
      answer: ['', Validators.required],
      roleId: ['0', Validators.required]

    }, { validator: this.passwordMatchValidator.bind(this) });

    
    this.changePasswordForm = this.fb.group({
      userName: ['', Validators.required],
      Password: ['', [Validators.required,Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator.bind(this) });

  }
  ngAfterViewInit(): void {
    
    this.paginator.pageSize = 20;
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe(() => this.onPageChange());
  }


  ngOnInit(): void {
    this.adminDetails();
    this.userRoles();
    this.getTechnicianNamelist();
    this.getSMSTemplate(this.templateId);
    this.getUsersQuestions();
    this.createFormgroup();
    this.IsServiceCallClosedTemplate();
  }


  passwordMatchValidator(form: FormGroup) : { [key: string]: boolean } | null {
    
    const Password = form.get('Password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return Password == confirmPassword ? null : { mismatch: true };
  }

  blockwhitespaces(event: any) {
    WhiteSpaceBlock(event);
  }

  openModal(): void {
    // Reset form controls
    this.createUserForm.reset();
    this.createUserForm.patchValue({'roleId': ''}); //select option dropdown fix
    // Reset touched and dirty states
    Object.keys(this.createUserForm.controls).forEach(field => {
      const control = this.createUserForm.get(field);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  onPageChange(): void {
    this.isLoading = true;

    // Simulate loading data or call adminDetails() here if needed.
    setTimeout(() => {
      this.adminDetails();  // Fetch new data as per the paginator page
      this.isLoading = false;  // Hide loader after data is loaded
    }, 300); // Adjust delay as needed
  }


  toggleEdit(element: any) {
    
    //this.userRoles();
    if (element.isEditing) {
      // If already in edit mode, save changes when toggling off
      this.saveChanges(element);
    } else {
      const role = this.roles.find(r => r.roleName === element.roleName);
      element.roleId = role ? role.roleId : element.roleId;
      
      // If entering edit mode, load roles
    }
    // Toggle the edit mode
    element.isEditing = !element.isEditing;
  }

  saveChanges(element: AdminModel): void {

    if (element.roleId === 1 && element.assignDays !== 0) {
      this.toastr.warning('Cannot assign days to Admin.', 'Warning');
      this.adminDetails();
      return; 
    }
    
    const selectedRole = this.roles.find(role => role.roleId === element.roleId);
    if (selectedRole) {
      element.roleName = selectedRole.roleName;
    }
    
    this.isLoading = true;
    this.adminService.updateUser(element).subscribe(
      (response: any) => {
        if(response.statusCode == 200){
          this.isLoading = false;
          this.toastr.success('User updated successfully.', 'Success');
          this.adminDetails();
        } 
      },
    );
  }
  
  cancelEdit(element:AdminModel){
    element.isEditing=false;
  }

  
 
  adminDetails(): void {
    this.isLoading = true;
    this.adminService.getUserDetails().subscribe(
        (response: any) => {
          this.isLoading = false;
            // Assuming 'response.data' contains your array
            const adminData: AdminModel[] = response.data.map((item: any) => ({
                userId: item.userId,
                userName: item.userName,
                firstName: item.firstName,
                lastName: item.lastName,
                email: item.email,
                roleName: item.roleName,
                isDeleted: item.isDeleted,
                isActive: item.isActive,
                isLocked: item.isLocked,
                assignDays: item.assignTechnicianDays
            }));
            this.dataSource.data = adminData;
        },
    );
}


userRoles(): void {
  this.isLoading = true;
  this.adminService.getUserRoles().subscribe(
    (response: any) => {
      if (response.statusCode==200 && response.data != null) {
        // Map only if response.roles exists
        this.isLoading = false;
        this.roles = response.data
      } 
    },
    (error) => {
      this.isLoading = false;
      console.error('Error fetching roles:', error);
    }
  );
}


onEdit(element: any): void {
  element.isEditing = true;
  if (this.roles.length === 0) {
    this.userRoles();
  }
}


onCheckboxChange(event: Event, element: AdminModel): void {
  
  const isChecked = (event.target as HTMLInputElement).checked;
   element.isActive = isChecked; // Reverse logic since checked means "not deleted"
  

  if (element.isEditing) {
      // Optionally confirm the deletion or run the delete user logic
      //this.deleteUser(element);
  }
}




confirmDelete(element: AdminModel): void {
  this.elementToDelete = element;
}

// Handle the delete after confirming in modal
onDeleteConfirm(): void {
  
  if (this.elementToDelete) {
    this.adminService.deleteUser(this.elementToDelete.userId).subscribe(
      () => {
        this.dataSource.data = this.dataSource.data.filter(
          item => item !== this.elementToDelete
        );
        this.elementToDelete = {
          userId: 0,
          userName: '',
          firstName: '',
          lastName: '',
          email: '',
          roleName: '',
          roleId: 0,
          isDeleted: false,
          isActive: false,
          isLocked: true,
          assignDays: 0
      }; 
      this.toastr.success('User deleted successfully.', 'Success');
        this.adminDetails();
        const closeModalButton = document.getElementById('closemodal');
        if (closeModalButton) {
          closeModalButton.click();
        }
      },
      (error) => {
        this.toastr.error('Error deleting user.', 'Error');
      }
    );
  }
}


onSubmit(): void {
  
  if (this.createUserForm.valid) {
    // Close the modal first

    // Set a slight delay to ensure the modal has closed before showing the loader
    setTimeout(() => {
      this.isLoading = true;

      const userData = { ...this.createUserForm.value };
      delete userData.confirmPassword;

      this.adminService.addNewUser(userData).subscribe(
        response => {
          if (response.statusCode == 200) {
            this.toastr.success(response.message, 'Success');
            const closeModalButton = document.getElementById('createUserModalLabel');
            if (closeModalButton) {
              closeModalButton.click(); // Close the modal
            }
            this.createUserForm.reset(); // Reset the form
            this.adminDetails();
            this.isLoading = false; // Hide loader when API call completes
          } else {
            this.toastr.error('Attention! A User with the same name or email already exists', 'Error');
            this.isLoading = false;
          }
        },
        error => {
          this.isLoading = false; // Ensure loader is hidden in case of error
          this.toastr.error('An error occurred while adding the user', 'Error');
        }
      );
    }, 800); // 800ms delay for smooth transition after modal closes
  } else {
    // Mark all controls as touched to show validation errors
    this.createUserForm.markAllAsTouched();

    // Scroll to the first invalid control
    this.scrollToFirstInvalidControl();
    this.isLoading = false;
  }
}

private scrollToFirstInvalidControl(): void {
  const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
    'form .ng-invalid'
  );

  if (firstInvalidControl) {
    firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalidControl.focus();
  }
}


onChangePasswordSubmit(): void {
  
  if (this.changePasswordForm.valid) {
    const formData = { ...this.changePasswordForm.value };
    delete formData.confirmPassword; // Exclude confirmPassword from the payload
    this.isLoading = true;
    // Make your API call to update the password
    this.adminService.updateUserPassword(formData).subscribe(
      response => {
        if(response.statusCode==200){
          this.isLoading = false;
          this.toastr.success(response.message, 'Success');
         
          
        } else {
          this.isLoading = false;
          this.toastr.warning(response.message, 'Warning');
        }
        const closeModal = document.getElementById('changePassword');
       },
      error => {
        this.isLoading = false;
        this.toastr.error('Error changing password.', 'Error');
      }
    );
  }
}

changePasswordModal(element:AdminModel){
  this.changePasswordForm.patchValue({
    userName:element.userName,
    confirmPassword : '',
    Password:''

  })
}

lockUser(element:AdminModel){
  
this.adminService.lockUser(element.userId).subscribe((response:any)=>{
  if(response.statusCode==200){
    this.toastr.success(response.message);
    this.adminDetails();
  }
  else{
    this.adminDetails();
    this.toastr.success(response.message);

  }
})
}

getTechnicianNamelist(){
  
  this.adminService.getTechnicianNamelist().subscribe((response:any)=>{
    if(response.isSuccess){
  this.techniciannamelist = response.value;
    }
  })
}


transferVisit() {
   
   
  const technicianTransferObject = {
    oldTechnicianId: this.selectedOldTechnicianId,
    newTechnicianId: this.selectedNewTechnicianId,
  };
  

  this.adminService.transferTechnicianVisit(technicianTransferObject).subscribe((response: any) => {
    if (response.statusCode == 200) {
      this.toastr.success(response.message, 'Success')
      
    }
    else if (response.statusCode == 422) {
      
      this.toastr.warning(response.message, 'Warning');
    } else if (response.statusCode == 400) {
      this.toastr.error('The transfer cannot be completed. Check if the technician account is disabled.', 'Error');
    } 
    else if (response.statusCode == 500) {
      this.toastr.error('Transfer technician failed.', 'Error');
    } 

    this.selectedOldTechnicianId='';
this.selectedNewTechnicianId='';
    
  });
  
}
resetFields(){
  this.selectedOldTechnicianId='';
this.selectedNewTechnicianId='';

}



onAssignDaysChange(element: any): void {
  if (element.assignDays < 0) {
      element.assignDays = 0;
  } else if (element.assignDays > 10) {
      element.assignDays = 10;
  }
}
createFormgroup(){
  this.emailTemplateForm = this.fb.group({
    masterEmailTemplateId: [0],
    emailTemplateName: [''],
    emailTemplateSubject:[''],
    emailTemplateBody:[''],
    SMSTemplateBody:[''],
    isActive:[true],
    dataCloseServiceCallBody:['']
  });
}

getSMSTemplate(id: any){
  
  this.isLoading = true;
  this.adminService.GetSMSTemplateByTemplateId(id).subscribe((response:any)=>{
    if(response)
    {
      this.templateDataList = response.value;
      this.dataSMSBody= this.templateDataList[0].smsTemplateBody;
      this.emailTemplateForm.patchValue({SMSTemplateBody: this.templateDataList[0].smsTemplateBody});
      if(this.templateDataList[0].smsTemplateBody !== null)
      {
        this.isTemplateUpdate=true;
      }
      this.isLoading = false;
    }
  });
}
IsServiceCallClosedTemplate(){
  
  this.isLoading = true;
  this.adminService.GetSMSTemplateByTemplateId(this.CloseServiceCallId).subscribe((response:any)=>{
    if(response)
    {
      this.templateDataList = response.value;
      this.dataCloseServiceCallBody= this.templateDataList[0].smsTemplateBody;
      this.emailTemplateForm.patchValue({dataCloseServiceCallBody: this.templateDataList[0].smsTemplateBody});
      if(this.templateDataList[0].smsTemplateBody !== null)
      {
        this.isTemplateUpdate=true;
      }
      this.isLoading = false;
    }
  });
}
onTemplateSubmit(): void{
  
  this.isLoading = true;
  const requestModel : any = {
    masterSMSTemplateId : this.templateDataList[0].masterSMSTemplateId,
    smsTemplateBody : this.emailTemplateForm.get('SMSTemplateBody')?.value
  };
 
  this.adminService.AddUpdateSMSTemplate(requestModel).subscribe((Response: any ) =>{
    if(Response.value.isSuccess == true){
      if(this.isTemplateUpdate === false)
      {
        this.toastr.success('Email template created successfully.');
      }
      else{
        this.toastr.success('Email template updated successfully.');
      }
      const btnSamElement = document.getElementById('EmailVisitsModalclose');
      if (btnSamElement) {
        btnSamElement.click();
      }
      this.isLoading = false;
    }
    else{
      this.toastr.error(Response.value.error.message);
      this.isLoading = false;
    }
  });

}
getUsersQuestions(){
  this.adminService.getUsersQuestions().subscribe((response:any)=>{
    if(response)
    {
      this.questions = response.data;
      
    }
  }); 
}
onCloseServiceCallTemplateSubmit(): void{
  
  this.isLoading = true;
  const requestModel : any = {
    masterSMSTemplateId : this.CloseServiceCallId,
    smsTemplateBody : this.emailTemplateForm.get('dataCloseServiceCallBody')?.value
  };
 
  this.adminService.AddUpdateSMSTemplate(requestModel).subscribe((Response: any ) =>{
    if(Response.value.isSuccess == true){
      if(this.isTemplateUpdate === false)
      {
        this.toastr.success('Email template created successfully.');
      }
      else{
        this.toastr.success('Email template updated successfully.');
      }
      const btnSamElement = document.getElementById('IsServiceCallClosedModalclose');
      if (btnSamElement) {
        btnSamElement.click();
      }
      this.isLoading = false;
    }
    else{
      this.toastr.error(Response.value.error.message);
      this.isLoading = false;
    }
  });

}
}




