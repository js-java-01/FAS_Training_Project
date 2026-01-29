package com.example.starter_project_2025.system.locationData.entity;

import jakarta.persistence.*;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "communes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Commune {
    @Id
    @Column(length = 5)
    private String id; // idCommune

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;

    public static String getCommuneAndProvince(Commune commune){
        return commune.getName()+" ,"+commune.getProvince().getName();
    }
}
