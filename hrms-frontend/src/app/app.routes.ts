import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('../Authentication/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('../Dashboards/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboard
      ),
    children: [
      { path: '', redirectTo: 'admin-home', pathMatch: 'full' },
      {
        path: 'admin-home',
        loadComponent: () =>
          import('../Components/Admin/admin-home/admin-home').then(
            (m) => m.AdminHome
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('../Components/Admin/employees/employees').then(
            (m) => m.Employees
          ),
      },
      {
        path: 'department',
        loadComponent: () =>
          import('../Components/Admin/departments/departments').then(
            (m) => m.Departments
          ),
      },
      {
        path: 'designation',
        loadComponent: () =>
          import('../Components/Admin/designation/designation').then(
            (m) => m.Designation
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import('../Components/Admin/admin-attendance/admin-attendance').then(
            (m) => m.AdminAttendance
          ),
      },
      {
        path: 'admin-leave',
        loadComponent: () =>
          import('../Components/Admin/admin-leave/admin-leave').then(
            (m) => m.AdminLeave
          ),
      },
      {
        path: 'admin-payroll',
        loadComponent: () =>
          import('../Components/Admin/payroll/payroll').then((m) => m.Payroll),
      },
    ],
  },
  {
    path: 'employee',
    loadComponent: () =>
      import('../Dashboards/employee-dashboard/employee-dashboard').then(
        (m) => m.EmployeeDashboard
      ),
    children: [
      { path: '', redirectTo: 'employee-home', pathMatch: 'full' },
      {
        path: 'employee-home',
        loadComponent: () =>
          import('../Components/Employee/employee-home/employee-home').then(
            (m) => m.EmployeeHome
          ),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import(
            '../Components/Employee/employee-attendance/employee-attendance'
          ).then((m) => m.EmployeeAttendance),
      },
      {
        path: 'leaves',
        loadComponent: () =>
          import('../Components/Employee/employee-leaves/employee-leaves').then(
            (m) => m.EmployeeLeaves
          ),
      },
      {
        path: 'payroll',
        loadComponent: () =>
          import(
            '../Components/Employee/employee-payroll/employee-payroll'
          ).then((m) => m.EmployeePayroll),
      },
    ],
  },
  { path: 'EmployeeDashboard', redirectTo: 'employee', pathMatch: 'full' },
  { path: 'ManagerDashboard', redirectTo: 'manager', pathMatch: 'full' },
  {
    path: 'manager',
    loadComponent: () =>
      import('../Dashboards/manager-dashboard/manager-dashboard').then(
        (m) => m.ManagerDashboard
      ),
    children: [
      { path: '', redirectTo: 'manager-home', pathMatch: 'full' },
      {
        path: 'manager-home',
        loadComponent: () =>
          import('../Components/Manager/manager-home/manager-home').then(
            (m) => m.ManagerHome
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('../Components/Manager/manager-team/manager-team').then(
            (m) => m.ManagerTeam
          ),
      },
      {
        path: 'leave-approvals',
        loadComponent: () =>
          import(
            '../Components/Manager/manager-leave-approvals/manager-leave-approvals'
          ).then((m) => m.ManagerLeaveApprovals),
      },
      {
        path: 'attendance',
        loadComponent: () =>
          import(
            '../Components/Manager/manager-attendance/manager-attendance'
          ).then((m) => m.ManagerAttendance),
      },
      {
        path: 'payroll',
        loadComponent: () =>
          import('../Components/Manager/manager-payroll/manager-payroll').then(
            (m) => m.ManagerPayroll
          ),
      },
      {
        path: 'my-portal',
        loadComponent: () =>
          import(
            '../Components/Manager/manager-my-portal/manager-my-portal'
          ).then((m) => m.ManagerMyPortal),
      },
    ],
  },
];
