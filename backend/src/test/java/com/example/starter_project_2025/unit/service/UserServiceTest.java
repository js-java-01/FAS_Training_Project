package com.example.starter_project_2025.unit.service;

import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock // tạo mock object giả cho userRepository
    private UserRepository userRepository;

    @InjectMocks // Inject mock vào service
    private UserService userService;

    // tạo mock nhưng chua có data --> tạo mock user
    private User mockUser;

    // tạo hàm để setup data giả
    @BeforeEach // dữ liệu này phải chạy đầu tiên
    void setUp(){
        mockUser = createMockUser();
    }

    @Test  // đánh dấu hàm này là 1 test case
    void testGetAllUsers_ShouldReturnListUser(){
        // thiết lập dữ liệu và hành vi
        // when(...).thenReturn(...) mô phỏng hành vi của mock object
        when(userRepository.findAll()).thenReturn(List.of(mockUser));  // khi service gọi findAll, đừng dùng db thật và trả về danh sách này(mockUer)

    }

    private User createMockUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .email("test@gmail.com")
                .passwordHash("hashed_password")
                .firstName("Hoang")
                .lastName("Huan")
                .userRoles(new HashSet<>())
                .courseClasses(new HashSet<>())
                .trainerProgrammingLanguages(new HashSet<>())
                .submissions(new HashSet<>())
                .isActive(true)
                .build();
    }

}
