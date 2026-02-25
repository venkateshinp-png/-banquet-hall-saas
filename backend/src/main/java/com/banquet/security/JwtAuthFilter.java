package com.banquet.security;

import com.banquet.entity.User;
import com.banquet.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String NEW_TOKEN_HEADER = "X-New-Token";

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenCacheService tokenCacheService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractToken(request);

            if (StringUtils.hasText(token)) {
                TokenCacheService.TokenData tokenData = tokenCacheService.validateToken(token);
                
                if (tokenData != null) {
                    Long userId = tokenData.getUserId();
                    String role = tokenData.getRole();
                    Optional<User> optionalUser = userRepository.findById(userId);

                    if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        CustomUserDetails userDetails = new CustomUserDetails(user);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        String newToken = jwtTokenProvider.generateRefreshedToken(userId, role);
                        tokenCacheService.refreshToken(token, newToken, userId, role);
                        response.setHeader(NEW_TOKEN_HEADER, newToken);
                        
                        log.debug("Token refreshed for user {}", userId);
                    }
                } else if (jwtTokenProvider.validateTokenSignature(token)) {
                    Long userId = jwtTokenProvider.getUserId(token);
                    String role = jwtTokenProvider.getRole(token);
                    Optional<User> optionalUser = userRepository.findById(userId);

                    if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        CustomUserDetails userDetails = new CustomUserDetails(user);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        String newToken = jwtTokenProvider.generateRefreshedToken(userId, role);
                        tokenCacheService.storeToken(newToken, userId, role);
                        response.setHeader(NEW_TOKEN_HEADER, newToken);
                        
                        log.debug("Token migrated to cache for user {}", userId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
