package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.starter_project_2025.system.course_online.entity.SessionOnline;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionOnlineRepository extends JpaRepository<SessionOnline, UUID> {
    // Lấy danh sách session theo bài học và sắp xếp theo thứ tự
    List<SessionOnline> findByLessonIdOrderBySessionOrderAsc(UUID lessonId);

    // Kiểm tra trùng thứ tự trong cùng một bài học
    boolean existsByLessonIdAndSessionOrder(UUID lessonId, Integer sessionOrder);

    // Tính tổng duration của tất cả session trong một lesson
    @Query("SELECT COALESCE(SUM(s.duration), 0) FROM SessionOnline s WHERE s.lesson.id = :lessonId")
    Integer sumDurationByLessonId(@Param("lessonId") UUID lessonId);
}