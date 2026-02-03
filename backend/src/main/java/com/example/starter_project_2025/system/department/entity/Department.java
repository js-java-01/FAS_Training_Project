package com.example.starter_project_2025.system.department.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.example.starter_project_2025.system.location.entity.Location;

@Entity
@Table(name = "departments")
@Data
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String code;
    private String description;

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;
}