import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmployeePortalService } from '../../../service/employee-portal';
import { Auth } from '../../../service/auth';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-home.html',
  styleUrl: './employee-home.css',
})
export class EmployeeHome implements OnInit {
  private portalService = inject(EmployeePortalService);
  private authService = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  username: string = this.authService.getUsername() || 'Employee';
  currentDate: string = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  todayAttendance: any = null;
  recentLeaves: any[] = [];
  pendingLeavesCount = 0;
  totalLeavesCount = 0;
  latestPayroll: any = null;

  isLoading = false;
  isInitialLoading = true;
  actionMessage: { text: string; isError: boolean } | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  getTodayIsoString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadDashboardData(): void {
    this.isInitialLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      attendance: this.portalService
        .getTodayAttendance(this.getTodayIsoString())
        .pipe(catchError(() => of(null))),
      leaves: this.portalService
        .getMyLeaves()
        .pipe(catchError(() => of([]))),
      payroll: this.portalService
        .getMyPayroll()
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: (results) => {
        // Attendance
        const res = results.attendance;
        if (Array.isArray(res) && res.length > 0) {
          this.todayAttendance = res[0];
        } else if (res && !Array.isArray(res)) {
          this.todayAttendance = res;
        } else {
          this.todayAttendance = null;
        }

        // Leaves
        const leaves = Array.isArray(results.leaves) ? results.leaves : [];
        this.recentLeaves = leaves.slice(0, 5);
        this.totalLeavesCount = leaves.length;
        this.pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;

        // Payroll
        const payrolls = Array.isArray(results.payroll) ? results.payroll : [];
        if (payrolls.length > 0) {
          this.latestPayroll = payrolls[0];
        } else {
          this.latestPayroll = null;
        }

        this.isInitialLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isInitialLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onCheckIn(): void {
    this.isLoading = true;
    this.actionMessage = null;
    this.cdr.markForCheck();

    this.portalService.checkIn().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.todayAttendance = res;
        this.showMessage('Checked in successfully!', false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        const msg =
          err?.error?.message ||
          err?.error ||
          'Check-in failed. Please try again.';
        this.showMessage(
          typeof msg === 'string' ? msg : 'Check-in failed',
          true
        );
        this.cdr.markForCheck();
      },
    });
  }

  onCheckOut(): void {
    this.isLoading = true;
    this.actionMessage = null;
    this.cdr.markForCheck();

    this.portalService.checkOut().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.todayAttendance = res;
        this.showMessage('Checked out successfully!', false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        const msg =
          err?.error?.message ||
          err?.error ||
          'Check-out failed. Please try again.';
        this.showMessage(
          typeof msg === 'string' ? msg : 'Check-out failed',
          true
        );
        this.cdr.markForCheck();
      },
    });
  }

  private showMessage(text: string, isError: boolean): void {
    this.actionMessage = { text, isError };
    this.cdr.markForCheck();
    setTimeout(() => {
      this.actionMessage = null;
      this.cdr.markForCheck();
    }, 4000);
  }
}
