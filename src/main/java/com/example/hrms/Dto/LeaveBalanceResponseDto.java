package com.example.hrms.Dto;

import com.example.hrms.Enums.LeaveType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalanceResponseDto {

    private Long id;
    private LeaveType leaveType;
    private Integer totalDays;
    private Integer usedDays;
    private Integer year;
    private Integer remainingDays;
}
