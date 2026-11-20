import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ManagerService } from '../../../service/manager.service';

@Component({
  selector: 'app-manager-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manager-home.html',
  styleUrl: './manager-home.css',
})
export class ManagerHome implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  managerName: string = 'Manager';
  todayFormatted: string = '';

  // Shift & Attendance
  todayAttendance: any = null;
  isClocking: boolean = false;
  clockMessage: string | null = null;
  clockError: boolean = false;

  // Metrics
  teamCount: number = 0;
  pendingLeavesCount: number = 0;
  presentTodayCount: number = 0;
  totalLeavesCount: number = 0;

  // Data
  pendingLeaves: any[] = [];
  teamMembers: any[] = [];

  // Action status
  actionLoading: boolean = false;

  ngOnInit(): void {
    const today = new Date();
    this.todayFormatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.managerName = parsed.username || 'Manager';
      }
    } catch {
      this.managerName = 'Manager';
    }

    this.loadTodayAttendance();
    this.loadTeam();
    this.loadPendingLeaves();
    this.loadAttendanceMetrics();
  }

  getTodayIso(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadTodayAttendance(): void {
    this.managerService.getTodayAttendance(this.getTodayIso()).subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          this.todayAttendance = res[0];
        } else if (res && !Array.isArray(res)) {
          this.todayAttendance = res;
        } else {
          this.todayAttendance = null;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.todayAttendance = null;
      },
    });
  }

  loadTeam(): void {
    this.managerService.getMyTeam(this.managerName).subscribe({
      next: (data) => {
        this.teamMembers = data || [];
        this.teamCount = this.teamMembers.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching team:', err),
    });
  }

  loadPendingLeaves(): void {
    this.managerService.getPendingLeaves().subscribe({
      next: (data) => {
        this.pendingLeaves = data || [];
        this.pendingLeavesCount = this.pendingLeaves.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching pending leaves:', err),
    });
  }

  loadAttendanceMetrics(): void {
    this.managerService.getAllAttendance().subscribe({
      next: (data) => {
        const todayIso = this.getTodayIso();
        const records = data || [];
        this.presentTodayCount = records.filter(
          (r: any) => r.date === todayIso && r.status === 'PRESENT',
        ).length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching attendance metrics:', err),
    });
  }

  onCheckIn(): void {
    this.isClocking = true;
    this.clockMessage = null;
    this.managerService.checkIn().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showMessage('Shift checked in successfully!', false);
      },
      error: (err) => {
        this.isClocking = false;
        const msg = err?.error?.message || err?.error?.error || 'Check-in failed';
        this.showMessage(typeof msg === 'string' ? msg : 'Check-in failed', true);
      },
    });
  }

  onCheckOut(): void {
    this.isClocking = true;
    this.clockMessage = null;
    this.managerService.checkOut().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showMessage('Shift checked out successfully!', false);
      },
      error: (err) => {
        this.isClocking = false;
        const msg = err?.error?.message || err?.error?.error || 'Check-out failed';
        this.showMessage(typeof msg === 'string' ? msg : 'Check-out failed', true);
      },
    });
  }

  onApproveLeave(id: number): void {
    this.actionLoading = true;
    this.managerService.approveLeave(id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.loadPendingLeaves();
      },
      error: (err) => {
        this.actionLoading = false;
        alert(err?.error?.message || err?.error?.error || 'Approval failed');
      },
    });
  }

  onRejectLeave(id: number): void {
    this.actionLoading = true;
    this.managerService.rejectLeave(id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.loadPendingLeaves();
      },
      error: (err) => {
        this.actionLoading = false;
        alert(err?.error?.message || err?.error?.error || 'Rejection failed');
      },
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.clockMessage = msg;
    this.clockError = isError;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.clockMessage = null;
      this.cdr.detectChanges();
    }, 4500);
  }
}
