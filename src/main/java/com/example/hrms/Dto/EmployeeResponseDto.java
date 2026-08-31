package com.example.hrms.Dto;

import java.time.LocalDate;

import com.example.hrms.Enums.EmployeeStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {

    private Long id;

    private String employeeCode;

    private String employeeName;

    private String email;

    private String phone;

    private String gender;

    private LocalDate dateOfBirth;

    private LocalDate joiningDate;

    private EmployeeStatus employeeStatus;

    private String bankAccountNumber;

    private String ifsc;

    private String departmentName;

    private String designationName;

    private String managerName;

    
}
