package com.talktalkcare.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

//    private final AutoLoginInterceptor autoLoginInterceptor;
//
//    public WebConfig(AutoLoginInterceptor autoLoginInterceptor) {
//        this.autoLoginInterceptor = autoLoginInterceptor;
//    }
//
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(autoLoginInterceptor)
//                .addPathPatterns("/**");
//    }
}

