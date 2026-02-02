package com.example.starter_project_2025.system.user.entity; 

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student extends User { 
    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "gender")
    private String gender;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "student_code", unique = true)
    private String studentCode;

    @Column(name = "major")
    private String major;

    @Column(name = "school")
    private String school;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "joined_date")
    private LocalDate joinedDate;
    
    @Column(name = "fa_account")
    private String faAccount;
}