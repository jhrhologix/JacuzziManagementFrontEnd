import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  getClientDetailByIdUrl = 'api/clients/getclientbyid?clientId='
  createClientURL = 'api/clients/createClient'
  DeleteClientURL = 'api/clients/deleteClient?clientid='
  updateClientURL = 'api/Clients/UpdateClient'
  getSpaDetailsUrl = 'api/clients/getSpaDetails?clientid='
  getUpcomingServiceCallUrl ='api/clients/getUpcomingServicecall?clientid='
  getClientBySearchUrl = 'api/clients/getclientbysearch'
  getAllClientsURL = 'api/clients/getallclients'
  //getAllAreaUrl = 'api/Clients/GetArea'
  getAllProvincesUrl = 'api/Clients/GetProvinces'
  getAllspaModelUrl = 'api/spa/GetSpaBrandDetails'
  getSpaBrandUrl = 'api/spa/GetSpaModelByBrands?SpaBrandId='
  getPoolSpecialistURL = 'api/Spa/SwimmingPoolContractor'
  getAllSpaDetail='api/Clients/GetSpaModelDetails?spaId='
  saveSpaDetailsUrl = 'api/clients/saveSpaDetails'
  updateSpaDetailsUrl='api/clients/updateSpaDetails'
  DeleteSpaURL='api/clients/deleteSpa?spaid='
  clientDetailByIdURL='api/clients/getaclientsbyid?clientId='
  getOldServiceCallUrl='api/Clients/GetOldServicecall?clientId='
  
  constructor(
    private httprequest : HttpClient
  ) { }
  
  getAllClientList(){
  //   const token = localStorage.getItem('jwtToken'); // Retrieve the token
  // const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : {};
  
    return this.httprequest.post(`${environment.apiUrl}/${this.getAllClientsURL}`, null);
  }
  getClientDataById(id : number){
    return this.httprequest.post(`${environment.apiUrl}/${this.getClientDetailByIdUrl}${id}`, null);
  }
  createClient(model:any){
    return this.httprequest.post(`${environment.apiUrl}/${this.createClientURL}`,model)
  }
  DeleteClient(id : number){
    return this.httprequest.post(`${environment.apiUrl}/${this.DeleteClientURL}${id}`,null)
  }
  updateclient(model : any){
return this.httprequest.post(`${environment.apiUrl}/${this.updateClientURL}`,model)
  }
  getOldServiceCall(id:number){
    return this.httprequest.post(`${environment.apiUrl}/${this.getOldServiceCallUrl}${id}`, null);
  }
  getUpcomingServiceCall(id : number){
     return this.httprequest.post(`${environment.apiUrl}/${this.getUpcomingServiceCallUrl}${id}`, null);
   }
   getSpaDetails(id : number){
     return this.httprequest.post(`${environment.apiUrl}/${this.getSpaDetailsUrl}${id}`, null);
   }
   getClientBySearch(model : any){
    
   return this.httprequest.post(`${environment.apiUrl}/${this.getClientBySearchUrl}`, model)
   }
   getAllProvinces(){
      return this.httprequest.get(`${environment.apiUrl}/${this.getAllProvincesUrl}`)
   }
   //getAllArea(){
   //   return this.httprequest.get(`${environment.apiUrl}/${this.getAllAreaUrl}`)
   //}
   getSpaBrand(){
    return this.httprequest.get(`${environment.apiUrl}/${this.getAllspaModelUrl}`)
  }
  getSpaModelByBrand(brandId: number){
    // Ensure brandId is a valid number
    if (brandId === undefined || brandId === null || isNaN(brandId)) {
      console.error('Invalid brand ID provided to getSpaModelByBrand:', brandId);
      // Return an empty observable with a properly formatted response
      return of({
        StatusCode: 200,
        Message: "Success",
        data: []
      });
    }
    return this.httprequest.get(`${environment.apiUrl}/${this.getSpaBrandUrl}${brandId}`);
  }
  getPoolSpecialist(){
    return this.httprequest.get(`${environment.apiUrl}/${this.getPoolSpecialistURL}`);
  }
  getSpaDetailsByClientId(id:number){
    return this.httprequest.get(`${environment.apiUrl}/${this.getAllSpaDetail}${id}`);
  }
  saveSpaDetails(model:any)
  {
    return this.httprequest.post(`${environment.apiUrl}/${this.saveSpaDetailsUrl}`, model)
  }
  updateSpaDetails(model:any)
  {
    return this.httprequest.post(`${environment.apiUrl}/${this.updateSpaDetailsUrl}`, model)
  }
  DeleteSpa(id:number){
    return this.httprequest.post(`${environment.apiUrl}/${this.DeleteSpaURL}${id}`,null)
  }
  getClientById(id:number){
    return this.httprequest.post(`${environment.apiUrl}/${this.clientDetailByIdURL}${id}`,null)

  }
}
