package com.example.starter_project_2025.system.auth.service.otp;

public interface OtpService {
    public void saveOtp(String email, String otp);

    public String getOtp(String email);

    public void deleteOtp(String email);
}
