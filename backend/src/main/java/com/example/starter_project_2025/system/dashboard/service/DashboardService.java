package com.example.starter_project_2025.system.dashboard.service;

import com.example.starter_project_2025.system.dashboard.dto.DashboardStatsDTO;
import com.example.starter_project_2025.system.menu.repository.MenuItemRepository;
import com.example.starter_project_2025.system.menu.repository.MenuRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalRoles(roleRepository.count());
        stats.setTotalMenus(menuRepository.count());
        stats.setTotalMenuItems(menuItemRepository.count());

        stats.setActiveUsers(userRepository.countByIsActive(true));
        stats.setActiveRoles(roleRepository.countByIsActive(true));
        stats.setActiveMenus(menuRepository.findByIsActive(true).stream().count());

        return stats;
    }
}
