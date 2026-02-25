package com.banquet.service;

import com.banquet.config.EncryptionConfig;
import com.banquet.dto.*;
import com.banquet.entity.BanquetHall;
import com.banquet.entity.HallDocument;
import com.banquet.entity.User;
import com.banquet.enums.HallStatus;
import com.banquet.repository.BanquetHallRepository;
import com.banquet.repository.HallDocumentRepository;
import com.banquet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HallService {

    private final BanquetHallRepository hallRepository;
    private final HallDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final EncryptionConfig encryptionConfig;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public HallResponse createHall(Long ownerId, HallRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BanquetHall hall = BanquetHall.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipcode(request.getZipcode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .email(request.getEmail())
                .termsConditions(request.getTermsConditions())
                .bankAccountName(request.getBankAccountName())
                .status(HallStatus.PENDING)
                .build();

        if (request.getBankAccountNumber() != null) {
            hall.setBankAccountNumber(encryptionConfig.encrypt(request.getBankAccountNumber()));
        }
        if (request.getBankRoutingNumber() != null) {
            hall.setBankRoutingNumber(encryptionConfig.encrypt(request.getBankRoutingNumber()));
        }

        hall = hallRepository.save(hall);
        return toHallResponse(hall);
    }

    @Transactional
    public HallResponse updateHall(Long ownerId, Long hallId, HallRequest request) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        if (!hall.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Not authorized to update this hall");
        }
        if (hall.getStatus() != HallStatus.PENDING && hall.getStatus() != HallStatus.ON_HOLD) {
            throw new RuntimeException("Hall can only be updated when in PENDING or ON_HOLD status");
        }

        hall.setName(request.getName());
        hall.setDescription(request.getDescription());
        hall.setAddress(request.getAddress());
        hall.setCity(request.getCity());
        hall.setState(request.getState());
        hall.setZipcode(request.getZipcode());
        hall.setLatitude(request.getLatitude());
        hall.setLongitude(request.getLongitude());
        hall.setPhone(request.getPhone());
        hall.setEmail(request.getEmail());
        hall.setTermsConditions(request.getTermsConditions());
        hall.setBankAccountName(request.getBankAccountName());

        if (request.getBankAccountNumber() != null) {
            hall.setBankAccountNumber(encryptionConfig.encrypt(request.getBankAccountNumber()));
        }
        if (request.getBankRoutingNumber() != null) {
            hall.setBankRoutingNumber(encryptionConfig.encrypt(request.getBankRoutingNumber()));
        }

        hall = hallRepository.save(hall);
        return toHallResponse(hall);
    }

    public HallResponse getHall(Long hallId) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));
        return toHallResponse(hall);
    }

    public List<HallResponse> getOwnerHalls(Long ownerId) {
        return hallRepository.findByOwnerId(ownerId).stream()
                .map(this::toHallResponse)
                .collect(Collectors.toList());
    }

    public List<HallResponse> getPendingHalls() {
        return hallRepository.findByStatus(HallStatus.PENDING).stream()
                .map(this::toHallResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HallResponse updateHallStatus(Long hallId, HallStatusUpdateRequest request) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        hall.setStatus(request.status());
        if (request.notes() != null) {
            hall.setAdminNotes(request.notes());
        }

        hall = hallRepository.save(hall);
        return toHallResponse(hall);
    }

    @Transactional
    public void uploadDocuments(Long ownerId, Long hallId, List<MultipartFile> files,
                                List<String> documentTypes) {
        BanquetHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new RuntimeException("Hall not found"));

        if (!hall.getOwner().getId().equals(ownerId)) {
            throw new RuntimeException("Not authorized to upload documents for this hall");
        }

        Path uploadPath = Paths.get(uploadDir);
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (int i = 0; i < files.size(); i++) {
                MultipartFile file = files.get(i);
                String documentType = (documentTypes != null && i < documentTypes.size())
                        ? documentTypes.get(i)
                        : "OTHER";

                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueFilename = UUID.randomUUID() + extension;

                Path filePath = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath);

                HallDocument document = HallDocument.builder()
                        .hall(hall)
                        .documentType(documentType)
                        .filePath(filePath.toString())
                        .build();
                documentRepository.save(document);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload documents", e);
        }
    }

    public HallResponse toHallResponse(BanquetHall hall) {
        User owner = hall.getOwner();
        UserDTO ownerDTO = new UserDTO(
                owner.getId(),
                owner.getPhone(),
                owner.getEmail(),
                owner.getFullName(),
                owner.getRole(),
                owner.isPhoneVerified(),
                owner.getProfilePicture()
        );

        List<HallDocument> docs = documentRepository.findByHallId(hall.getId());
        List<HallDocumentDTO> documentDTOs = docs.stream()
                .map(doc -> new HallDocumentDTO(
                        doc.getId(),
                        doc.getDocumentType(),
                        doc.getFilePath(),
                        doc.getUploadedAt()
                ))
                .collect(Collectors.toList());

        return new HallResponse(
                hall.getId(),
                hall.getName(),
                hall.getDescription(),
                hall.getAddress(),
                hall.getCity(),
                hall.getState(),
                hall.getZipcode(),
                hall.getLatitude(),
                hall.getLongitude(),
                hall.getPhone(),
                hall.getEmail(),
                hall.getStatus(),
                hall.getTermsConditions(),
                hall.getAdminNotes(),
                hall.getCreatedAt(),
                ownerDTO,
                documentDTOs,
                null
        );
    }
}
