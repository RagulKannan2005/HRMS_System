package com.example.hrms.Dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.hrms.Enums.LeaveStatus;
import com.example.hrms.Enums.LeaveType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveResponseDto {

    private Long id;

    private Long employeeId;

    private String employeeName;

    private LeaveType leaveType;

    private LocalDate fromDate;

    private LocalDate toDate;

    private Integer numberOfDays;

    private String reason;

    private LeaveStatus status;

    private Long approvedBy;

    private LocalDateTime appliedOn;
}
