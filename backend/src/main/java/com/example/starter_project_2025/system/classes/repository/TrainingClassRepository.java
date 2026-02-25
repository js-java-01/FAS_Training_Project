package com.example.starter_project_2025.system.classes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;

import java.util.UUID;

@Repository
public interface TrainingClassRepository extends JpaRepository<TrainingClass, UUID> {
  /*
   * NOTE:
   * 1. Thừa hưởng toàn bộ hàm CRUD (Thêm, Sửa, Xóa, Xem) từ JpaRepository.
   *
   * 2. Nơi định nghĩa các câu lệnh tìm kiếm lớp học tùy chỉnh
   * (Hiện tại chưa dùng nên để trống)
   */
}