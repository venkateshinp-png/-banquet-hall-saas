package com.banquet.config;

import com.banquet.entity.User;
import com.banquet.enums.UserRole;
import com.banquet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByPhone("0000000000")) {
            User admin = User.builder()
                    .phone("0000000000")
                    .email("admin@banquet.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .fullName("System Admin")
                    .role(UserRole.ADMIN)
                    .phoneVerified(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user seeded: phone=0000000000, password=admin123");
        }
    }
}
