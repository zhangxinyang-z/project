package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 获取当前登录用户信息
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("name", user.getUsername());
        response.put("role", user.getRole());
        response.put("accessLevel", user.getAccessLevel());
        response.put("registerTime", user.getCreatedAt());
        response.put("lastLogin", user.getLastLogin());

        return ResponseEntity.ok(response);
    }

    // 更新最后登录时间
    @PostMapping("/update-login-time")
    public ResponseEntity<String> updateLoginTime(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByUsername(userDetails.getUsername());
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return ResponseEntity.ok("最后登录时间已更新");
    }
}