package com.hotel.service;

public class InvalidBookingDatesException extends IllegalArgumentException {

    public InvalidBookingDatesException(String message) {
        super(message);
    }
}
