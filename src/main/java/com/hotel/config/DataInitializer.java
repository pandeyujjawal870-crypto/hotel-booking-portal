package com.hotel.config;

import com.hotel.model.Hotel;
import com.hotel.model.RoomAvailability;
import com.hotel.repository.HotelRepository;
import com.hotel.repository.RoomAvailabilityRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final int AVAILABILITY_DAYS = 60;

    private final HotelRepository hotelRepository;
    private final RoomAvailabilityRepository availabilityRepository;

    public DataInitializer(HotelRepository hotelRepository,
                           RoomAvailabilityRepository availabilityRepository) {
        this.hotelRepository = hotelRepository;
        this.availabilityRepository = availabilityRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (hotelRepository.count() == 0) {
            hotelRepository.saveAll(sampleHotels());
        } else {
            addMissingMumbaiHotels();
        }
        normalizeSamplePrices();

        LocalDate startDate = LocalDate.now();
        hotelRepository.findAll().forEach(hotel -> {
            for (int day = 0; day < AVAILABILITY_DAYS; day++) {
                LocalDate date = startDate.plusDays(day);
                if (availabilityRepository.findByHotelAndDate(hotel, date).isEmpty()) {
                    availabilityRepository.save(
                            new RoomAvailability(hotel, date, hotel.getTotalRooms()));
                }
            }
        });
    }

    private List<Hotel> sampleHotels() {
        return List.of(
                new Hotel(
                        "The Grand Palace",
                        "New Delhi",
                        "A refined city hotel near Connaught Place with elegant rooms and attentive service.",
                        "Wi-Fi, Swimming Pool, Spa, Restaurant, Airport Shuttle",
                        new BigDecimal("12000.00"),
                        80,
                        "https://images.unsplash.com/photo-1564501049412-61c2a3083791"),
                new Hotel(
                        "Misty Mountain Retreat",
                        "Manali",
                        "A peaceful mountain retreat with panoramic Himalayan views and cozy fireplaces.",
                        "Wi-Fi, Breakfast, Mountain View, Bonfire, Parking",
                        new BigDecimal("9000.00"),
                        42,
                        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"),
                new Hotel(
                        "Coastal Pearl Resort",
                        "Goa",
                        "A relaxed beachfront resort offering spacious suites, local cuisine, and sunset views.",
                        "Private Beach, Pool, Wi-Fi, Restaurant, Water Sports",
                        new BigDecimal("15500.00"),
                        65,
                        "https://images.unsplash.com/photo-1582610116397-edb318620f8a"),
                new Hotel(
                        "Heritage Haveli",
                        "Jaipur",
                        "A restored heritage haveli blending traditional Rajasthani design with modern comfort.",
                        "Courtyard, Cultural Tours, Wi-Fi, Restaurant, Room Service",
                        new BigDecimal("10500.00"),
                        30,
                        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"),
                new Hotel(
                        "Lakeview Suites",
                        "Udaipur",
                        "An intimate lakeside property with serene views, spacious suites, and rooftop dining.",
                        "Lake View, Rooftop Restaurant, Wi-Fi, Pool, Concierge",
                        new BigDecimal("18000.00"),
                        28,
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945"),
                new Hotel(
                        "The Marine Bay Hotel",
                        "Mumbai",
                        "A polished waterfront retreat near Marine Drive with sweeping bay views and warm hospitality.",
                        "Wi-Fi, Rooftop Pool, Sea View, Restaurant, Fitness Centre",
                        new BigDecimal("16500.00"),
                        72,
                        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"),
                new Hotel(
                        "Bandra Boutique Suites",
                        "Mumbai",
                        "A design-forward boutique stay in Bandra with locally inspired interiors and a lively neighbourhood on its doorstep.",
                        "Wi-Fi, Cafe, Breakfast, Co-working Lounge, Concierge",
                        new BigDecimal("13500.00"),
                        36,
                        "https://images.unsplash.com/photo-1564501049412-61c2a3083791")
        );
    }

    private void addMissingMumbaiHotels() {
        sampleHotels().stream()
                .filter(hotel -> "Mumbai".equalsIgnoreCase(hotel.getLocation()))
                .filter(hotel -> hotelRepository.findByNameIgnoreCase(hotel.getName()).isEmpty())
                .forEach(hotelRepository::save);
    }

    private void normalizeSamplePrices() {
        sampleHotels().forEach(seedHotel ->
                hotelRepository.findByNameIgnoreCase(seedHotel.getName())
                        .filter(existing -> existing.getPricePerNight().compareTo(
                                new BigDecimal("1000.00")) < 0)
                        .ifPresent(existing -> {
                            existing.setPricePerNight(seedHotel.getPricePerNight());
                            hotelRepository.save(existing);
                        }));
    }
}
