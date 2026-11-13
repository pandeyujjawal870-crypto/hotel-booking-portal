package com.hotel.controller;

import com.hotel.dto.BookingRequest;
import com.hotel.dto.BookingResponse;
import com.hotel.dto.CancelBookingRequest;
import com.hotel.model.Booking;
import com.hotel.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@Validated
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.createBooking(
                request.hotelId(),
                request.guestName().trim(),
                request.guestEmail().trim(),
                request.checkInDate(),
                request.checkOutDate());
        return ResponseEntity.status(HttpStatus.CREATED).body(BookingResponse.from(booking));
    }

    @GetMapping("/lookup")
    public BookingResponse lookupBooking(
            @RequestParam @NotBlank(message = "Booking reference is required.")
            String reference,
            @RequestParam @NotBlank(message = "Guest email is required.")
            @Email(message = "Guest email must be valid.")
            String email) {
        return BookingResponse.from(bookingService.getBooking(reference.trim(), email.trim()));
    }

    @PostMapping("/{reference}/cancel")
    public BookingResponse cancelBooking(
            @PathVariable String reference,
            @Valid @RequestBody CancelBookingRequest request) {
        return BookingResponse.from(
                bookingService.cancelBooking(reference.trim(), request.email().trim()));
    }
}
