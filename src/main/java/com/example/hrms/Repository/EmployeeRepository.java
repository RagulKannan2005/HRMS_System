package com.example.hrms.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import com.example.hrms.Entity.Employee;
import com.example.hrms.Enums.Role;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Optional<Employee> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmployeeCode(String empcode);

    Optional<Employee> findById(Long id);

    List<Employee> findByManager_EmployeeName(String employeeName);

    @Query("SELECT e FROM Employee e WHERE e.id IN (SELECT u.employeeId FROM User u WHERE u.role = :role)")
    List<Employee> findByRole(Role role);

}
