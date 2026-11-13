package com.hotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record BookingRequest(
        @NotNull(message = "Hotel id is required.")
        Long hotelId,
        @NotBlank(message = "Guest name is required.")
        String guestName,
        @NotBlank(message = "Guest email is required.")
        @Email(message = "Guest email must be valid.")
        String guestEmail,
        @NotNull(message = "Check-in date is required.")
        LocalDate checkInDate,
        @NotNull(message = "Check-out date is required.")
        LocalDate checkOutDate) {
}
