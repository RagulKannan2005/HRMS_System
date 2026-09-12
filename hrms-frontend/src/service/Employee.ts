import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8081/api/v1/manager';
  private adminApiUrl = 'http://localhost:8081/api/v1/admin';

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAllEmployees():Observable<any>{
    return this.http.get(`${this.adminApiUrl}/employees`,{headers:this.getAuthHeaders()});
  }

  getAllManagers():Observable<any>{
    return this.http.get(`${this.adminApiUrl}/managers`,{headers:this.getAuthHeaders()});
  }

  getEmployeeCount(userId:number):Observable<any>{
    return this.http.get(`${this.apiUrl}/user/${userId}/count`,{headers:this.getAuthHeaders()});
  }
}
