package com.example.starter_project_2025.system.location.entity;

import com.example.starter_project_2025.system.common.enums.LocationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "locations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(name = "commune_id", nullable = false)
    private String communeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LocationStatus locationStatus;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (locationStatus == null) locationStatus = LocationStatus.ACTIVE;
    }
}
