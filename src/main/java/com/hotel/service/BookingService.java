package com.hotel.service;

import com.hotel.model.Booking;
import com.hotel.model.BookingStatus;
import com.hotel.model.Hotel;
import com.hotel.model.RoomAvailability;
import com.hotel.repository.BookingRepository;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.RoomAvailabilityRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomAvailabilityRepository availabilityRepository;

    public BookingService(BookingRepository bookingRepository,
                           HotelRepository hotelRepository,
                           RoomAvailabilityRepository availabilityRepository) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @Transactional
    public Booking createBooking(Long hotelId, String guestName, String guestEmail,
                                 LocalDate checkInDate, LocalDate checkOutDate) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hotel not found with id: " + hotelId));
        HotelService.validateDates(checkInDate, checkOutDate);

        List<RoomAvailability> lockedAvailability = availabilityRepository
                .findForUpdateByHotelAndDateRange(hotel, checkInDate, checkOutDate);
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        if (lockedAvailability.size() != nights) {
            throw new IllegalStateException(
                    "Availability is not configured for every requested night.");
        }
        if (lockedAvailability.stream().anyMatch(day -> day.getAvailableRooms() < 1)) {
            throw new IllegalStateException("The hotel has no available rooms for the "
                    + "requested dates.");
        }

        lockedAvailability.forEach(day -> day.setAvailableRooms(day.getAvailableRooms() - 1));
        BigDecimal totalAmount = hotel.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));
        Booking booking = new Booking(hotel, guestName, guestEmail, checkInDate,
                checkOutDate, totalAmount, BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public Booking getBooking(String bookingReference, String guestEmail) {
        return bookingRepository.findByBookingReferenceAndGuestEmailIgnoreCase(
                        bookingReference, guestEmail)
                .orElseThrow(() -> new NoSuchElementException(
                        "Booking not found for the supplied reference and email."));
    }

    @Transactional
    public Booking cancelBooking(String bookingReference, String guestEmail) {
        Booking booking = getBooking(bookingReference, guestEmail);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        List<RoomAvailability> lockedAvailability = availabilityRepository
                .findForUpdateByHotelAndDateRange(
                        booking.getHotel(), booking.getCheckInDate(), booking.getCheckOutDate());
        long nights = ChronoUnit.DAYS.between(
                booking.getCheckInDate(), booking.getCheckOutDate());
        if (lockedAvailability.size() != nights) {
            throw new IllegalStateException(
                    "Availability is not configured for every booked night.");
        }
        lockedAvailability.forEach(day -> day.setAvailableRooms(
                Math.min(day.getHotel().getTotalRooms(), day.getAvailableRooms() + 1)));
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
