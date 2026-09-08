package com.example.hrms.Dto;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class AttendanceRequestDto {

    @NotEmpty(message = "remarks is required")
    private String remarks;

}
