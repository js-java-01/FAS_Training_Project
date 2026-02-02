package com.example.starter_project_2025.system.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalUsers;
    private Long totalRoles;
    private Long totalMenus;
    private Long totalMenuItems;
    private Long activeUsers;
    private Long activeRoles;
    private Long activeMenus;
}
