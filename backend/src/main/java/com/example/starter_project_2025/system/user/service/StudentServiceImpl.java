package com.example.starter_project_2025.system.user.service;

import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.user.dto.*;
import com.example.starter_project_2025.system.user.entity.*;
import com.example.starter_project_2025.system.user.repository.*;
import com.example.starter_project_2025.system.user.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final TrainingClassRepository trainingClassRepository; 
    private final StudentClassRepository studentClassRepository;   
    private final PasswordEncoder passwordEncoder;
    
  

    @Override
    @Transactional
    public StudentDTO createStudent(CreateStudentRequest request) {
        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new RuntimeException("Student Code Existed!");
        }

        Student student = new Student();
        student.setEmail(request.getEmail());
        student.setPasswordHash(passwordEncoder.encode(request.getPassword())); 
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setIsActive(true);


        student.setStudentCode(request.getStudentCode());
        student.setDob(request.getDob());
        student.setGender(request.getGender());
        student.setPhone(request.getPhone());
        student.setAddress(request.getAddress());
        student.setMajor(request.getMajor());
        student.setSchool(request.getSchool());
        student.setGpa(request.getGpa());
        student.setFaAccount(request.getFaAccount());

        Student savedStudent = studentRepository.save(student);

        return mapToStudentDTO(savedStudent);
    }

    @Override
    public TrainingClass createClass(CreateClassRequest request) {
        TrainingClass trainingClass = new TrainingClass();
        trainingClass.setClassName(request.getClassName());
        trainingClass.setStartDate(request.getStartDate());
        trainingClass.setEndDate(request.getEndDate());
        
        return trainingClassRepository.save(trainingClass);
    }

    @Override
    public void enrollStudent(EnrollStudentRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));


        TrainingClass trainingClass = trainingClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));


        StudentClass enrollment = new StudentClass();
        enrollment.setStudent(student);
        enrollment.setTrainingClass(trainingClass);
        

        enrollment.setAttendingStatus("Studying");
        enrollment.setResult(0.0);
        enrollment.setFinalScore(0.0);
        
        studentClassRepository.save(enrollment);
    }


    private StudentDTO mapToStudentDTO(Student s) {
        StudentDTO dto = new StudentDTO();
        dto.setId(s.getId());
        dto.setStudentCode(s.getStudentCode());
        dto.setEmail(s.getEmail());
        dto.setFirstName(s.getFirstName());
        dto.setLastName(s.getLastName());
        dto.setMajor(s.getMajor());
        dto.setGpa(s.getGpa());
        dto.setRoleName(s.getRole() != null ? s.getRole().getName() : "N/A");
        return dto;
    }
}