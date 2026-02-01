package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.user.dto.*;
import com.example.starter_project_2025.system.user.entity.TrainingClass;

public interface StudentService {

    StudentDTO createStudent(CreateStudentRequest request);
    
    
    TrainingClass createClass(CreateClassRequest request);
    

    void enrollStudent(EnrollStudentRequest request);
}