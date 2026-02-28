package com.example.starter_project_2025.system.classes.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.method.P;
import org.springframework.stereotype.Repository;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;

import java.util.List;
import java.util.UUID;

@Repository
public interface TrainingClassRepository
                extends JpaRepository<TrainingClass, UUID>,
                JpaSpecificationExecutor<TrainingClass> {

        boolean existsByClassNameIgnoreCase(String className);

        boolean existsByClassCodeIgnoreCase(String classCode);

        @Query("""
                            SELECT tc FROM TrainingClass tc
                            LEFT JOIN tc.creator
                            LEFT JOIN tc.approver
                            LEFT JOIN tc.semester
                            WHERE (:keyword IS NULL OR LOWER(tc.className) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                   OR LOWER(tc.classCode) LIKE LOWER(CONCAT('%', :keyword, '%')))
                            AND (:isActive IS NULL OR tc.isActive = :isActive)
                        """)
        Page<TrainingClass> search(
                        @Param("keyword") String keyword,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

        @Query("SELECT c FROM TrainingClass c " +
                        "JOIN FETCH c.semester s " +
                        "JOIN c.enrollments e " +
                        "WHERE e.user.id = :studentId " +
                        "ORDER BY s.startDate DESC")
        List<TrainingClass> findByStudentId(@Param("studentId") UUID studentId);
}