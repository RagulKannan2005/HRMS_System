package com.example.hrms.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;


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

    //salary details
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal otherAllowance;
    private BigDecimal taxPercent;
    private BigDecimal pfPercent;
    private LocalDate salaryEffectiveFrom;

}