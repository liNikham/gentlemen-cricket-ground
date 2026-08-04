# Ground Booking Updates: Advance Limit, Fixed Slots & Dynamic Slot Pricing

This update implements ground booking enhancements, enforcing a 30-day max advance booking limit, configuring 2 fixed slots (`7:00 AM - 10:30 AM` and `2:30 PM - 5:50 PM`), and rendering dynamic pricing right when the user selects a slot and date.

## User Review Required

> [!IMPORTANT]
> **Slot Schedule & Dynamic Pricing Logic**
> - **Available Slots**: Ground bookings are restricted to two fixed time slots:
>   1. Morning Slot: `7:00 AM - 10:30 AM`
>   2. Afternoon/Evening Slot: `2:30 PM - 5:50 PM`
> - **Advance Booking Window**: Users can select booking dates starting from today up to **maximum 30 days in advance** (`min = today`, `max = today + 30 days`).
> - **Dynamic Pricing**: When a user selects a date and a slot in the booking modal, the price is computed dynamically:
>   - Mon–Fri: **Weekday Rate** (`weekdayPrice`)
>   - Sat–Sun: **Weekend Rate** (`weekendPrice`)
>   - The selected slot pricing is displayed prominently in real-time.

---

## Proposed Changes

### Backend & Database

#### [MODIFY] [schema.prisma](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/prisma/schema.prisma)
- Update default `timeSlots` in `CricketGround` model to `["7:00 AM - 10:30 AM", "2:30 PM - 5:50 PM"]`.

#### [MODIFY] [ground.service.ts](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/backend/src/modules/ground/ground.service.ts)
- Update default time slots fallback array to `["7:00 AM - 10:30 AM", "2:30 PM - 5:50 PM"]`.

---

### Frontend Setup

#### [MODIFY] [App.tsx](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/frontend/src/App.tsx)
1. **Interactive Ground Booking Modal**:
   - Add state for `showBookingModal`, `selectedGroundForBooking`, `bookingDate`, `selectedSlot`, and `bookingSuccess`.
   - Restrict `bookingDate` picker with `min` set to today's date (`YYYY-MM-DD`) and `max` set to today + 30 days (`YYYY-MM-DD`).
   - Radio/Card selection for the 2 available slots: `7:00 AM - 10:30 AM` and `2:30 PM - 5:50 PM`.
   - Dynamic Price calculation & live display card showing:
     - Slot selected
     - Day type (Weekday vs Weekend)
     - Calculated total price (e.g. `₹1,500` or `₹2,500`)
   - Confirm booking flow displaying booking confirmation ticket with reference ID, ground details, selected slot, date, and contact person.

2. **Ground Cards & Details Display**:
   - Replace generic alert on "Book 3-Hour Slot" button with triggering the interactive Ground Booking Modal.
   - Update slot badges on ground cards to highlight the 2 slots: `7:00 AM - 10:30 AM` and `2:30 PM - 5:50 PM`.

---

## Verification Plan

### Automated Verification
- Run `npm run build` in `/frontend` to verify TypeScript types and JSX compilation without errors.
- Verify NestJS backend build `npm run build` in `/backend`.

### Manual Verification
1. Open the application dashboard in browser.
2. Select any ground card and click "Book Slot".
3. Verify that the date picker only allows dates within the next 30 days (past dates and dates > 30 days are disabled).
4. Select `7:00 AM - 10:30 AM` or `2:30 PM - 5:50 PM` and select different dates (weekday vs weekend).
5. Confirm that the price updates dynamically right away based on weekday/weekend rates.
6. Complete booking and verify the confirmation modal/receipt display.
