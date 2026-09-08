package com.example.hrms.Dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSalaryResponse {

    private Long id;

    private String employeeId;
    private String employeeName;

    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal otherAllowance;
    private BigDecimal taxPercent;
    private BigDecimal pfPercent;
    private LocalDate salaryEffectiveFrom;
}
