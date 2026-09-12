import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private adminApi = 'http://localhost:8081/api/v1/admin';
  private usersApi = 'http://localhost:8081/api/v1/users';
  private employeeapiUrl = 'http://localhost:8081/api/v1/employee';

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.usersApi}/getAllUsers`);
  }

  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/employees`);
  }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/managers`);
  }

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/departments`);
  }

  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/designations`);
  }

  registerManager(data: any): Observable<any> {
    return this.http.post<any>(`${this.adminApi}/register-manager`, data);
  }

  createEmployee(data: any): Observable<any> {
    return this.http.post<any>(`http://localhost:8081/api/v1/manager/create-employee`, data);
  }

  getPendingLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/pending-leaves`);
  }

  approveLeave(leaveRequestId: number): Observable<any> {
    return this.http.put<any>(`${this.adminApi}/approve-leave/${leaveRequestId}`, {});
  }

  rejectLeave(leaveRequestId: number): Observable<any> {
    return this.http.put<any>(`${this.adminApi}/reject-leave/${leaveRequestId}`, {});
  }
}
