import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeePortalService } from '../../../service/employee-portal';
import { Auth } from '../../../service/auth';

@Component({
  selector: 'app-employee-payroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-payroll.html',
  styleUrl: './employee-payroll.css',
})
export class EmployeePayroll implements OnInit {
  private portalService = inject(EmployeePortalService);
  private authService = inject(Auth);

  username: string = this.authService.getUsername() || 'Employee';
  payrolls: any[] = [];
  selectedPayslip: any = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadPayroll();
  }

  loadPayroll(): void {
    this.isLoading = true;
    this.portalService.getMyPayroll().subscribe({
      next: (data: any[]) => {
        this.isLoading = false;
        this.payrolls = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to load payroll', err);
      },
    });
  }

  openPayslip(slip: any): void {
    this.selectedPayslip = slip;
  }

  closePayslip(): void {
    this.selectedPayslip = null;
  }

  printPayslip(): void {
    window.print();
  }

  getMonthName(monthNum: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1] || `Month ${monthNum}`;
  }
}
