package com.example.hrms.Dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.example.hrms.Enums.AttendanceStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponseDto {

    private Long id;
    private Long employeeId;
    private LocalDate date;
    private LocalTime checkin;
    private LocalTime checkout;
    private AttendanceStatus status;
    private Integer workMinutes;
    private Integer breakMinutes;
    private Integer overtimeMinutes;
    private Integer lateMinutes;
    private Integer earlyexitMinutes;
    private String remarks;
}
