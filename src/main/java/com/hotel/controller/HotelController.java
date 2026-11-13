package com.hotel.controller;

import com.hotel.dto.HotelResponse;
import com.hotel.dto.HotelRequest;
import com.hotel.model.Hotel;
import com.hotel.service.HotelService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotels")
@Validated
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public List<HotelResponse> getHotels(
            @RequestParam(required = false) String location,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        List<Hotel> hotels;
        if (checkInDate == null && checkOutDate == null) {
            hotels = hotelService.getHotels(location);
        } else {
            hotels = hotelService.searchHotels(location, checkInDate, checkOutDate);
        }
        return hotels.stream().map(HotelResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotel(@PathVariable Long id) {
        return ResponseEntity.ok(HotelResponse.from(hotelService.getHotel(id)));
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<HotelResponse> createHotel(
            @Valid @org.springframework.web.bind.annotation.RequestBody HotelRequest request) {
        Hotel hotel = hotelService.createHotel(
                request.name(),
                request.location(),
                request.description(),
                request.amenities(),
                request.pricePerNight(),
                request.totalRooms(),
                request.imageUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(HotelResponse.from(hotel));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}
