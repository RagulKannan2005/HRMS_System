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
    return this.http.post<any>(`${this.adminApi}/register-employee`, data);
  }

  createDepartment(data: any): Observable<any> {
    return this.http.post<any>(`${this.adminApi}/add-department`, data);
  }
  createDesignation(data: any): Observable<any> {
    return this.http.post<any>(`${this.adminApi}/add-designation`, data);
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

  getLeaveBystatus(status: string): Observable<any[]> {

    if (!status) {
      return this.http.get<any[]>(`${this.adminApi}/pending-leaves`);
    }
    return this.http.get<any[]>(
      `${this.adminApi}/getleavesbystatus/${status}`
    );
  }

  // --- Payroll & Salary Endpoints ---
  getAllSalaries(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8081/api/v1/employee/employeesalary/getAllEmployeeSalary');
  }

  getSalaryByEmployeeId(employeeId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8081/api/v1/employee/employeesalary/getsalaryByEmployeeId/${employeeId}`);
  }

  updateEmployeeSalary(salaryId: number, salaryData: any): Observable<any> {
    return this.http.put<any>(
      `http://localhost:8081/api/v1/employee/employeesalary/updateEmployeeSalary/${salaryId}`,
      salaryData
    );
  }

  generatePayroll(employeeId: number, year: number, month: number): Observable<any> {
    return this.http.post<any>(
      'http://localhost:8081/api/v1/payroll/employee/generate',
      {},
      {
        params: { employeeId, year, month },
      }
    );
  }

  getPayrollByEmployeeId(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8081/api/v1/payroll/employee/id', {
      params: { employeeId },
    });
  }
}
