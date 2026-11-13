package com.hotel.dto;

import com.hotel.model.Hotel;
import java.math.BigDecimal;

public record HotelResponse(
        Long id,
        String name,
        String location,
        String description,
        String amenities,
        BigDecimal pricePerNight,
        Integer totalRooms,
        String imageUrl) {

    public static HotelResponse from(Hotel hotel) {
        return new HotelResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getDescription(),
                hotel.getAmenities(),
                hotel.getPricePerNight(),
                hotel.getTotalRooms(),
                hotel.getImageUrl());
    }
}
