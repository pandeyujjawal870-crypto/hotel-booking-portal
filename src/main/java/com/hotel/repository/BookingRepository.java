package com.hotel.repository;

import com.hotel.model.Booking;
import com.hotel.model.Hotel;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReferenceAndGuestEmailIgnoreCase(
            String bookingReference, String guestEmail);

    void deleteByHotel(Hotel hotel);
}
