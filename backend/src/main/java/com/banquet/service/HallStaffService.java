package com.banquet.service;

import com.banquet.dto.HallStaffRequest;
import com.banquet.dto.UserDTO;
import com.banquet.entity.BanquetHall;
import com.banquet.entity.HallStaff;
import com.banquet.entity.User;
import com.banquet.enums.UserRole;
import com.banquet.repository.BanquetHallRepository;
import com.banquet.repository.HallStaffRepository;
import com.banquet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HallStaffService {

    private final HallStaffRepository hallStaffRepository;
    private final BanquetHallRepository hallRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void addStaff(Long hallId, Long ownerId, HallStaffRequest request) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        if (!hall.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Not authorized to manage staff for this hall");
        }

        if (request.role() != UserRole.MANAGER && request.role() != UserRole.ASSISTANT) {
            throw new RuntimeException("Staff role must be MANAGER or ASSISTANT");
        }

        User staffUser = userRepository.findByPhone(request.phone())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .phone(request.phone())
                            .email(request.phone() + "@placeholder.com")
                            .passwordHash(passwordEncoder.encode("tempPassword123"))
                            .fullName("Staff Member")
                            .role(request.role())
                            .phoneVerified(false)
                            .build();
                    return userRepository.save(newUser);
                });

        if (hallStaffRepository.existsByHallIdAndUserId(hallId, staffUser.getId())) {
            throw new RuntimeException("User is already staff of this hall");
        }

        HallStaff hallStaff = HallStaff.builder()
                .hall(hall)
                .user(staffUser)
                .role(request.role())
                .build();

        hallStaffRepository.save(hallStaff);
    }

    @Transactional
    public void removeStaff(Long hallId, Long ownerId, Long staffId) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        if (!hall.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Not authorized to manage staff for this hall");
        }

        HallStaff hallStaff = hallStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff assignment not found"));

        if (!hallStaff.getHall().getId().equals(hallId)) {
            throw new RuntimeException("Staff assignment does not belong to this hall");
        }

        hallStaffRepository.delete(hallStaff);
    }

    public List<UserDTO> getHallStaff(Long hallId, Long ownerId) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        if (!hall.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Not authorized to view staff for this hall");
        }

        return hallStaffRepository.findByHallId(hallId).stream()
                .map(hs -> {
                    User user = hs.getUser();
                    return new UserDTO(
                            user.getId(),
                            user.getPhone(),
                            user.getEmail(),
                            user.getFullName(),
                            hs.getRole(),
                            user.isPhoneVerified(),
                            user.getProfilePicture()
                    );
                })
                .toList();
    }

    public boolean isStaffOfHall(Long hallId, Long userId) {
        return hallStaffRepository.existsByHallIdAndUserId(hallId, userId);
    }
}
