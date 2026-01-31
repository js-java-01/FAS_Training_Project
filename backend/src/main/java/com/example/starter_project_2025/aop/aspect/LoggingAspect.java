package com.example.starter_project_2025.aop.aspect;

import com.example.starter_project_2025.aop.annotation.LogExecutionTime;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    @Around("@annotation(logExecutionTime)")
    public Object logExecutionTime(
            ProceedingJoinPoint joinPoint,
            LogExecutionTime logExecutionTime
    ) throws Throwable {

        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long end = System.currentTimeMillis();

        System.out.println(
                "[AOP] " + joinPoint.getSignature()
                        + " executed in " + (end - start) + " ms"
        );

        return result;
    }
}
