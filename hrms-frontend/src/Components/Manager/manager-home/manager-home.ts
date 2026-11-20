import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  isLoading: boolean = false;

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

    this.loadInitialData();
  }

  getTodayIso(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      attendance: this.managerService
        .getTodayAttendance(this.getTodayIso())
        .pipe(catchError(() => of(null))),
      team: this.managerService
        .getMyTeam(this.managerName)
        .pipe(catchError(() => of([]))),
      leaves: this.managerService
        .getPendingLeaves()
        .pipe(catchError(() => of([]))),
      allAttendance: this.managerService
        .getAllAttendance()
        .pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        // Today attendance
        const att = res.attendance;
        if (Array.isArray(att) && att.length > 0) {
          this.todayAttendance = att[0];
        } else if (att && !Array.isArray(att)) {
          this.todayAttendance = att;
        } else {
          this.todayAttendance = null;
        }

        // Team
        this.teamMembers = res.team || [];
        this.teamCount = this.teamMembers.length;

        // Pending leaves
        this.pendingLeaves = res.leaves || [];
        this.pendingLeavesCount = this.pendingLeaves.length;

        // Present count
        const todayIso = this.getTodayIso();
        const records = res.allAttendance || [];
        this.presentTodayCount = records.filter(
          (r: any) => r.date === todayIso && r.status === 'PRESENT'
        ).length;

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading manager initial data:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadPendingLeaves(): void {
    this.managerService.getPendingLeaves().subscribe({
      next: (data) => {
        this.pendingLeaves = data || [];
        this.pendingLeavesCount = this.pendingLeaves.length;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error fetching pending leaves:', err),
    });
  }

  onCheckIn(): void {
    this.isClocking = true;
    this.clockMessage = null;
    this.cdr.markForCheck();

    this.managerService.checkIn().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showMessage('Shift checked in successfully!', false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isClocking = false;
        const msg =
          err?.error?.message || err?.error?.error || 'Check-in failed';
        this.showMessage(typeof msg === 'string' ? msg : 'Check-in failed', true);
        this.cdr.markForCheck();
      },
    });
  }

  onCheckOut(): void {
    this.isClocking = true;
    this.clockMessage = null;
    this.cdr.markForCheck();

    this.managerService.checkOut().subscribe({
      next: (res) => {
        this.isClocking = false;
        this.todayAttendance = res;
        this.showMessage('Shift checked out successfully!', false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isClocking = false;
        const msg =
          err?.error?.message || err?.error?.error || 'Check-out failed';
        this.showMessage(
          typeof msg === 'string' ? msg : 'Check-out failed',
          true
        );
        this.cdr.markForCheck();
      },
    });
  }

  onApproveLeave(id: number): void {
    this.actionLoading = true;
    this.cdr.markForCheck();

    this.managerService.approveLeave(id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.loadPendingLeaves();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.actionLoading = false;
        alert(err?.error?.message || err?.error?.error || 'Approval failed');
        this.cdr.markForCheck();
      },
    });
  }

  onRejectLeave(id: number): void {
    this.actionLoading = true;
    this.cdr.markForCheck();

    this.managerService.rejectLeave(id).subscribe({
      next: () => {
        this.actionLoading = false;
        this.loadPendingLeaves();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.actionLoading = false;
        alert(err?.error?.message || err?.error?.error || 'Rejection failed');
        this.cdr.markForCheck();
      },
    });
  }

  private showMessage(msg: string, isError: boolean): void {
    this.clockMessage = msg;
    this.clockError = isError;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.clockMessage = null;
      this.cdr.markForCheck();
    }, 4500);
  }
}
