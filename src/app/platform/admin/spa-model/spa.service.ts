import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpaService {

  GetSpaBrandUrl = 'api/Spa/GetSpaBrandDetails'
  GetSpaModelUrl = 'api/Spa/GetSpaModelByBrands?SpaBrandId='
  SwimmingPoolContractorUrl = 'api/Spa/SwimmingPoolContractor'
  AddSpaBrandUrl = 'api/Spa/AddNewSpaBrand/'
  DeleteSpaBrandUrl = 'api/Spa/DeleteSpaBrand?SpaBrandId='
  AddNewContractorUrl = 'api/Spa/AddNewContractor'
  DeleteContractorUrl = 'api/Spa/DeleteContractor?PoolSpecialistId='
   //AddSpaModelUrl = 'api/Spa/AddSpaModel?spaModelLabel=&spaModelSpaBrandId='
  AddSpaModelUrl = 'api/Spa/AddSpaModel'

  DeleteSpaModelUrl = 'api/Spa/DeleteSpaModel?spaModel_id='
  GetSpaDetailBySpaIdUrl = 'api/Spa/GetSpaDetailBySpaId?SpaBrandId='



  // private headers = new HttpHeaders({
  //   'Content-Type': 'application/json', // Adjust based on your API requirements
  //   'Authorization': 'Bearer your-token-here', // If using bearer tokens for authorization
  //   // Add any other headers as needed
  // });
  
  constructor(private httprequest : HttpClient )  { }




  GetSpaBrand(): Observable<any> {
    return this.httprequest.get<any>(`${environment.apiUrl}/${this.GetSpaBrandUrl}`);
  }


  GetSpaModel(brandId: number): Observable<any> {
    return this.httprequest.get<any>(`${environment.apiUrl}/${this.GetSpaModelUrl}${brandId}`);
  }


  SwimmingPoolContractor(): Observable<any> {
    return this.httprequest.get<any>(`${environment.apiUrl}/${this.SwimmingPoolContractorUrl}`);
  }

  AddSpaBrand(BrandLabel: string): Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.AddSpaBrandUrl}${BrandLabel}`,null);
  }

  DeleteSpaBrand(SpaBrandId: number): Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.DeleteSpaBrandUrl}${SpaBrandId}`,null);
  }  

  AddNewContractor(SpecialistObject: any): Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.AddNewContractorUrl}`,SpecialistObject);
  }

  DeleteContractor(PoolSpecialistId: number): Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.DeleteContractorUrl}${PoolSpecialistId}`,null);
  }

  AddSpaModel(SpaModelLabel: string, spaModelSpaBrandId: number | null): Observable<any> {
    // return this.httprequest.post<any>(`${environment.apiUrl}/${this.AddSpaModelUrl}${SpaModelLabel}${spaModelSpaBrandId}`,null);
    return this.httprequest.post<any>(
      `${environment.apiUrl}/${this.AddSpaModelUrl}?spaModelLabel=${SpaModelLabel}&spaModelSpaBrandId=${spaModelSpaBrandId}`,
      null);  
  }

  DeleteSpaModel(spaModel_id: number): Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.DeleteSpaModelUrl}${spaModel_id}`,null);
  }

  GetSpaDetailBySpaId(SpaBrandId: number): Observable<any> {
    return this.httprequest.post<any>(`${environment.apiUrl}/${this.GetSpaDetailBySpaIdUrl}${SpaBrandId}`,null);
  }



}
