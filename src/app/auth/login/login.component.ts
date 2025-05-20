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

    setTimeout(() => {
      this.authService
        .login(this.adminLoginForm.value)
        .pipe(first())
        .subscribe(
          (response: any) => {
            this.isLoading = false;
            if (response.statusCode==200) {
              
              localStorage.clear();
              const userId = response.data.userId;
              const username = response.data.userName;
              const name = response.data.name;
              const refreshToken = response.refreshToken;
              const token = response.accessToken;
              const days = response.data.assignTechnicianDays;
              const userRole = response.data.roleName;
              localStorage.setItem('username', username);
              localStorage.setItem('userId', userId);
              localStorage.setItem('userRole', userRole);
              localStorage.setItem('jwtToken', token);
              localStorage.setItem('name', name);
              localStorage.setItem('refreshToken', refreshToken);
              localStorage.setItem('assignTechnicianDays', days);
              // sessionStorage.setItem('expiresIn', expiresIn);

              this.toaster.success('Login successful!', 'Success'); // Show success toast

              if (userRole === 'Admin') {
                this.router.navigate(['web/admin/manage-clients']);
              }
              else if(userRole === 'superTech'){
                this.router.navigate(['web/technician/technician-visit']);
              }
              else if(userRole === 'technician'){
                this.router.navigate(['web/technician/technician-visit']);
              }
            } else {
              this.toaster.error('Username does not exist', 'Error'); // Show error toast
            }
          },
          (error) => {
            this.isLoading = false;
            this.toaster.error(
              error.error.message || 'Invalid credentials',
              'Login failed'
            ); // Show error toast
            //console.error('Login error:', error);
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
