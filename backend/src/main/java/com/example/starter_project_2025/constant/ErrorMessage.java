package com.example.starter_project_2025.constant;

public class ErrorMessage
{
    // USER
    public static final String USER_NOT_FOUND = "User not found. Please try again!";

    // AUTH
    public static final String ACCOUNT_HAS_BEEN_LOCKED = "Your account has been locked.";
    public static final String REFRESH_TOKEN_HAS_EXPIRED = "Refresh Token has expired or is invalid!";
    public static final String REFRESH_TOKEN_MISSING = "Refresh Token is missing";
    public static final String USER_DOES_NOT_HAVE_THE_SPECIFIED_ROLE = "Unauthorized: User does not have the specified role";

    // ROLE
    public static final String ROLE_NOT_FOUND = "Default Role not found";

    // RT TOKEN
    public static final String TOKEN_DOES_NOT_EXIST = "Token does not exist in the database";
    public static final String TOKEN_HAS_BEEN_REVOKED = "Token has been revoked";
    public static final String TOKEN_HAS_BEEN_USED = "Token has been used. Please login again to get a new token.";

    // TRAINING CLASS
    public static final String TRAINING_CLASS_NOT_FOUND = "Training Class not found";

    // SEMESTER
    public static final String SEMESTER_NOT_FOUND = "Semester not found";
    public static final String SEMESTER_NAME_EXISTED = "Semester name already exists. Please choose a different name.";
}
