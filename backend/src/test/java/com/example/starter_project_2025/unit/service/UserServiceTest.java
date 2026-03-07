//package com.example.starter_project_2025.unit.service;
//
//import com.example.starter_project_2025.system.auth.entity.Role;
//import com.example.starter_project_2025.system.auth.repository.RoleRepository;
//import com.example.starter_project_2025.system.user.dto.CreateUserRequest;
//import com.example.starter_project_2025.system.user.dto.UserDTO;
//import com.example.starter_project_2025.system.user.entity.User;
//import com.example.starter_project_2025.system.user.mapper.UserMapper;
//import com.example.starter_project_2025.system.user.repository.UserRepository;
//import com.example.starter_project_2025.system.user.service.UserService;
//import com.example.starter_project_2025.system.user.service.impl.UserServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.util.HashSet;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class UserServiceTest {
//
//    @Mock // tạo mock object giả cho userRepository
//    private UserRepository userRepository;
//    @Mock
//    private RoleRepository roleRepository;
//    @Mock
//    private UserMapper userMapper;
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @InjectMocks // Inject mock vào service
//    private UserServiceImpl userService;
//
//    // tạo mock nhưng chua có data --> tạo mock user
//    private User mockUser;
//
//    // tạo hàm để setup data giả
//    @BeforeEach // dữ liệu này phải chạy đầu tiên
//    void setUp(){
//        mockUser = createMockUser();
//    }
//
//    @Test  // đánh dấu hàm này là 1 test case
//    void testGetAllUsers_ShouldReturnListUser(){
//        // GIVEN phase thiết lập dữ liệu và hành vi
//        // when(...).thenReturn(...) mô phỏng hành vi của mock object
//        when(userRepository.findAll()).thenReturn(List.of(mockUser));  // khi service gọi findAll, đừng dùng db thật và trả về danh sách này(mockUer)
//
//        // gọi hàm thật
//        List<User> result = userService.findAll();
//
//        // THEN phase xác nhận đầu ra
//        // assertEquals(expected, actual) kiểm tra kết quả thực tế có đúng với mong đợi hay không
//        // expected (tự điền): mong muốn khi chạy test
//        // actual: kết quả gọi hàm thực tế trả về
//        assertEquals(1, result.size());
//        assertEquals("Hoang", result.get(0).getFirstName());
//
//        // AND phase xác nhận hành vi
//        // verify(mock, times(n)) kiểm tra mock có được gọi đúng cách hay không
//        verify(userRepository, times(1)).findAll();  // đảm bảo rằng findAll được gọi đúng 1 lần
//
//
//    }
//
//    @Test
//    void createUser_ShouldCreateSuccessfully() {
//        // GIVEN
//        UUID roleId = UUID.randomUUID();
//
//        CreateUserRequest request = new CreateUserRequest();
//        request.setEmail("new@gmail.com");
//        request.setPassword("123456");
//        request.setRoleId(roleId);
//
//        Role role = new Role();
//        User userEntity = new User();
//        UserDTO responseDTO = new UserDTO();
//
//        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
//        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
//        when(userMapper.toEntity(request)).thenReturn(userEntity);
//        when(passwordEncoder.encode("123456")).thenReturn("hashed_password");
//        when(userRepository.save(userEntity)).thenReturn(userEntity);
//        when(userMapper.toResponse(userEntity)).thenReturn(responseDTO);
//
//        // WHEN
//        UserDTO result = userService.createUser(request);
//
//        // THEN
//        assertEquals(responseDTO, result);
//        verify(userRepository).existsByEmail(request.getEmail());
//        verify(passwordEncoder).encode("123456");
//        verify(userRepository).save(userEntity);
//    }
//
//    private User createMockUser() {
//        return User.builder()
//                .id(UUID.randomUUID())
//                .email("test@gmail.com")
//                .passwordHash("hashed_password")
//                .firstName("Hoang")
//                .lastName("Huan")
//                .userRoles(new HashSet<>())
//                .courseClasses(new HashSet<>())
//                .trainerProgrammingLanguages(new HashSet<>())
//                .submissions(new HashSet<>())
//                .isActive(true)
//                .build();
//    }
//
//}
