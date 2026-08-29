package com.example.hrms.Dto;

import com.example.hrms.Enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminResponseDto {
    private String email;
    private String username;
    private Role role;
}
