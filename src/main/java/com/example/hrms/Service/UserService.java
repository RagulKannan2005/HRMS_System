package com.example.hrms.Service;

import java.util.List;

import com.example.hrms.Dto.UserRequesrDto;
import com.example.hrms.Dto.UserResponseDto;

public interface UserService {

    UserResponseDto createuser(UserRequesrDto user);
    List<UserResponseDto> getUsers();
    
}
