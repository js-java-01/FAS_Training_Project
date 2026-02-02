package com.example.starter_project_2025.system.user.repository;

import com.example.starter_project_2025.system.user.entity.StudentClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, UUID> {
/*
     * NOTE:
     * 1. File này trống vì đã kế thừa JpaRepository:
     * 2. Spring Boot sẽ tự động tạo implementation lúc runtime.
     * 3. Chỉ khai báo thêm hàm ở đây nếu cần query đặc biệt 
     */
}