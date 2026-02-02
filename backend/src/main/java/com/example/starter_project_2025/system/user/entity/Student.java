package com.example.starter_project_2025.system.user.entity;

import com.example.starter_project_2025.system.user.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Builder
@Table(name = "students")
@DiscriminatorValue("STUDENT")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Student extends User {

    @Column(nullable = false, unique = true, length = 20)
    String studentCode;

    @Column(nullable = false)
    LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    Gender gender;

    @Column(nullable = false, unique = true, length = 15)
    String phone;

    @Column(nullable = false, length = 255)
    String address;

    @Column(precision = 3, scale = 2)
    BigDecimal gpa;
}