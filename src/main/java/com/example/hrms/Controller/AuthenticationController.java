package com.example.hrms.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.AdminRegisterRequest;
import com.example.hrms.Dto.AdminResponseDto;
import com.example.hrms.Dto.AuthenticationRequest;
import com.example.hrms.Dto.AuthenticationResponse;
import com.example.hrms.Service.AuthenticationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest request){
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/register-admin")
    public ResponseEntity<AdminResponseDto> registeradmin(@RequestBody @Valid AdminRegisterRequest request){
        AdminResponseDto res=authService.registerAdmin(request);
        return ResponseEntity.ok(res);
    }
}
