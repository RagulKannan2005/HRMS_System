package com.example.hrms.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.hrms.Entity.Attendance;
import com.example.hrms.Enums.LeaveStatus;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    boolean existsByEmployee_IdAndDate(Long employeeId, LocalDate date);

    Optional<Attendance> findByEmployee_IdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findAllByEmployee_IdAndDate(Long employeeId, LocalDate date);

    @Query("""
            SELECT a FROM Attendance a
            WHERE a.employee.id = :employeeId
            AND YEAR(a.date) = :year
            AND MONTH(a.date) = :month
            ORDER BY a.date ASC
            """)
    List<Attendance> findByEmployee_IdAndYearAndMonth(@Param("employeeId") Long employeeId,
            @Param("year") int year,
            @Param("month") int month);
}
