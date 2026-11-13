package com.hotel.repository;

import com.hotel.model.Hotel;
import com.hotel.model.RoomAvailability;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {

    Optional<RoomAvailability> findByHotelAndDate(Hotel hotel, LocalDate date);

    void deleteByHotel(Hotel hotel);

    List<RoomAvailability> findByHotelAndDateBetweenOrderByDateAsc(
            Hotel hotel, LocalDate startDate, LocalDate endDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select availability
            from RoomAvailability availability
            where availability.hotel = :hotel
              and availability.date >= :checkInDate
              and availability.date < :checkOutDate
            order by availability.date
            """)
    List<RoomAvailability> findForUpdateByHotelAndDateRange(
            @Param("hotel") Hotel hotel,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate);
}
