package com.banquet.security;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class TokenCacheService {

    private static final long TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

    private final Map<String, TokenData> tokenCache = new ConcurrentHashMap<>();
    private final Map<Long, String> userTokenMap = new ConcurrentHashMap<>();

    @Getter
    public static class TokenData {
        private final Long userId;
        private final String role;
        private final Instant expiresAt;

        public TokenData(Long userId, String role) {
            this.userId = userId;
            this.role = role;
            this.expiresAt = Instant.now().plusMillis(TOKEN_TTL_MS);
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    public void storeToken(String token, Long userId, String role) {
        String existingToken = userTokenMap.get(userId);
        if (existingToken != null) {
            tokenCache.remove(existingToken);
        }
        
        TokenData tokenData = new TokenData(userId, role);
        tokenCache.put(token, tokenData);
        userTokenMap.put(userId, token);
        
        log.debug("Token stored for user {}, expires at {}", userId, tokenData.getExpiresAt());
    }

    public TokenData validateToken(String token) {
        TokenData data = tokenCache.get(token);
        if (data == null) {
            return null;
        }
        if (data.isExpired()) {
            removeToken(token);
            return null;
        }
        return data;
    }

    public void removeToken(String token) {
        TokenData data = tokenCache.remove(token);
        if (data != null) {
            userTokenMap.remove(data.getUserId());
            log.debug("Token removed for user {}", data.getUserId());
        }
    }

    public void removeTokenByUserId(Long userId) {
        String token = userTokenMap.remove(userId);
        if (token != null) {
            tokenCache.remove(token);
            log.debug("Token removed for user {} via userId", userId);
        }
    }

    public String refreshToken(String oldToken, String newToken, Long userId, String role) {
        removeToken(oldToken);
        storeToken(newToken, userId, role);
        return newToken;
    }

    public boolean isTokenValid(String token) {
        return validateToken(token) != null;
    }

    @Scheduled(fixedRate = 30 * 60 * 1000) // Every 30 minutes
    public void cleanupExpiredTokens() {
        int removedCount = 0;
        for (Map.Entry<String, TokenData> entry : tokenCache.entrySet()) {
            if (entry.getValue().isExpired()) {
                removeToken(entry.getKey());
                removedCount++;
            }
        }
        if (removedCount > 0) {
            log.info("Cleaned up {} expired tokens", removedCount);
        }
    }

    public int getActiveTokenCount() {
        return tokenCache.size();
    }
}
