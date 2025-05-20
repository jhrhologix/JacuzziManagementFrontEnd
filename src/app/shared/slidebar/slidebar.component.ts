import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Router, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-slidebar',
  templateUrl: './slidebar.component.html',
  styleUrl: './slidebar.component.scss',
  standalone: true,
  imports: [TranslateModule , RouterLink]
})
export class SlidebarComponent {
  activeLink: string = '';
  currentSlug: string = '';

  constructor(private router: Router) {}

  logout(){
    sessionStorage.clear();
     localStorage.clear();
     //window.location.href = '/#/login';
  }

   // Holds the href of the active link.

   

   setActive(link: string): void {
    this.activeLink = link;
  }

  isActive(link: string): boolean {
    return this.activeLink === link;
  }

// Update the current slug dynamically, for example, via router or another mechanism
ngOnInit(): void {
  this.updateSlugBasedOnURL();
  
  this.router.events.subscribe((event) => {
    if (event instanceof NavigationEnd) {
      this.updateActiveLink(this.router.url); // Update the active link dynamically
    }
  });

  // Initialize active link when the component loads
  this.updateActiveLink(this.router.url);
}

updateSlugBasedOnURL(): void {
  const url = window.location.hash; // Example way to get current slug
  this.currentSlug = url.split('/').pop() || ''; // Extract the last part of the URL as slug
}

private updateActiveLink(url: string): void {
  // Logic to extract the active route from the URL
  if (url.includes('#')) {
    // Hash-based routing
    this.activeLink = url.split('#')[1]?.split('/')[3] || '';
  } else {
    // Standard Angular routing
    this.activeLink = url.split('/')[3] || '';
  }
}


}
