package com.example.hrms.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.AttendanceRequestDto;
import com.example.hrms.Dto.AttendanceResponseDto;
import com.example.hrms.Entity.Attendance;
import com.example.hrms.Entity.Employee;
import com.example.hrms.Entity.User;
import com.example.hrms.Enums.AttendanceStatus;
import com.example.hrms.Enums.LeaveStatus;
import com.example.hrms.Repository.AttendanceRepository;
import com.example.hrms.Repository.EmployeeRepository;
import com.example.hrms.Repository.LeaveRequestRepository;
import java.util.*;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendancerepo;
    private final EmployeeRepository employeerepo;
    private final LeaveRequestRepository leaveRequestrepo;

    // public AttendanceResponseDto markAttendance(AttendanceRequestDto request) {
    // Authentication authentication =
    // SecurityContextHolder.getContext().getAuthentication();
    // User user = (User) authentication.getPrincipal();

    // Long employeeId = user.getEmployeeId();

    // if (employeeId == null) {
    // throw new RuntimeException("Employee not found");
    // }
    // Employee employee = employeerepo.findById(employeeId)
    // .orElseThrow(() -> new RuntimeException("Employee not found"));

    // if (attendancerepo.existsByEmployee_IdAndDate(employeeId, request.getDate()))
    // {
    // throw new RuntimeException("Attendance already marked for this date");
    // }

    // int breakMintutes=60;

    // int workMinutes=0;
    // if (request.getCheckin()!=null&&request.getCheckout()!=null) {
    // long
    // totalMinutes=Duration.between(request.getCheckin(),request.getCheckout()).toMinutes();

    // workMinutes=(int)totalMinutes-breakMintutes;
    // if (workMinutes<0) {
    // throw new RuntimeException("Break time cannot be greater than working
    // duration");
    // }
    // }
    // int standardWorkMinutes=8*60;

    // int overtime_minutes=Math.max(0, workMinutes-standardWorkMinutes);

    // Attendance attendance = Attendance.builder()
    // .employee(employee)
    // .date(request.getDate())
    // .checkin(request.getCheckin())
    // .checkout(request.getCheckout())
    // .status(request.getStatus())
    // .workMinutes(workMinutes)
    // .breakMinutes(breakMintutes)
    // .overtimeMinutes(overtime_minutes)
    // .lateMinutes(request.getLateMinutes())
    // .earlyMinutes(request.getEarlyexitMinutes())
    // .remarks(request.getRemarks())
    // .build();
    // Attendance savedAttendance = attendancerepo.save(attendance);
    // return convertToResponseDto(savedAttendance);
    // }

    @Transactional
    public AttendanceResponseDto checkIn() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Long employeeId = user.getEmployeeId();

        if (employeeId == null) {
            throw new RuntimeException("Employee not found");

        }

        Employee employee = employeerepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate today = LocalDate.now();

        if (leaveRequestrepo.existsApprovedLeaveForDate(employeeId, today, LeaveStatus.APPROVED)) {
            throw new RuntimeException("You are on approved leave today. Check-in is not allowed.");
        }

        if (attendancerepo.existsByEmployee_IdAndDate(employeeId, today)) {
            throw new RuntimeException("Attendance already marked for today");
        }

        LocalTime checkinTime = LocalTime.now();

        int lateMinutes = calculateLateMinutes(checkinTime);

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .checkin(checkinTime)
                .status(AttendanceStatus.PRESENT)
                .lateMinutes(lateMinutes)
                .build();

        Attendance savAttendance = attendancerepo.save(attendance);
        return convertToResponseDto(savAttendance);
    }

    @Transactional
    public AttendanceResponseDto checkOut() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Long employeeId = user.getEmployeeId();

        if (employeeId == null) {
            throw new RuntimeException("Employee not found");

        }
        LocalDate today = LocalDate.now();

        Attendance attendance = attendancerepo.findByEmployee_IdAndDate(employeeId, today)
                .orElseThrow(() -> new RuntimeException("Please check in first"));
        if (attendance.getCheckout()!=null) {
            throw new RuntimeException("Already checked out");
        }

        LocalTime chechoutTime=LocalTime.now();

        attendance.setCheckout(chechoutTime);

        long totalMinutes = Duration.between(attendance.getCheckin(), chechoutTime).toMinutes();

        int breakMinutes = 60;

        int workMinutes = (int) totalMinutes - breakMinutes;
        if(workMinutes<0){
            throw new RuntimeException("Break time is greater than work time");  
        }
        int standardWorkMinutes=8*60;

        int overtimeMinutes=Math.max(0,workMinutes-standardWorkMinutes);

        int earlyMinutes=calculateEarlyMinutes(chechoutTime);

        attendance.setBreakMinutes(breakMinutes);
        attendance.setWorkMinutes(workMinutes);
        attendance.setOvertimeMinutes(overtimeMinutes);
        attendance.setEarlyMinutes(earlyMinutes);
        
        Attendance savedAttendance=attendancerepo.save(attendance);
        return convertToResponseDto(savedAttendance);
    }

    @Transactional
    public List<AttendanceResponseDto> getEmployeeAttendance(LocalDate date) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Long employeeId = user.getEmployeeId();

        if (employeeId == null) {
            throw new RuntimeException("Employee not found");
        }

        List<Attendance> attendances = attendancerepo.findAllByEmployee_IdAndDate(employeeId, date);
        return attendances.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    }

    @Transactional
    public List<AttendanceResponseDto> getEmployeeAttendanceByMonth(LocalDate date) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Long employeeId = user.getEmployeeId();

        if (employeeId == null) {
            throw new RuntimeException("Employee not found");
        }
        int year = date.getYear();
        int month = date.getMonthValue();

        List<Attendance> attendances = attendancerepo.findByEmployee_IdAndYearAndMonth(employeeId, year, month);
        return attendances.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    }

    private int calculateLateMinutes(LocalTime time){

        LocalTime expectedCheckIn=LocalTime.of(9,0);
        if (time.isAfter(expectedCheckIn)) {
            return (int) Duration.between(expectedCheckIn, time).toMinutes();
            
        }
        return 0;
    }

    private int calculateEarlyMinutes(LocalTime time){
        LocalTime expectedcheckOutTime=LocalTime.of(18,0);

        if (time.isBefore(expectedcheckOutTime)) {
            return (int) Duration.between(time, expectedcheckOutTime).toMinutes();
            
        }
        return 0;
    }

    private AttendanceResponseDto convertToResponseDto(Attendance attendance) {
        return AttendanceResponseDto.builder()
                .id(attendance.getId())
                .employeeId(attendance.getEmployee() != null ? attendance.getEmployee().getId() : null)
                .date(attendance.getDate())
                .checkin(attendance.getCheckin())
                .checkout(attendance.getCheckout())
                .status(attendance.getStatus())
                .workMinutes(attendance.getWorkMinutes())
                .breakMinutes(attendance.getBreakMinutes())
                .overtimeMinutes(attendance.getOvertimeMinutes())
                .lateMinutes(attendance.getLateMinutes())
                .earlyexitMinutes(attendance.getEarlyMinutes())
                .remarks(attendance.getRemarks())
                .build();
    }

}
