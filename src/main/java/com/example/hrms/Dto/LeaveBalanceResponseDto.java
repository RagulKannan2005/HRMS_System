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

    @Builder.Default
    private Integer remainingDays = 0;

    public Integer getRemainingDays() {
        if (totalDays == null || usedDays == null) {
            return 0;
        }
        return totalDays - usedDays;
    }
}
