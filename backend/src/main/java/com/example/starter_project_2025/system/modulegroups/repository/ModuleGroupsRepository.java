package com.example.starter_project_2025.system.modulegroups.repository;

import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.UUID;

@Repository
public interface ModuleGroupsRepository extends JpaRepository<ModuleGroups, UUID> {



    List<ModuleGroups> findAllByOrderByDisplayOrderAsc();
    List<ModuleGroups> findAllByNameAndIsActiveTrue(String name);

    @Query("""
    SELECT DISTINCT mg
    FROM ModuleGroups mg
    LEFT JOIN FETCH mg.modules
    ORDER BY mg.displayOrder ASC
""")
    List<ModuleGroups> findAllWithModules();

    boolean existsByName(String name);
    boolean existsByNameIgnoreCase(String name);

    List<ModuleGroups> findByIsActiveTrueOrderByDisplayOrderAsc();


    @Query("""
        SELECT mg FROM ModuleGroups mg
        WHERE
            (:keyword IS NULL OR LOWER(mg.name) LIKE :keyword)
        AND (:isActive IS NULL OR mg.isActive = :isActive)
    """)
    Page<ModuleGroups> search(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );

    // ================= LOGIC REORDER =================

    /* CREATE: Chèn vào vị trí X -> Tất cả >= X tăng lên 1*/
    @Modifying
    @Query("UPDATE ModuleGroups m SET m.displayOrder = m.displayOrder + 1 WHERE m.displayOrder >= :order")
    void shiftOrdersForInsert(@Param("order") Integer order);

    /* UPDATE (Move UP): Chuyển từ dưới lên trên (VD: 5 -> 2) Logic: Các phần tử nằm trong khoảng [newOrder, oldOrder) sẽ tăng lên 1 */
    @Modifying
    @Query("UPDATE ModuleGroups m SET m.displayOrder = m.displayOrder + 1 WHERE m.displayOrder >= :newOrder AND m.displayOrder < :oldOrder")
    void shiftOrdersForMoveUp(@Param("newOrder") Integer newOrder, @Param("oldOrder") Integer oldOrder);

    /* UPDATE (Move DOWN): Chuyển từ trên xuống dưới (VD: 1 -> 3) Logic: Các phần tử nằm trong khoảng (oldOrder, newOrder] sẽ giảm đi 1 */
    @Modifying
    @Query("UPDATE ModuleGroups m SET m.displayOrder = m.displayOrder - 1 WHERE m.displayOrder > :oldOrder AND m.displayOrder <= :newOrder")
    void shiftOrdersForMoveDown(@Param("oldOrder") Integer oldOrder, @Param("newOrder") Integer newOrder);

}
