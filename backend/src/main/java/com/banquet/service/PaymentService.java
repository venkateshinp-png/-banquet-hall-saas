package com.banquet.service;

import com.banquet.dto.PaymentRequest;
import com.banquet.dto.PaymentResponse;
import com.banquet.dto.RefundRequest;
import com.banquet.entity.Booking;
import com.banquet.entity.Payment;
import com.banquet.enums.BookingStatus;
import com.banquet.enums.PaymentStatus;
import com.banquet.enums.PaymentType;
import com.banquet.repository.BookingRepository;
import com.banquet.repository.HallStaffRepository;
import com.banquet.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final HallStaffRepository hallStaffRepository;

    @org.springframework.beans.factory.annotation.Value("${app.stripe.secret-key}")
    private String stripeSecretKey;

    private boolean stripeEnabled() {
        return stripeSecretKey != null
                && !stripeSecretKey.isBlank()
                && !stripeSecretKey.contains("placeholder");
    }

    @Transactional
    public PaymentResponse createPaymentIntent(Long userId, PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getCustomer().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to pay for this booking");
        }

        String paymentIntentId;
        if (stripeEnabled()) {
            try {
                long amountInCents = request.amount()
                        .multiply(BigDecimal.valueOf(100))
                        .longValue();

                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amountInCents)
                        .setCurrency("usd")
                        .putMetadata("bookingId", booking.getId().toString())
                        .putMetadata("paymentType", request.paymentType().name())
                        .build();

                PaymentIntent paymentIntent = PaymentIntent.create(params);
                paymentIntentId = paymentIntent.getId();
            } catch (StripeException e) {
                throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
            }
        } else {
            paymentIntentId = "sim_" + System.currentTimeMillis() + "_" + booking.getId();
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.amount())
                .paymentType(request.paymentType())
                .status(PaymentStatus.PENDING)
                .stripePaymentIntentId(paymentIntentId)
                .build();

        payment = paymentRepository.save(payment);
        return toPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse confirmPayment(String stripePaymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus(PaymentStatus.SUCCESS);
        payment = paymentRepository.save(payment);

        Booking booking = payment.getBooking();
        booking.setPaidAmount(booking.getPaidAmount().add(payment.getAmount()));

        boolean shouldConfirm = false;
        if (booking.getPaidAmount().compareTo(booking.getTotalAmount()) >= 0) {
            shouldConfirm = true;
        } else if (payment.getPaymentType() == PaymentType.INSTALLMENT_1) {
            shouldConfirm = true;
        } else if (payment.getPaymentType() == PaymentType.FULL) {
            shouldConfirm = true;
        }

        if (shouldConfirm && booking.getStatus() == BookingStatus.PENDING) {
            booking.setStatus(BookingStatus.CONFIRMED);
        }

        bookingRepository.save(booking);
        return toPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse processRefund(Long bookingId, Long userId, RefundRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isCustomer = booking.getCustomer().getId().equals(userId);
        boolean isHallOwner = booking.getVenue().getHall().getOwner().getId().equals(userId);
        boolean isStaff = hallStaffRepository.existsByHallIdAndUserId(
                booking.getVenue().getHall().getId(), userId);

        if (!isCustomer && !isHallOwner && !isStaff) {
            throw new RuntimeException("Not authorized to process refund for this booking");
        }

        List<Payment> successfulPayments = paymentRepository.findByBookingId(bookingId).stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .collect(Collectors.toList());

        if (successfulPayments.isEmpty()) {
            throw new RuntimeException("No successful payment found for this booking");
        }

        Payment originalPayment = successfulPayments.get(0);

        BigDecimal refundAmount = (request.amount() != null) ? request.amount() : originalPayment.getAmount();

        if (stripeEnabled() && !originalPayment.getStripePaymentIntentId().startsWith("sim_")) {
            try {
                long refundAmountInCents = refundAmount
                        .multiply(BigDecimal.valueOf(100))
                        .longValue();

                RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(originalPayment.getStripePaymentIntentId())
                        .setAmount(refundAmountInCents)
                        .build();

                Refund.create(params);
            } catch (StripeException e) {
                throw new RuntimeException("Failed to process refund: " + e.getMessage(), e);
            }
        }

        Payment refundPayment = Payment.builder()
                .booking(booking)
                .amount(refundAmount.negate())
                .paymentType(originalPayment.getPaymentType())
                .status(PaymentStatus.REFUNDED)
                .stripePaymentIntentId(originalPayment.getStripePaymentIntentId())
                .build();

        refundPayment = paymentRepository.save(refundPayment);

        booking.setPaidAmount(booking.getPaidAmount().subtract(refundAmount));
        bookingRepository.save(booking);

        return toPaymentResponse(refundPayment);
    }

    public List<PaymentResponse> getBookingPayments(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBooking().getId(),
                payment.getAmount(),
                payment.getPaymentType(),
                payment.getStatus(),
                payment.getStripePaymentIntentId(),
                payment.getCreatedAt()
        );
    }
}
