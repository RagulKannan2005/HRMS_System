import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EmployeeCreatePayload {
  employeeCode: string;
  employeeName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  joiningDate: string;
  bankAccountNumber: string;
  ifsc: string;
  departmentId: number;
  designationId: number;
  basicSalary: number;
  hra: number;
  otherAllowance: number;
  pfPercent: number;
  taxPercent: number;
  password: string;
  managerId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  private http = inject(HttpClient);
  private managerApi = 'http://localhost:8081/api/v1/manager';
  private attendanceApi = 'http://localhost:8081/api/v1/employee/attendance';
  private leaveApi = 'http://localhost:8081/api/v1/employee/leaves';
  private payrollApi = 'http://localhost:8081/api/v1/payroll/employee';
  private salaryApi = 'http://localhost:8081/api/v1/employee/employeesalary';
  private adminApi = 'http://localhost:8081/api/v1/admin';

  private getAuthHeader(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    });
  }

  // --- Team Management ---
  getMyTeam(managerName?: string): Observable<any[]> {
    const url = managerName
      ? `${this.managerApi}/my-team/${encodeURIComponent(managerName)}`
      : `${this.managerApi}/my-team`;
    return this.http.get<any[]>(url, { headers: this.getAuthHeader() });
  }

  createEmployee(payload: EmployeeCreatePayload): Observable<any> {
    return this.http.post<any>(`${this.managerApi}/create-employee`, payload, {
      headers: this.getAuthHeader(),
    });
  }

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/departments`, {
      headers: this.getAuthHeader(),
    });
  }

  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminApi}/designations`, {
      headers: this.getAuthHeader(),
    });
  }

  // --- Leave Approvals ---
  getLeavesByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.leaveApi}/getleavesbystatus/${status}`, {
      headers: this.getAuthHeader(),
    });
  }

  getPendingLeaves(): Observable<any[]> {
    return this.getLeavesByStatus('PENDING');
  }

  getEmployeeLeaveBalance(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.managerApi}/my-leave-balance/${employeeId}`, {
      headers: this.getAuthHeader(),
    });
  }

  approveLeave(leaveId: number): Observable<any> {
    return this.http.put<any>(
      `${this.managerApi}/${leaveId}/approve-leave`,
      {},
      { headers: this.getAuthHeader() },
    );
  }

  rejectLeave(leaveId: number): Observable<any> {
    return this.http.put<any>(
      `${this.managerApi}/${leaveId}/reject-leave`,
      {},
      { headers: this.getAuthHeader() },
    );
  }

  // --- Attendance ---
  getAllAttendance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.attendanceApi}/all`, {
      headers: this.getAuthHeader(),
    });
  }

  getAttendanceByDateAndStatus(date: string, status: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.attendanceApi}/get-by-status-and-date/${date}/${status}`,
      { headers: this.getAuthHeader() },
    );
  }

  // --- Payroll & Salary ---
  getAllSalaries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.salaryApi}/getAllEmployeeSalary`, {
      headers: this.getAuthHeader(),
    });
  }

  getSalaryByEmployeeId(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.salaryApi}/getsalaryByEmployeeId/${employeeId}`, {
      headers: this.getAuthHeader(),
    });
  }

  generatePayroll(employeeId: number, year: number, month: number): Observable<any> {
    return this.http.post<any>(
      `${this.payrollApi}/generate`,
      {},
      {
        headers: this.getAuthHeader(),
        params: { employeeId, year, month },
      },
    );
  }

  getPayrollByEmployeeId(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollApi}/id`, {
      headers: this.getAuthHeader(),
      params: { employeeId },
    });
  }

  // --- Manager Personal Self-Service ---
  checkIn(): Observable<any> {
    return this.http.post<any>(`${this.attendanceApi}/check-in`, {}, {
      headers: this.getAuthHeader(),
    });
  }

  checkOut(): Observable<any> {
    return this.http.put<any>(`${this.attendanceApi}/check-out`, {}, {
      headers: this.getAuthHeader(),
    });
  }

  getTodayAttendance(date: string): Observable<any> {
    return this.http.get<any>(`${this.attendanceApi}/date`, {
      headers: this.getAuthHeader(),
      params: { date },
    });
  }

  applyLeave(payload: any): Observable<any> {
    return this.http.post<any>(`${this.leaveApi}/applyleave`, payload, {
      headers: this.getAuthHeader(),
    });
  }

  getMyLeaves(): Observable<any[]> {
    return this.http.get<any[]>(`${this.leaveApi}/my-leaves`, {
      headers: this.getAuthHeader(),
    });
  }

  getMyPayroll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.payrollApi}/my-payroll`, {
      headers: this.getAuthHeader(),
    });
  }
}
