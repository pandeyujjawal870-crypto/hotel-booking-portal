package com.hotel.dto;

import com.hotel.model.Booking;
import com.hotel.model.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BookingResponse(
        String bookingReference,
        Long hotelId,
        String hotelName,
        String guestName,
        String guestEmail,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        BigDecimal totalAmount,
        BookingStatus status) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getBookingReference(),
                booking.getHotel().getId(),
                booking.getHotel().getName(),
                booking.getGuestName(),
                booking.getGuestEmail(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalAmount(),
                booking.getStatus());
    }
}
