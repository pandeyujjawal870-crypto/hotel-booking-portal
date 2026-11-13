package com.hotel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record HotelRequest(
        @NotBlank(message = "Hotel name is required.")
        String name,
        @NotBlank(message = "Location is required.")
        String location,
        @NotBlank(message = "Description is required.")
        String description,
        @NotBlank(message = "Amenities are required.")
        String amenities,
        @NotNull(message = "Price per night is required.")
        @DecimalMin(value = "0.01", message = "Price per night must be greater than zero.")
        BigDecimal pricePerNight,
        @NotNull(message = "Total rooms is required.")
        @Min(value = 1, message = "Total rooms must be at least one.")
        Integer totalRooms,
        String imageUrl) {
}
