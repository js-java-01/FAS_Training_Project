package com.example.starter_project_2025.system.location.data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provinces")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Province {
    @Id
    @Column(length = 2)
    private String id;

    @Column(nullable = false)
    private String name;
}
