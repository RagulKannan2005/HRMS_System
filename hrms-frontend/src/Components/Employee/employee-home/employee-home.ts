import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  actionMessage: { text: string; isError: boolean } | null = null;

  ngOnInit(): void {
    this.loadTodayAttendance();
    this.loadLeaves();
    this.loadPayroll();
  }

  getTodayIsoString(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadTodayAttendance(): void {
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

  loadLeaves(): void {
    this.portalService.getMyLeaves().subscribe({
      next: (leaves: any[]) => {
        if (Array.isArray(leaves)) {
          this.recentLeaves = leaves.slice(0, 5);
          this.totalLeavesCount = leaves.length;
          this.pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;
        }
      },
      error: (err) => {
        console.error('Failed to load leaves', err);
      },
    });
  }

  loadPayroll(): void {
    this.portalService.getMyPayroll().subscribe({
      next: (payrolls: any[]) => {
        if (Array.isArray(payrolls) && payrolls.length > 0) {
          this.latestPayroll = payrolls[0];
        }
      },
      error: (err) => {
        console.error('Failed to load payroll', err);
      },
    });
  }

  onCheckIn(): void {
    this.isLoading = true;
    this.actionMessage = null;
    this.portalService.checkIn().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.todayAttendance = res;
        this.showMessage('Checked in successfully!', false);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error || 'Check-in failed. Please try again.';
        this.showMessage(typeof msg === 'string' ? msg : 'Check-in failed', true);
      },
    });
  }

  onCheckOut(): void {
    this.isLoading = true;
    this.actionMessage = null;
    this.portalService.checkOut().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.todayAttendance = res;
        this.showMessage('Checked out successfully!', false);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.error || 'Check-out failed. Please try again.';
        this.showMessage(typeof msg === 'string' ? msg : 'Check-out failed', true);
      },
    });
  }

  private showMessage(text: string, isError: boolean): void {
    this.actionMessage = { text, isError };
    setTimeout(() => {
      this.actionMessage = null;
    }, 4000);
  }
}
