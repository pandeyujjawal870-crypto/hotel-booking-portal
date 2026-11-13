package com.hotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CancelBookingRequest(
        @NotBlank(message = "Guest email is required.")
        @Email(message = "Guest email must be valid.")
        String email) {
}
