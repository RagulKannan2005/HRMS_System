import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  ngOnInit(): void {
    this.loadAllattendance();
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.totalEmployees = users?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching users:', err),
    });

    this.adminService.getDepartments().subscribe({
      next: (depts) => {
        this.totalDepartments = depts?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching departments:', err),
    });

    this.adminService.getPendingLeaves().subscribe({
      next: (leaves) => {
        this.totalLeaves = leaves?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching pending leaves:', err),
    });
  }

  loadAllattendance(): void {
    this.attendanceService.getalldata().subscribe({
      next: (data) => {
        console.log('Fetched attendance data:', data);
        this.attendance = data || [];
        this.totalemployeePresent = this.attendance.filter(
          (u) => u.status === AttendanceStatus.PRESENT,
        ).length;

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching attendance records:', err),
    });
  }

  onFilter(): void {
    if (this.selectedDate && this.selectedStatus && this.selectedStatus !== 'all') {
      const statusValue =
        this.selectedStatus.toLowerCase() === 'leave'
          ? AttendanceStatus.ON_LEAVE
          : (this.selectedStatus.toUpperCase() as AttendanceStatus);

      this.attendanceService.getfilterdata(this.selectedDate, statusValue).subscribe({
        next: (data) => {
          this.attendance = data || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error filtering attendance:', err),
      });
    } else {
      this.loadAllattendance();
    }
  }
}

