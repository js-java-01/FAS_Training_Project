package com.example.starter_project_2025.system.auth.service.email;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendEmail(String to, String subject, String body);

}
