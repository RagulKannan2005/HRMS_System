import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from '../../../service/admin.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  totalEmployees = 0;
  totalManagers = 0;
  totalDepartments = 0;
  totalLeaves = 0;
  pendingLeavesList: any[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadDashboardMetrics();
  }

  loadDashboardMetrics(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      users: this.adminService.getAllUsers().pipe(catchError(() => of([]))),
      managers: this.adminService.getManagers().pipe(catchError(() => of([]))),
      departments: this.adminService.getDepartments().pipe(catchError(() => of([]))),
      leaves: this.adminService.getPendingLeaves().pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.totalEmployees = res.users?.length || 0;
        this.totalManagers = res.managers?.length || 0;
        this.totalDepartments = res.departments?.length || 0;
        this.pendingLeavesList = res.leaves || [];
        this.totalLeaves = this.pendingLeavesList.length;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching dashboard metrics:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadPendingLeaves(): void {
    this.adminService.getPendingLeaves().subscribe({
      next: (leaves) => {
        this.pendingLeavesList = leaves || [];
        this.totalLeaves = this.pendingLeavesList.length;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error fetching pending leaves:', err),
    });
  }

  onApproveLeave(id: number): void {
    this.adminService.approveLeave(id).subscribe({
      next: () => this.loadPendingLeaves(),
      error: (err) => console.error('Error approving leave:', err),
    });
  }

  onRejectLeave(id: number): void {
    this.adminService.rejectLeave(id).subscribe({
      next: () => this.loadPendingLeaves(),
      error: (err) => console.error('Error rejecting leave:', err),
    });
  }
}
