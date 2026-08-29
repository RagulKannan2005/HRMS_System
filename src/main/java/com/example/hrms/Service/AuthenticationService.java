package com.example.hrms.Service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.AdminRegisterRequest;
import com.example.hrms.Dto.AdminResponseDto;
import com.example.hrms.Dto.AuthenticationRequest;
import com.example.hrms.Dto.AuthenticationResponse;
import com.example.hrms.Entity.User;
import com.example.hrms.Enums.Role;
import com.example.hrms.Repository.UserRepository;
import com.example.hrms.Security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userrepo;
    private final PasswordEncoder passwordencoder;
    private final JwtService jwtservice;
    private final AuthenticationManager authenticationManager;

    public AdminResponseDto registerAdmin(AdminRegisterRequest request) {
        if (userrepo.existsByRole(Role.ADMIN)) {
            throw new RuntimeException("Admin already exists. Only one admin is allowed.");
        }
        if (userrepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered: " + request.getEmail());
        }
        User admin = User.builder()
                .email(request.getEmail())
                .username(request.getEmail())
                .password(passwordencoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .enabled(true)
                .employeeId(null)
                .build();

        userrepo.save(admin);

        return AdminResponseDto.builder()
                .email(admin.getEmail())
                .username(admin.getUsername())
                .role(admin.getRole())
                .build();

    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = (User) authentication.getPrincipal();
        var jwtToken = jwtservice.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .username(user.getRealUsername())
                .role(user.getRole())
                .build();

    }
}
