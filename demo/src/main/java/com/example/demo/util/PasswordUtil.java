package com.example.demo.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtil {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }

    public static void main(String[] args) {
        String[] passwords = {"123456", "1111", "123", "1"}; // 你的明文密码列表

        System.out.println("===== 加密结果 =====");
        for (String pwd : passwords) {
            System.out.printf("明文: %-8s → 密文: %s%n", pwd, encode(pwd));
        }
    }
}