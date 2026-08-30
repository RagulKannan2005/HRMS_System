package com.example.hrms.Dto;

import java.time.LocalDate;

import com.example.hrms.Enums.EmployeeStatus;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequestDto {

    private String employeeCode;

    private String employeeName;

    private String email;

    private String password;

    private String phone;

    private String gender;

    private LocalDate dateOfBirth;

    private LocalDate joiningDate;

    private String bankAccountNumber;

    private String ifsc;

    private Long departmentId;

    private Long designationId;
}