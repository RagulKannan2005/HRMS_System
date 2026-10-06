package com.example.hrms.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.AttendanceRequestDto;
import com.example.hrms.Dto.AttendanceResponseDto;
import com.example.hrms.Service.AttendanceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/employee/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PostMapping("/check-in")
    public ResponseEntity<AttendanceResponseDto> checkIn() {
        return ResponseEntity.ok(attendanceService.checkIn());
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PutMapping("/check-out")
    public ResponseEntity<AttendanceResponseDto> checkOut() {
        return ResponseEntity.ok(attendanceService.checkOut());
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @GetMapping("/date")
    public ResponseEntity<List<AttendanceResponseDto>> getEmployeeAttendance(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendance(date));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @GetMapping("/month")
    public ResponseEntity<List<AttendanceResponseDto>> getEmployeeAttendanceByMonth(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getEmployeeAttendanceByMonth(date));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/get-by-status-and-date/{date}/{status}")
    public ResponseEntity<List<AttendanceResponseDto>> getAttendanceByDateAndStatus(
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable("status") String status) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDateAndStatus(date, status));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/all")
    public ResponseEntity<List<AttendanceResponseDto>> getAllData(){
        return ResponseEntity.ok(attendanceService.getAlldata());
    }

}
