package com.example.starter_project_2025.system.user.repository;

import com.example.starter_project_2025.system.user.entity.TrainingClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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