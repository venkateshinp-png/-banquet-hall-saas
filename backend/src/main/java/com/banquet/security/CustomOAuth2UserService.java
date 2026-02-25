package com.banquet.security;

import com.banquet.entity.User;
import com.banquet.enums.UserRole;
import com.banquet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String googleId = (String) attributes.get("sub");
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        Optional<User> existingUser = userRepository.findByGoogleId(googleId);
        
        if (existingUser.isEmpty() && email != null) {
            existingUser = userRepository.findByEmail(email);
        }

        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
            }
            if (picture != null) {
                user.setProfilePicture(picture);
            }
            user = userRepository.save(user);
        } else {
            user = User.builder()
                    .googleId(googleId)
                    .email(email)
                    .fullName(name != null ? name : "User")
                    .profilePicture(picture)
                    .role(UserRole.CUSTOMER)
                    .phoneVerified(false)
                    .build();
            user = userRepository.save(user);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }
}
