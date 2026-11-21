import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-report',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './admin-report.html',
  styleUrl: './admin-report.css',
})
export class AdminReport {

  employeeData: any[] = [];
  filteredEmployees: any[] = [];
  search: string = ''
  show: boolean = true

  loginData = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,

    ])
  })


  showForm() {
    this.show = !this.show
  }

  showEmployee() {
    const employee = this.search.trim().toLowerCase();
    if (!employee) {
      this.filteredEmployees = [...this.employeeData];
      return;
    }
    this.filteredEmployees = this.employeeData.filter(emp => emp.email?.toLowerCase().includes(employee));
  }


  submitForm() {
    this.employeeData.push(this.loginData.value)
    this.showForm();
    this.loginData.reset()
    console.log('employee data :', this.employeeData)
  }
}
