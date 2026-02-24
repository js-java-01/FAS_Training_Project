package com.example.starter_project_2025.system.course.repository;

import com.example.starter_project_2025.system.course.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    // Lấy danh sách session theo bài học và sắp xếp theo thứ tự
    List<Session> findByLessonIdOrderBySessionOrderAsc(UUID lessonId);
    
    // Kiểm tra trùng thứ tự trong cùng một bài học
    boolean existsByLessonIdAndSessionOrder(UUID lessonId, Integer sessionOrder);
}