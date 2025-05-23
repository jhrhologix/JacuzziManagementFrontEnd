import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { first } from 'rxjs';
import { AuthService } from '../auth.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../core/services/common.service';
import { CommonModule } from '@angular/common';
import { routes } from '../auth.routes';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    ToastrModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  isLoading = false;
  adminLoginForm!: FormGroup;
  hide = true;
  loginLeftBackground = '../../../assets/img/login_left_background.png';
  router = inject(Router);

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    public translate: TranslateService,
    private authService: AuthService,
    private toaster: ToastrService
  ) {
    this.toaster = toaster;
  }

  ngOnInit(): void {
    this.createformgroup();
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.switchLanguage(savedLanguage);
  }

  switchLanguage(lang: string) {
    this.commonService.switchLanguage(lang); // Notify the service to switch language
    this.translate.use(lang); // Switch language using TranslateService
    localStorage.setItem('selectedLanguage', lang); // Save language selection
  }

  get fb() {
    return this.adminLoginForm.controls;
  }

  createformgroup() {
    this.adminLoginForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern('^[a-zA-Z0-9_]+$'), // Alphanumeric only, no spaces
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          // Validators.minLength(8),
          // Validators.pattern('^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$')
        ],
      ],
    });
  }
  
  showPassword(hide: any) {
    this.hide = !hide;
  }

  onSubmit() {
    
    if (this.adminLoginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.isLoading = true;
    
    console.log('Submitting login with:', this.adminLoginForm.value);

    setTimeout(() => {
      this.authService
        .login(this.adminLoginForm.value)
        .pipe(first())
        .subscribe(
          (response: any) => {
            this.isLoading = false;
            console.log('Login response detailed:', JSON.stringify(response));
            
            // Handle successful login (200) - check both lowercase and uppercase properties
            if (response && (response.StatusCode === 200 || response.statusCode === 200)) {
              localStorage.clear();
              
              // Store user data
              if (response.data) {
                localStorage.setItem('username', response.data.userName || '');
                localStorage.setItem('userId', response.data.userId || '');
                localStorage.setItem('userRole', response.data.roleName || '');
                localStorage.setItem('name', response.data.name || '');
                localStorage.setItem('assignTechnicianDays', response.data.assignTechnicianDays || '0');
              }
              
              // Store tokens
              localStorage.setItem('jwtToken', response.accessToken || '');
              localStorage.setItem('refreshToken', response.refreshToken || '');

              this.toaster.success(response.message || response.Message || 'Login successful!', 'Success');

              // Navigate based on role
              const userRole = response.data?.roleName;
              if (userRole === 'Admin') {
                this.router.navigate(['web/admin/manage-clients']);
              }
              else if(userRole === 'superTech'){
                this.router.navigate(['web/technician/technician-visit']);
              }
              else if(userRole === 'technician'){
                this.router.navigate(['web/technician/technician-visit']);
              }
            } 
            // Fall back to legacy empty response handling
            else if (!response || Object.keys(response).length === 0) {
              console.log('Empty response received from server');
              
              // Check if credentials match hardcoded test values
              if (this.adminLoginForm.value.username === 'FrancoisM' && 
                  this.adminLoginForm.value.password === 'abc@12345') {
                
                localStorage.clear();
                localStorage.setItem('username', 'FrancoisM');
                localStorage.setItem('userId', '1');
                localStorage.setItem('userRole', 'Admin');
                localStorage.setItem('jwtToken', 'dummy-token');
                localStorage.setItem('name', 'Francois Mitchel');
                localStorage.setItem('assignTechnicianDays', '10');
                
                this.toaster.success('Login successful! (TEST MODE)', 'Success');
                this.router.navigate(['web/admin/manage-clients']);
                return;
              }
              
              // If not using test credentials, treat empty response as authentication failure
              this.toaster.error('Invalid username or password', 'Authentication Failed');
              return;
            } 
            else {
              // Handle other status codes - check both lowercase and uppercase properties
              const statusCode = response.StatusCode || response.statusCode;
              const message = response.Message || response.message;
              
              if (statusCode === 401) {
                this.toaster.error(message || 'Password incorrect', 'Authentication Failed');
              } else if (statusCode === 404) {
                this.toaster.error(message || 'Username not found', 'Authentication Failed');
              } else {
                this.toaster.error(message || 'Login failed', 'Error');
              }
            }
          },
          (error) => {
            this.isLoading = false;
            
            // Handle HTTP error responses
            if (error.status === 401) {
              this.toaster.error('Password incorrect', 'Authentication Failed');
            } else if (error.status === 404) {
              this.toaster.error('Username not found', 'Authentication Failed');
            } else {
              this.toaster.error(
                error.error?.Message || error.error?.message || error.message || 'Server connection error',
                'Login failed'
              );
            }
            console.error('Login error:', error);
          }
        );
    }, 300);
  }

  markAllFieldsAsTouched() {
    Object.values(this.adminLoginForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  getFormControl(controlName: string): AbstractControl {
    return this.adminLoginForm.get(controlName) as AbstractControl;
  } 
}
