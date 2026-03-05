package com.example.starter_project_2025.system.course_online.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;

import java.util.UUID;

@Repository
public interface CourseOnlineRepository extends JpaRepository<CourseOnline, UUID> {
        boolean existsByCourseCode(String courseCode);
        
        java.util.Optional<CourseOnline> findByCourseCode(String courseCode);

        @Query("SELECT c FROM CourseOnline c " +
                        "WHERE (:keyword IS NULL OR LOWER(c.courseName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
                        +
                        "AND (:status IS NULL OR c.status = :status) " +
                        "AND (:trainerId IS NULL OR c.creator.id = :trainerId)")
        org.springframework.data.domain.Page<CourseOnline> findAllByFilters(
                        @org.springframework.data.repository.query.Param("keyword") String keyword,
                        @org.springframework.data.repository.query.Param("status") com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline status,
                        @org.springframework.data.repository.query.Param("trainerId") java.util.UUID trainerId,
                        org.springframework.data.domain.Pageable pageable);

        Optional<CourseOnline> findByIdAndStatus(UUID id, CourseStatusOnline status);
}
