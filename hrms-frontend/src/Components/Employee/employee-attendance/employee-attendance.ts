import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeePortalService } from '../../../service/employee-portal';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.css',
})
export class EmployeeAttendance implements OnInit {
  private portalService = inject(EmployeePortalService);

  todayAttendance: any = null;
  attendanceRecords: any[] = [];
  selectedMonth: string = this.getCurrentYearMonth();

  totalDays = 0;
  presentCount = 0;
  absentCount = 0;
  leaveCount = 0;

  isLoading = false;
  banner: { message: string; isError: boolean } | null = null;

  ngOnInit(): void {
    this.loadTodayStatus();
    this.loadMonthAttendance();
  }

  getCurrentYearMonth(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  }

  getTodayIsoString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadTodayStatus(): void {
    this.portalService.getTodayAttendance(this.getTodayIsoString()).subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          this.todayAttendance = res[0];
        } else if (res && !Array.isArray(res)) {
          this.todayAttendance = res;
        } else {
          this.todayAttendance = null;
        }
      },
      error: () => {
        this.todayAttendance = null;
      },
    });
  }

  loadMonthAttendance(): void {
    this.isLoading = true;
    const queryDate = `${this.selectedMonth}-01`;
    this.portalService.getMonthAttendance(queryDate).subscribe({
      next: (records: any[]) => {
        this.isLoading = false;
        this.attendanceRecords = Array.isArray(records) ? records : [];
        this.calculateStats();
      },
      error: (err) => {
        this.isLoading = false;
        this.attendanceRecords = [];
        console.error('Failed to load month attendance', err);
      },
    });
  }

  calculateStats(): void {
    this.totalDays = this.attendanceRecords.length;
    this.presentCount = this.attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    this.absentCount = this.attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    this.leaveCount = this.attendanceRecords.filter((r) => r.status === 'ON_LEAVE').length;
  }

  onMonthChange(): void {
    this.loadMonthAttendance();
  }

  onCheckIn(): void {
    this.isLoading = true;
    this.banner = null;
    this.portalService.checkIn().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.todayAttendance = res;
        this.showBanner('Checked in successfully!', false);
        this.loadMonthAttendance();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error || 'Check-in failed.';
        this.showBanner(typeof msg === 'string' ? msg : 'Check-in failed', true);
      },
    });
  }

  onCheckOut(): void {
    this.isLoading = true;
    this.banner = null;
    this.portalService.checkOut().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.todayAttendance = res;
        this.showBanner('Checked out successfully!', false);
        this.loadMonthAttendance();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error || 'Check-out failed.';
        this.showBanner(typeof msg === 'string' ? msg : 'Check-out failed', true);
      },
    });
  }

  private showBanner(message: string, isError: boolean): void {
    this.banner = { message, isError };
    setTimeout(() => {
      this.banner = null;
    }, 4000);
  }
}
