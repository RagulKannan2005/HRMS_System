import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LeaveRequestPayload {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeePortalService {
  private http = inject(HttpClient);
  private attendanceUrl = 'http://localhost:8081/api/v1/employee/attendance';
  private leaveUrl = 'http://localhost:8081/api/v1/employee/leaves';
  private payrollUrl = 'http://localhost:8081/api/v1/payroll/employee';

  // --- Attendance ---
  checkIn(): Observable<any> {
    return this.http.post(`${this.attendanceUrl}/check-in`, {});
  }

  checkOut(): Observable<any> {
    return this.http.put(`${this.attendanceUrl}/check-out`, {});
  }

  getTodayAttendance(dateString: string): Observable<any> {
    return this.http.get(`${this.attendanceUrl}/date`, {
      params: { date: dateString },
    });
  }

  getMonthAttendance(dateString: string): Observable<any> {
    return this.http.get(`${this.attendanceUrl}/month`, {
      params: { date: dateString },
    });
  }

  // --- Leaves ---
  applyLeave(payload: LeaveRequestPayload): Observable<any> {
    return this.http.post(`${this.leaveUrl}/applyleave`, payload);
  }

  cancelLeave(leaveId: number): Observable<any> {
    return this.http.put(`${this.leaveUrl}/cancel-leave/${leaveId}`, {});
  }

  getMyLeaves(): Observable<any> {
    return this.http.get(`${this.leaveUrl}/my-leaves`);
  }

  // --- Payroll ---
  getMyPayroll(): Observable<any> {
    return this.http.get(`${this.payrollUrl}/my-payroll`);
  }
}
