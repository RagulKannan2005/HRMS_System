import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  ngOnInit(): void {
    this.loadDashboardMetrics();
  }

  loadDashboardMetrics(): void {
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Fetched users:', users);
        this.totalEmployees = users?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching users:', err),
    });

    this.adminService.getManagers().subscribe({
      next: (managers) => {
        console.log('Fetched managers:', managers);
        this.totalManagers = managers?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching managers:', err),
    });

    this.adminService.getDepartments().subscribe({
      next: (depts) => {
        console.log('Fetched departments:', depts);
        this.totalDepartments = depts?.length || 0;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching departments:', err),
    });

    this.loadPendingLeaves();
  }

  loadPendingLeaves(): void {
    this.adminService.getPendingLeaves().subscribe({
      next: (leaves) => {
        console.log('Fetched pending leaves:', leaves);
        this.pendingLeavesList = leaves || [];
        this.totalLeaves = this.pendingLeavesList.length;
        this.cdr.detectChanges();
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
