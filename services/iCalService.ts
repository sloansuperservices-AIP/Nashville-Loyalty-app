import { Booking, Vehicle } from '../types';

// Due to CORS restrictions in the browser, we cannot fetch a live iCal URL.
// This service simulates fetching and parsing an iCal feed.
// In a real application, this would be handled by a backend service.

interface DateRange {
    start: Date;
    end: Date;
}

// Mock function to simulate fetching and parsing an iCal URL.
// It returns a hardcoded set of busy slots for demonstration.
export const getBookedSlots = async (iCalUrl: string): Promise<DateRange[]> => {
    console.log(`Simulating fetch for iCal feed: ${iCalUrl}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return some mock busy slots. A real implementation would parse the iCal data.
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    return [
        { start: new Date(today.setHours(14, 0, 0, 0)), end: new Date(today.setHours(16, 30, 0, 0)) },
        { start: new Date(tomorrow.setHours(10, 0, 0, 0)), end: new Date(tomorrow.setHours(11, 0, 0, 0)) },
    ];
};

// Function to generate a downloadable .ics file from a booking
export const generateAndDownloadICS = (booking: Booking, vehicle: Vehicle) => {
    const formatICalDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = new Date(booking.startTime);
    const endDate = new Date(booking.endTime);

    const icalContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//RockstarHospitalityPass//EN',
        'BEGIN:VEVENT',
        `UID:${booking.id}@rockstarpass.app`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(startDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:Rockstar Ride: ${vehicle.name}`,
        `DESCRIPTION:Your booking for the ${vehicle.name} (${booking.bookingType.replace('_', ' ')}) is confirmed.`,
        'LOCATION:Nashville, TN',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `booking_${vehicle.name.replace(/\s+/g, '_')}_${booking.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};