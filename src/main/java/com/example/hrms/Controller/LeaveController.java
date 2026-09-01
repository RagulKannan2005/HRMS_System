package com.example.hrms.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.LeaveRequestDto;
import com.example.hrms.Dto.LeaveResponseDto;
import com.example.hrms.Service.LeaveService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/employee/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    @PreAuthorize("hasRole('EMPLOYEE')")
    @PostMapping("/applyleave")
    public ResponseEntity<LeaveResponseDto> applyforleave(@RequestBody @Valid LeaveRequestDto request){
        return ResponseEntity.ok(leaveService.applyLeave(request));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/getleavesbystatus/{status}")
    public ResponseEntity<List<LeaveResponseDto>> getleavesByStatus(@PathVariable String status){
        return ResponseEntity.ok(leaveService.getLeavesByStatus(status));
    } 

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/getByEmployeeId/{id}")
    public ResponseEntity<List<LeaveResponseDto>> getLeavesByEmployeeId(@PathVariable Long id){
        return ResponseEntity.ok(leaveService.getLeavesByEmployeeId(id));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/getByStatusandEmployeeId/{id}/{status}")
    public ResponseEntity<List<LeaveResponseDto>> getLeavesByStatusandEmployeeId(@PathVariable Long id,@PathVariable String status){
        return ResponseEntity.ok(leaveService.getLeavesBystatusandEmplyeeId(id, status));
    }
    
}
