package com.hotel.service;

import com.hotel.model.Hotel;
import com.hotel.model.RoomAvailability;
import com.hotel.repository.BookingRepository;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.RoomAvailabilityRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomAvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;

    public HotelService(HotelRepository hotelRepository,
                        RoomAvailabilityRepository availabilityRepository,
                        BookingRepository bookingRepository) {
        this.hotelRepository = hotelRepository;
        this.availabilityRepository = availabilityRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Hotel> searchHotels(String location, LocalDate checkInDate,
                                    LocalDate checkOutDate) {
        return searchHotels(location, checkInDate, checkOutDate, 1);
    }

    public List<Hotel> searchHotels(String location, LocalDate checkInDate,
                                    LocalDate checkOutDate, int requestedRooms) {
        validateDates(checkInDate, checkOutDate);
        if (requestedRooms < 1) {
            throw new IllegalArgumentException("Requested rooms must be at least one.");
        }

        String normalizedLocation = location == null ? "" : location.trim();
        return hotelRepository.findByLocationContainingIgnoreCase(normalizedLocation)
                .stream()
                .filter(hotel -> hasAvailability(hotel, checkInDate, checkOutDate,
                        requestedRooms))
                .toList();
    }

    public List<Hotel> getHotels(String location) {
        return hotelRepository.findByLocationContainingIgnoreCase(
                location == null ? "" : location.trim());
    }

    public Hotel getHotel(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hotel not found with id: " + id));
    }

    @Transactional
    public Hotel createHotel(String name, String location, String description,
                             String amenities, java.math.BigDecimal pricePerNight,
                             Integer totalRooms, String imageUrl) {
        Hotel hotel = new Hotel(
                name.trim(),
                location.trim(),
                description.trim(),
                amenities.trim(),
                pricePerNight,
                totalRooms,
                imageUrl == null ? null : imageUrl.trim());
        Hotel savedHotel = hotelRepository.save(hotel);
        LocalDate startDate = LocalDate.now();
        for (int day = 0; day < 60; day++) {
            availabilityRepository.save(new RoomAvailability(
                    savedHotel, startDate.plusDays(day), totalRooms));
        }
        return savedHotel;
    }

    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = getHotel(id);
        bookingRepository.deleteByHotel(hotel);
        availabilityRepository.deleteByHotel(hotel);
        hotelRepository.delete(hotel);
    }

    private boolean hasAvailability(Hotel hotel, LocalDate checkInDate,
                                    LocalDate checkOutDate, int requestedRooms) {
        List<RoomAvailability> availability = availabilityRepository
                .findByHotelAndDateBetweenOrderByDateAsc(
                        hotel, checkInDate, checkOutDate.minusDays(1));
        long nights = checkOutDate.toEpochDay() - checkInDate.toEpochDay();
        return availability.size() == nights
                && availability.stream()
                .allMatch(day -> day.getAvailableRooms() >= requestedRooms);
    }

    static void validateDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            throw new InvalidBookingDatesException("Check-in and check-out dates are required.");
        }
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new InvalidBookingDatesException("Check-in date cannot be in the past.");
        }
        if (!checkOutDate.isAfter(checkInDate)) {
            throw new InvalidBookingDatesException(
                    "Check-out date must be strictly after check-in date.");
        }
    }
}
