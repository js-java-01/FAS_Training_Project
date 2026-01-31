package com.example.starter_project_2025.system.department.entity;

import com.example.starter_project_2025.system.location.entity.Location;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(length = 500)
    private String description;

    // --- SỬA LỖI 500 & LAZY LOADING TẠI ĐÂY ---

    @ManyToOne(fetch = FetchType.EAGER) // 1. Dùng EAGER để đảm bảo lấy được tên Location ngay lập tức
    @JoinColumn(name = "location_id", nullable = false)
    // 2. Ngắt vòng lặp: Khi biến Department thành JSON, nó sẽ đọc Location.
    // Dòng này bảo nó "Đừng đọc ngược lại danh sách departments bên trong Location nữa"
    @JsonIgnoreProperties({"departments", "hibernateLazyInitializer", "handler"})
    private Location location;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}