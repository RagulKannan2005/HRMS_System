package com.example.hrms.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.LeaveRequest;
import com.example.hrms.Enums.LeaveStatus;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee_Id(Long employeeId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByEmployee_IdAndStatus(Long employeeId, LeaveStatus status);

    @Query("""
                SELECT COUNT(l) > 0
                FROM LeaveRequest l
                WHERE l.employee.id = :employeeId
                AND l.status IN :statuses
                AND l.fromDate <= :toDate
                AND l.toDate >= :fromDate
            """)
    boolean existsOverlappingLeave(@Param("employeeId") Long employeeId, @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate, @Param("statuses") List<LeaveStatus> statuses);

    @Query("""
                SELECT COUNT(l) > 0
                FROM LeaveRequest l
                WHERE l.employee.id = :employeeId
                AND l.status = :status
                AND l.fromDate <= :date
                AND l.toDate >= :date
            """)
    boolean existsApprovedLeaveForDate(@Param("employeeId") Long employeeId, @Param("date") LocalDate date,
            @Param("status") LeaveStatus status);
}
