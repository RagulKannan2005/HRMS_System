package com.example.hrms.ServiceImp;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.hrms.Dto.UserRequesrDto;
import com.example.hrms.Dto.UserResponseDto;
import com.example.hrms.Entity.User;
import com.example.hrms.Enums.Role;
import com.example.hrms.Repository.UserRepository;
import com.example.hrms.Service.UserService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UserServiveImp implements UserService{
    

    private final UserRepository userrepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDto createuser(UserRequesrDto req) {
        if (req.getRole() == Role.ADMIN && userrepo.existsByRole(Role.ADMIN)) {
            throw new RuntimeException("Admin already exists. Only one admin is allowed.");
        }
        if (userrepo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already exists: " + req.getEmail());
        }
        User user = User.builder()
                .email(req.getEmail())
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .enabled(req.getEnabled())
                .employeeId(req.getEmployeeId())
                .build();

        User saved = userrepo.save(user);
        return toDto(saved);
    }

    @Override
    public List<UserResponseDto> getUsers(){
        List<User> users=userrepo.findAll();
        return users.stream().map(this::toDto).collect(Collectors.toList());
    }

    UserResponseDto toDto(User u){
        return UserResponseDto.builder()
        .id(u.getId())
        .email(u.getEmail())
        .role(u.getRole())
        .enabled(u.getEnabled())
        .employeeId(u.getEmployeeId())
        .build();
    }
}
