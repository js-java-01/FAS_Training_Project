package com.example.starter_project_2025.system.user.controller;

import com.example.starter_project_2025.system.user.dto.*;
import com.example.starter_project_2025.system.user.entity.TrainingClass;
import com.example.starter_project_2025.system.user.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students") 
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;


    @PostMapping
    public ResponseEntity<StudentDTO> createStudent(@RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(studentService.createStudent(request));
    }

    @PostMapping("/classes")
    public ResponseEntity<TrainingClass> createClass(@RequestBody CreateClassRequest request) {
        return ResponseEntity.ok(studentService.createClass(request));
    }
    
    @PostMapping("/enroll")
    public ResponseEntity<String> enrollStudent(@RequestBody EnrollStudentRequest request) {
        studentService.enrollStudent(request);
        return ResponseEntity.ok("Enrolled successfully!");
    }
}