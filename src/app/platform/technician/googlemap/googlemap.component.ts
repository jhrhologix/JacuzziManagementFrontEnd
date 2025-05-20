import { AfterViewInit, Component, ElementRef, Input, ViewChild, } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { TechnicianService } from '../technician.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
declare var window: any;

@Component({
  selector: 'app-googlemap',
  standalone: true,
  imports: [
    GoogleMapsModule,
    TranslateModule
  ],
  templateUrl: './googlemap.component.html',
  styleUrl: './googlemap.component.scss'
})
export class GooglemapComponent{
   @Input() data: any;
   clientId: any;
  clientIdlatitude: number | null = null;
  clientlongitude: number | null = null;
   constructor(
    private technicianService: TechnicianService,
    private toaster: ToastrService,
   ) {}
  ngOnInit(): void {
    this.clientId = this.data[0].clientId;
    this.getCurrentLocation();
    this.getGeocodeAddress()
    
  }
  latitude: number | null = null;
  longitude: number | null = null;
  errorMessage: string | null = null;

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.errorMessage = ''; // Clear any previous errors
        },
        (error) => {
          this.errorMessage = this.getErrorMessage(error.code);
          this.toaster.error(this.errorMessage);
        }
      );
    } else {
      this.errorMessage = 'Geolocation is not supported by this browser.';
      this.toaster.error(this.errorMessage);
    }
  }

  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permission denied. Please allow location access.';
      case 2:
        return 'Position unavailable. Try again later.';
      case 3:
        return 'Timeout. Please try again.';
      default:
        return 'An unknown error occurred.';
    }
  }
  getGeocodeAddress(): void {
    ;
    this.technicianService.getClientAddress(this.clientId).subscribe((response: any) => {
      if (response) {
        const fullAddress = `${response.value[0].apartNo}, ${response.value[0].street}, ${response.value[0].area}, ${response.value[0].city}, ${response.value[0].postalCode}`;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results) {
              const clientLocation = results[0].geometry.location;
              this.clientIdlatitude = clientLocation.lat();
              this.clientlongitude = clientLocation.lng();
              this.getRoute();
              
            } else {
              this.toaster.error('Geocoding error: No results found.');
              
            }
          } else {
            this.toaster.error('Geocoding error:','Error');
            
          }
        });
      }
    });
  }

    getRoute(): void {
      
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.latitude},${this.longitude}&destination=${this.clientIdlatitude},${this.clientlongitude}&dir_action=navigate`;
      window.open(googleMapsUrl, '_blank'); // Opens in a new tab
    }
  
}
