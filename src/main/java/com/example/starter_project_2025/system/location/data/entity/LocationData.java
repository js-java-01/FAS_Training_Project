package com.example.starter_project_2025.system.location.data.entity;

import java.util.List;
import lombok.Data;

@Data
public class LocationData {
    private List<Province> province;
    private List<Commune> commune;
}
