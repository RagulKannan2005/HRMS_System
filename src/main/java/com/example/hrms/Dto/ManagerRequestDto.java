package com.example.hrms.Dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerRequestDto {

    @NotBlank(message = "Employee code cannot be empty")
    private String employeeCode;

    @NotBlank(message = "Employee name cannot be empty")
    private String employeeName;

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email cannot be empty")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Phone cannot be empty")
    private String phone;

    @NotBlank(message = "Gender cannot be empty")
    private String gender;

    @NotNull(message = "Date of birth cannot be empty")
    private LocalDate dateOfBirth;

    @NotNull(message = "Joining date cannot be empty")
    private LocalDate joiningDate;

    @NotBlank(message = "Bank account number cannot be empty")
    private String bankAccountNumber;

    private String ifsc;

    @NotNull(message = "Department ID cannot be empty")
    private Long departmentId;

    @NotNull(message = "Designation ID cannot be empty")
    private Long designationId;

    private Long managerId;
}