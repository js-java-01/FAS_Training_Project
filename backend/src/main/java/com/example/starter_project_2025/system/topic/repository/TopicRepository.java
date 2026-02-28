package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {

    // Kiểm tra trùng mã code (Dùng cho logic Create & Import)
    boolean existsByCode(String code);

    // Truy vấn tìm kiếm và lọc dữ liệu theo SRS 3.2.17.1
    @Query("SELECT t FROM Topic t WHERE " +
            "(:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:level IS NULL OR t.level = :level) " +
            "AND (:status IS NULL OR t.status = :status)")
    Page<Topic> findAllByFilters(
            @Param("keyword") String keyword,
            @Param("level") String level,
            @Param("status") String status,
            Pageable pageable);
}