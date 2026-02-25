package com.banquet.config;

import com.banquet.entity.BanquetHall;
import com.banquet.entity.User;
import com.banquet.entity.Venue;
import com.banquet.enums.HallStatus;
import com.banquet.enums.UserRole;
import com.banquet.repository.BanquetHallRepository;
import com.banquet.repository.UserRepository;
import com.banquet.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BanquetHallRepository banquetHallRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = seedAdminUser();
        User owner = seedOwnerUser();
        seedSampleHalls(owner);
    }

    private User seedAdminUser() {
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
            return admin;
        }
        return userRepository.findByPhone("0000000000").orElse(null);
    }

    private User seedOwnerUser() {
        if (!userRepository.existsByPhone("9876543210")) {
            User owner = User.builder()
                    .phone("9876543210")
                    .email("owner@veduka.com")
                    .passwordHash(passwordEncoder.encode("owner123"))
                    .fullName("Demo Hall Owner")
                    .role(UserRole.OWNER)
                    .phoneVerified(true)
                    .build();
            userRepository.save(owner);
            System.out.println("Owner user seeded: phone=9876543210, password=owner123");
            return owner;
        }
        return userRepository.findByPhone("9876543210").orElse(null);
    }

    private void seedSampleHalls(User owner) {
        if (owner == null || banquetHallRepository.count() > 0) {
            return;
        }

        BanquetHall hall1 = BanquetHall.builder()
                .owner(owner)
                .name("Royal Grand Palace")
                .description("A magnificent venue for weddings and grand celebrations. Features elegant interiors, spacious halls, and world-class amenities.")
                .address("123 MG Road, Banjara Hills")
                .city("Hyderabad")
                .state("Telangana")
                .zipcode("500034")
                .latitude(17.4156)
                .longitude(78.4347)
                .phone("9876543210")
                .email("royal@veduka.com")
                .status(HallStatus.APPROVED)
                .termsConditions("50% advance payment required. Cancellation allowed up to 7 days before event.")
                .build();
        banquetHallRepository.save(hall1);

        venueRepository.save(Venue.builder()
                .hall(hall1)
                .name("Grand Ballroom")
                .description("Our largest venue with crystal chandeliers and marble flooring")
                .capacity(500)
                .minBookingDurationHours(4)
                .basePricePerHour(new BigDecimal("25000"))
                .active(true)
                .build());

        venueRepository.save(Venue.builder()
                .hall(hall1)
                .name("Garden Terrace")
                .description("Beautiful outdoor venue with landscaped gardens")
                .capacity(300)
                .minBookingDurationHours(3)
                .basePricePerHour(new BigDecimal("15000"))
                .active(true)
                .build());

        BanquetHall hall2 = BanquetHall.builder()
                .owner(owner)
                .name("The Celebration Hub")
                .description("Modern event space perfect for corporate events, parties, and social gatherings.")
                .address("456 Jubilee Hills Road")
                .city("Hyderabad")
                .state("Telangana")
                .zipcode("500033")
                .latitude(17.4312)
                .longitude(78.4071)
                .phone("9876543211")
                .email("celebration@veduka.com")
                .status(HallStatus.APPROVED)
                .termsConditions("Full payment required 3 days before event.")
                .build();
        banquetHallRepository.save(hall2);

        venueRepository.save(Venue.builder()
                .hall(hall2)
                .name("Conference Hall")
                .description("State-of-the-art conference room with AV equipment")
                .capacity(100)
                .minBookingDurationHours(2)
                .basePricePerHour(new BigDecimal("5000"))
                .active(true)
                .build());

        venueRepository.save(Venue.builder()
                .hall(hall2)
                .name("Party Lounge")
                .description("Vibrant space with modern decor and lighting")
                .capacity(150)
                .minBookingDurationHours(3)
                .basePricePerHour(new BigDecimal("8000"))
                .active(true)
                .build());

        BanquetHall hall3 = BanquetHall.builder()
                .owner(owner)
                .name("Lakeside Banquets")
                .description("Scenic lakeside venue offering breathtaking views and serene atmosphere for memorable events.")
                .address("789 Tank Bund Road")
                .city("Hyderabad")
                .state("Telangana")
                .zipcode("500080")
                .latitude(17.4239)
                .longitude(78.4738)
                .phone("9876543212")
                .email("lakeside@veduka.com")
                .status(HallStatus.APPROVED)
                .termsConditions("Outdoor events subject to weather conditions.")
                .build();
        banquetHallRepository.save(hall3);

        venueRepository.save(Venue.builder()
                .hall(hall3)
                .name("Lakeside Pavilion")
                .description("Open-air pavilion with stunning lake views")
                .capacity(250)
                .minBookingDurationHours(4)
                .basePricePerHour(new BigDecimal("20000"))
                .active(true)
                .build());

        System.out.println("Sample banquet halls and venues seeded successfully!");
    }
}
