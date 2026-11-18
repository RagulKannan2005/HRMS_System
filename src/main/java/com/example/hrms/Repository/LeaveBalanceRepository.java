package com.example.hrms.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.LeaveBalance;
import com.example.hrms.Enums.LeaveType;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance,Long> {
    List<LeaveBalance> findByEmployee_Id(Long employeeId);
    
    Optional<LeaveBalance> findByEmployeeIdAndLeaveType(Long employeeId, LeaveType leaveReason);
    
    @Query("SELECT lb FROM LeaveBalance lb WHERE lb.employee.id = :employeeId AND lb.leaveType = :leaveType AND lb.year = :year")
    Optional<LeaveBalance> findByEmployeeId_AndLeaveTypeAndYear(@Param("employeeId") Long employeeId, @Param("leaveType") LeaveType leaveType, @Param("year") int year);
    
}
