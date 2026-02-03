package com.example.starter_project_2025.system.user.dto;

import com.example.starter_project_2025.system.user.enums.Gender;
import com.example.starter_project_2025.system.user.validator.AgeBetween;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateStudentRequest {

    @NotNull(message = "Id người dùng không được để trống")
    UUID userId;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    @AgeBetween(min = 16, max = 60, message = "Tuổi sinh viên phải từ 16 đến 60")
    LocalDate dob;

    @NotNull(message = "Giới tính không được để trống")
    Gender gender;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(0|\\+84)[0-9]{9}$",
            message = "Số điện thoại không hợp lệ"
    )
    String phone;

    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(min = 5, max = 255, message = "Địa chỉ phải từ 5 đến 255 ký tự")
    String address;

    @NotBlank(message = "Mã sinh viên không được để trống")
    @Size(min = 5, max = 20, message = "Mã sinh viên phải từ 5 đến 20 ký tự")
    @Pattern(
            regexp = "^[A-Z0-9_-]+$",
            message = "Mã sinh viên chỉ gồm chữ in hoa, số, _ hoặc -"
    )
    String studentCode;
}
