package com.example.hrms.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hrms.Dto.UserRequesrDto;
import com.example.hrms.Dto.UserResponseDto;
import com.example.hrms.Service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userservice;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/addUser")
    public ResponseEntity<UserResponseDto> createusers(@RequestBody @Valid UserRequesrDto dto){
        UserResponseDto user=userservice.createuser(dto);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getAllUsers")
    public ResponseEntity<List<UserResponseDto>> getallusers(){
    List<UserResponseDto> list=userservice.getUsers();
    return ResponseEntity.ok(list);
    }
}
