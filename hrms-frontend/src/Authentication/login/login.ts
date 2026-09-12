import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../service/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);

  loginData = this.fb.group({
    email: [''],
    password: [''],
  });

  constructor(private router: Router) {}

  onLogin() {
    const credentials = {
      email: this.loginData.value.email,
      password: this.loginData.value.password,
    };
    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              username: response.username || response.user?.userName || response.user?.username,
              role: response.role || response.user?.role,
            }),
          );
          const userRole = (response?.role || response?.user?.role || '').toString().toUpperCase();
          if (userRole === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else if (userRole === 'MANAGER') {
            this.router.navigate(['/ManagerDashboard']);
          } else if (userRole === 'EMPLOYEE') {
            this.router.navigate(['/EmployeeDashboard']);
          }
        }
        console.log('login successful');
      },
      error: (error) => {
        console.log('login failed', error);
      },
    });
  }
}
