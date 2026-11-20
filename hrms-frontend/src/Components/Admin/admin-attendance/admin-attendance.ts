import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AttendanceService } from '../../../service/Attendance.service';
import { AdminService } from '../../../service/admin.service';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
}

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-attendance.html',
  styleUrl: './admin-attendance.css',
})
export class AdminAttendance implements OnInit {
  private attendanceService = inject(AttendanceService);
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  totalEmployees = 0;
  totalDepartments = 0;
  totalLeaves = 0;
  totalemployeePresent = 0;

  attendance: any[] = [];
  selectedDate: string = '';
  selectedStatus: string = 'all';
  isLoading = false;

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      attendance: this.attendanceService.getalldata().pipe(catchError(() => of([]))),
      users: this.adminService.getAllUsers().pipe(catchError(() => of([]))),
      departments: this.adminService.getDepartments().pipe(catchError(() => of([]))),
      leaves: this.adminService.getPendingLeaves().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.attendance = res.attendance || [];
        this.totalemployeePresent = this.attendance.filter(
          (u) => u.status === AttendanceStatus.PRESENT
        ).length;
        this.totalEmployees = res.users?.length || 0;
        this.totalDepartments = res.departments?.length || 0;
        this.totalLeaves = res.leaves?.length || 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading attendance initial data:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadAllattendance(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.attendanceService.getalldata().subscribe({
      next: (data) => {
        this.attendance = data || [];
        this.totalemployeePresent = this.attendance.filter(
          (u) => u.status === AttendanceStatus.PRESENT
        ).length;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching attendance records:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onFilter(): void {
    if (this.selectedDate && this.selectedStatus && this.selectedStatus !== 'all') {
      const statusValue =
        this.selectedStatus.toLowerCase() === 'leave'
          ? AttendanceStatus.ON_LEAVE
          : (this.selectedStatus.toUpperCase() as AttendanceStatus);

      this.isLoading = true;
      this.cdr.markForCheck();

      this.attendanceService.getfilterdata(this.selectedDate, statusValue).subscribe({
        next: (data) => {
          this.attendance = data || [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error filtering attendance:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.loadAllattendance();
    }
  }
}
