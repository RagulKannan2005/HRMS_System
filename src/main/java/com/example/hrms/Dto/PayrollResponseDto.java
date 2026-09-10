package com.example.hrms.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class PayrollResponseDto {
    private Long id;
    private String employeeName;
    private Integer month;
    private Integer year;
    private BigDecimal grossSalary;
    private BigDecimal deductions;
    private BigDecimal leaveDeduction;
    private BigDecimal tax;
    private BigDecimal pf;
    private BigDecimal totalDeduction;
    private BigDecimal netSalary;
    private LocalDateTime processedAt;
    
}
