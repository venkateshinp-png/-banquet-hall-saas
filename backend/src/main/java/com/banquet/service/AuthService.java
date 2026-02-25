package com.banquet.service;

import com.banquet.dto.*;
import com.banquet.entity.User;
import com.banquet.enums.UserRole;
import com.banquet.repository.UserRepository;
import com.banquet.security.JwtTokenProvider;
import com.banquet.security.TokenCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenCacheService tokenCacheService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByPhone(request.phone())) {
            throw new RuntimeException("Phone number already registered");
        }
        if (request.email() != null && userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }
        if (request.role() != UserRole.CUSTOMER && request.role() != UserRole.OWNER) {
            throw new RuntimeException("Can only register as CUSTOMER or OWNER");
        }

        User user = User.builder()
                .phone(request.phone())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role())
                .phoneVerified(false)
                .build();
        user = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        tokenCacheService.storeToken(accessToken, user.getId(), user.getRole().name());
        
        log.info("User registered: {} with role {}", user.getPhone(), user.getRole());
        return new AuthResponse(accessToken, null, toUserDTO(user));
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByPhone(request.phone())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (request.otp() != null) {
            if (!"123456".equals(request.otp())) {
                throw new RuntimeException("Invalid OTP");
            }
        } else {
            if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        tokenCacheService.storeToken(accessToken, user.getId(), user.getRole().name());
        
        log.info("User logged in: {} with role {}", user.getPhone(), user.getRole());
        return new AuthResponse(accessToken, null, toUserDTO(user));
    }

    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null) {
            tokenCacheService.removeToken(token);
            log.info("User logged out, token invalidated");
        }
    }

    public void logoutByUserId(Long userId) {
        tokenCacheService.removeTokenByUserId(userId);
        log.info("User {} logged out via userId", userId);
    }

    public UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toUserDTO(user);
    }

    private UserDTO toUserDTO(User user) {
        return new UserDTO(user.getId(), user.getPhone(), user.getEmail(),
                user.getFullName(), user.getRole(), user.isPhoneVerified(), user.getProfilePicture());
    }
}
