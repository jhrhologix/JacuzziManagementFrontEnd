import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlidebarComponent } from '../shared/slidebar/slidebar.component';
import { CommonService } from '../core/services/common.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main-containor',
  standalone: true,
  imports: [RouterOutlet,CommonModule,FormsModule, SlidebarComponent,TranslateModule],
  templateUrl: './main-containor.component.html',
  styleUrl: './main-containor.component.scss',
})
export class MainContainorComponent implements OnInit {
  isToggled = false;
  roleName : any;
  isSidebar = true;
  userName: any;
 
  constructor(public commonservice: CommonService,public translate: TranslateService) {}


  ngOnInit(): void {
    this.initializeLanguage();
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
    this.commonservice.switchLanguage(savedLanguage); // Set the language from localStorage
    }
    this.changesidebar();
    this.userName = localStorage.getItem('name');
    
  }
  private initializeLanguage(): void {
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en'; // Default to 'en' if not set
    this.commonservice.switchLanguage(savedLanguage);
  }

  changesidebar(){
    this.roleName = localStorage.getItem('userRole');
    if(this.roleName == 'superTech' || this.roleName == 'technician'){
     this.isSidebar = false;
    }
  }
  // Toggle sidebar
  toggleSidebar(event: Event) {
    event.preventDefault();
    this.isToggled = !this.isToggled;
  }

  switchLanguage(lang: string) {
    this.commonservice.switchLanguage(lang);
  }
  logout()
  {
    sessionStorage.clear();
     localStorage.clear();
     window.location.href = '/#/login';
  }
}