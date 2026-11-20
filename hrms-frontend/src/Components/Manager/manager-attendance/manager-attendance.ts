import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../service/manager.service';

@Component({
  selector: 'app-manager-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-attendance.html',
  styleUrl: './manager-attendance.css',
})
export class ManagerAttendance implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  attendanceRecords: any[] = [];
  filteredRecords: any[] = [];

  selectedDate: string = '';
  selectedStatus: string = 'ALL';
  searchQuery: string = '';

  isLoading: boolean = false;

  // Metrics
  totalPresent: number = 0;
  totalOnLeave: number = 0;
  totalLate: number = 0;

  ngOnInit(): void {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.selectedDate = `${yyyy}-${mm}-${dd}`;

    this.loadAttendance();
  }

  loadAttendance(): void {
    this.isLoading = true;
    this.managerService.getAllAttendance().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.attendanceRecords = data || [];
        this.applyFilter();
        this.calculateMetrics();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching attendance:', err);
        this.cdr.markForCheck();
      },
    });
  }

  applyFilter(): void {
    let result = [...this.attendanceRecords];

    if (this.selectedDate) {
      result = result.filter((r) => r.date === this.selectedDate);
    }

    if (this.selectedStatus && this.selectedStatus !== 'ALL') {
      result = result.filter((r) => r.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.employeeName || '').toLowerCase().includes(q) ||
          (r.employeeCode || '').toLowerCase().includes(q) ||
          (r.departmentName || '').toLowerCase().includes(q),
      );
    }

    this.filteredRecords = result;
    this.cdr.markForCheck();
  }

  calculateMetrics(): void {
    const current = this.filteredRecords;
    this.totalPresent = current.filter((r) => r.status === 'PRESENT').length;
    this.totalOnLeave = current.filter((r) => r.status === 'ON_LEAVE').length;
    this.totalLate = current.filter((r) => r.lateMinutes && r.lateMinutes > 0).length;
  }

  onDateChange(): void {
    this.applyFilter();
    this.calculateMetrics();
  }

  onStatusChange(): void {
    this.applyFilter();
    this.calculateMetrics();
  }

  formatMinutes(mins: number): string {
    if (!mins) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }
}
