import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class CommonService {
  private languageChangeSubject = new BehaviorSubject<string>('fr'); // Default language is 'fr'
  languageChange$ = this.languageChangeSubject.asObservable();
  private loadingStateSubject = new BehaviorSubject<boolean>(false);
  private secretKey = 'JKDKJHKHKJJLK8937204034HAJKDAKSDJAHKALSHDKLOIE'; 
constructor(private http: HttpClient,private translate: TranslateService) {

this.translate.setDefaultLang('fr');
    this.initializeLanguage();
   }

  private initializeLanguage() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      this.translate.use(savedLanguage);
      this.languageChangeSubject.next(savedLanguage);
    }
  }
   @Output() languageChanged = new EventEmitter<void>();
  private getToken(): string {
    return localStorage.getItem('jwtToken') || '';
  }
  getData(url: string): Observable<any> {
    // Use the HttpClient with the specified URL
    return this.http.get(url);
  }

  post(url: any, data: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({ additionalHeaders: this.getAdditionalHeaders, Authorization: `Bearer ${token}` });
    this.loadingStateSubject.next(true);
    //this.ngxLoader.start();
    return this.http.post<any>(`${environment.apiUrl}/${url}`, data, { headers: headers })
      .pipe(map(res => {
        this.loadingStateSubject.next(false);
        //this.ngxLoader.stop();
        return res;
      }));
  }
  get getAdditionalHeaders(): string {
    const additionalHeaders = JSON.stringify({
      'Offset': (new Date().getTimezoneOffset()).toString(),
      'Timezone': this.calculateTimeZone(),
    });
    return additionalHeaders;
  }
  calculateTimeZone(dateInput?: Date): string {
    const dateObject = dateInput || new Date();
    let dateString = dateObject + '',
      tzAbbr: any = (
        // Works for the majority of modern browsers
        dateString.match(/\(([^)]+)\)$/) ||
        // IE outputs date strings in a different format:
        dateString.match(/([A-Z]+) [\d]{4}$/)
      );

    if (tzAbbr) {
      tzAbbr = tzAbbr[1];
    }
    return tzAbbr;
  };
  // Replace with your strong secret key

  encrypt(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, this.secretKey).toString();
    return encrypted;
  }
  decrypt(encryptedData: string): string {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('selectedLanguage', lang); 
    this.languageChangeSubject.next(lang);
    this.languageChanged.emit(); 
  }
}
