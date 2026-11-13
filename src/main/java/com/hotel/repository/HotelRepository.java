package com.hotel.repository;

import com.hotel.model.Hotel;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByLocationContainingIgnoreCase(String location);

    Optional<Hotel> findByNameIgnoreCase(String name);
}
