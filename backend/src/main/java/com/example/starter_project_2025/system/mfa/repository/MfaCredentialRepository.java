package com.example.starter_project_2025.system.mfa.repository;

import com.example.starter_project_2025.system.mfa.entity.MfaCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MfaCredentialRepository extends JpaRepository<MfaCredential, UUID> {
    
    Optional<MfaCredential> findByUserId(UUID userId);
    
    boolean existsByUserId(UUID userId);
}
