import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../core/services/common.service';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { WhiteSpaceBlock } from '../../shared/validators/WhitespaceValidators';

declare var window: any;

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [TranslateModule,CommonModule,ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})

export class ForgetPasswordComponent {

  forgetPasswordForm: FormGroup;
  identityConfirmForm: FormGroup;
  changePasswordForm:FormGroup;

  showIdentityConfirm: boolean = false;
  IsidentityConfirm = false;
  userId: any;
  secondModal: any;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public translate: TranslateService,
    private authService: AuthService,
    private toaster: ToastrService,
    
  ) {
    {
      this.forgetPasswordForm = this.formBuilder.group({
        username: ['']
      });
  
      this.identityConfirmForm = this.formBuilder.group({
        username: [''],
        ques: [''],
        ans: [''],
        newpass: [''],
        confirmpass: ['']
      });

      this.changePasswordForm = this.formBuilder.group({
        userName: ['', Validators.required],
        Password: ['', [Validators.required,Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, { validator: this.passwordMatchValidator.bind(this) });
    }
  }

  

  ngOnInit(): void {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.switchLanguage(savedLanguage);
    this.secondModal = new window.bootstrap.Modal(
      document.getElementById('resetpass')
    );
  }

  switchLanguage(lang: string) {
    this.commonService.switchLanguage(lang); // Notify the service to switch language
    this.translate.use(lang); // Switch language using TranslateService
    localStorage.setItem('selectedLanguage', lang); // Save language selection
  }

  onPageChange(): void {
    this.isLoading = true;

    // Simulate loading data or call adminDetails() here if needed.
    setTimeout(() => {
       this.isLoading = false;  // Hide loader after data is loaded
    }, 300); // Adjust delay as needed
  }

  blockwhitespaces(event: any) {
    WhiteSpaceBlock(event);
  }

  passwordMatchValidator(form: FormGroup) : { [key: string]: boolean } | null {
    
    const Password = form.get('Password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return Password == confirmPassword ? null : { mismatch: true };
  }

  onSubmitForgetPassword() {
    
    const username = this.forgetPasswordForm.get('username')?.value;

    if (username) {
      this.authService.checkUserExist(username).subscribe((response : any)=>{
        if (response.statusCode == 200) {
          this.IsidentityConfirm = true;
          this.identityConfirmForm.patchValue({
            username: response.data.userName,
            ques: response.data.secretQuestion
          });
          this.showIdentityConfirm = true;
          this.userId=response.data.userId
        } else {
          this.toaster.error('User does not exist', 'Error');
        }
      })
    } else {
      this.toaster.warning('Please enter a username', 'Warning');
    }
  }


  onValidateAnswer() {
    
    const userId = this.identityConfirmForm.get('username')?.value; // Assume username corresponds to the user ID
    const answer = this.identityConfirmForm.get('ans')?.value;
  
    if (!answer) {
      this.toaster.warning('Please provide an answer', 'Warning');
      return;
    }
  
    this.authService.validateAnswer(this.userId, answer).subscribe({
      next: (response) => {
        if (response.statusCode == 200) {
          this.toaster.success('Answer validated successfully', 'Success');
          this.changePasswordForm.patchValue({
            userName:this.identityConfirmForm.get('username')?.value
          })
          const modalElement = document.getElementById('resetpass');
          if (modalElement) {
            this.secondModal.show(); // Show the modal
  }
          const modalTrigger = document.querySelector('[data-bs-target="#resetpass"]');
          (modalTrigger as HTMLElement)?.click();
        } else {
          this.toaster.error(response.message || 'Invalid answer', 'Error');
        }
      },
      error: () => {
        this.toaster.error('An error occurred while validating the answer', 'Error');
      },
    });
  }

  onCancelIdentityConfirm() {
    this.showIdentityConfirm = false;
    this.IsidentityConfirm  = false;
    this.identityConfirmForm.reset();
  }


  onChangePasswordSubmit(): void {
  
    if (this.changePasswordForm.valid) {
      const formData = { ...this.changePasswordForm.value };
      delete formData.confirmPassword; // Exclude confirmPassword from the payload
      this.isLoading = true;
      // Make your API call to update the password
      this.authService.updateUserPassword(formData).subscribe(
        response => {
          if(response.statusCode==200){
            this.isLoading = false;
            this.toaster.success(response.message, 'Success');
           
            
          } else {
            this.isLoading = false;
            this.toaster.warning(response.message, 'Warning');
          }
          const closeModal = document.getElementById('changePassword');
         },
        error => {
          this.isLoading = false;
          this.toaster.error('Error changing password.', 'Error');
        }
      );
    }
  }
}
