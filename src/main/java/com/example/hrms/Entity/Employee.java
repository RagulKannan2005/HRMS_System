package com.example.hrms.Entity;

import com.example.hrms.Enums.EmployeeStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name="employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="employee_code",unique = true,nullable = false)
    private String employeeCode;

    @Column(name="employeeName",nullable=false)
    private String employeeName;

    @Column(name="email",unique = true,nullable = false)
    private String email;

    @Column(name="password",nullable = false)
    private String password;

    @Column(name="phone",nullable = false)
    private String phone;

    @Column(name="gender",nullable = false)
    private String gender;

    @Column(name = "dateOfBirth",nullable = false)
    private String dateOfBirth;

    @Column(name = "joining_date",nullable = false)
    private String joiningDate;

    @Column(name="employeeStatus",nullable = false)
    private EmployeeStatus employeeStatus;

    @Column(name = "bacnkAccountNumber",nullable = false)
    private String bankAccountNumber;

    @Column(name = "ifsc")
    private String ifsc;

    @Column(name="departmentId")
    private Long departmentId;

    @Column(name="designationId")
    private Long designationId;

    @Column(name = "managerId")
    private Long managerId;
    
}
