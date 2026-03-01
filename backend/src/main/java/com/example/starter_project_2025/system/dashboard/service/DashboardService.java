package com.example.starter_project_2025.system.dashboard.service;

import com.example.starter_project_2025.system.dashboard.dto.DashboardStatsDTO;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import com.example.starter_project_2025.system.auth.repository.RoleCrudRepository;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final RoleCrudRepository roleRepository;
    private final ModuleRepository ModuleGroupsRepository;
    private final ModuleRepository ModuleRepository;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalRoles(roleRepository.count());
        stats.setTotalMenus(ModuleGroupsRepository.count());
        stats.setTotalMenuItems(ModuleRepository.count());

        stats.setActiveUsers(userRepository.countByIsActive(true));
        stats.setActiveRoles(roleRepository.countByIsActive(true));
        stats.setActiveMenus(ModuleGroupsRepository.findByIsActive(true).stream().count());

        return stats;
    }
}
