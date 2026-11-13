package com.hotel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;

@Entity
@Table(name = "room_availability",
       uniqueConstraints = @UniqueConstraint(columnNames = {"hotel_id", "availability_date"}))
public class RoomAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(name = "availability_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer availableRooms;

    protected RoomAvailability() {
    }

    public RoomAvailability(Hotel hotel, LocalDate date, Integer availableRooms) {
        this.hotel = hotel;
        this.date = date;
        this.availableRooms = availableRooms;
    }

    public Long getId() {
        return id;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }
}
