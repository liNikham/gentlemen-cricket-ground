import React, { useState } from 'react';
import { X, Clock, CheckCircle } from 'lucide-react';
import { Ground, BookingTicket } from '../../types/ground.types';
import { getTodayDateStr, getNext30Days } from '../../utils/dateUtils';
import { calculateSlotPrice } from '../../utils/priceUtils';
import { CalendarStrip } from './CalendarStrip';

interface BookingModalProps {
  ground: Ground;
  onClose: () => void;
  onConfirmBooking: (ticket: BookingTicket) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  ground,
  onClose,
  onConfirmBooking,
}) => {
  const [bookingDate, setBookingDate] = useState(getTodayDateStr());
  const initialSlots = ground.timeSlots && ground.timeSlots.length > 0
    ? ground.timeSlots
    : ['7:00 AM - 10:30 AM', '2:30 PM - 5:50 PM'];
  const [selectedSlot, setSelectedSlot] = useState(initialSlots[0]);
  const [bookingTicket, setBookingTicket] = useState<BookingTicket | null>(null);

  const priceDetails = calculateSlotPrice(ground, bookingDate, selectedSlot);
  const thirtyDays = getNext30Days();

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const randomTicketId = 'GCG-BKG-' + Math.floor(100000 + Math.random() * 900000);
    const ticket: BookingTicket = {
      id: randomTicketId,
      groundName: ground.name,
      date: bookingDate,
      slot: selectedSlot,
      price: priceDetails.price,
      isWeekend: priceDetails.isWeekend,
      dayName: priceDetails.dayName,
      contactName: ground.contactName,
      contactPhone: ground.contactPhone,
    };
    setBookingTicket(ticket);
    onConfirmBooking(ticket);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-inter">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
        >
          <X size={18} />
        </button>

        {bookingTicket ? (
          /* BOOKING SUCCESS RECEIPT VIEW */
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle size={36} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-900/40">
                Booking Confirmed
              </span>
              <h3 className="text-xl font-outfit font-bold text-zinc-100 mt-2">
                {bookingTicket.groundName}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Reference ID: <span className="font-mono text-amber-400 font-bold">{bookingTicket.id}</span>
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-zinc-400">Booking Date</span>
                <span className="font-semibold text-zinc-100">{bookingTicket.date} ({bookingTicket.dayName})</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-zinc-400">Reserved Slot</span>
                <span className="font-mono font-semibold text-amber-400">{bookingTicket.slot}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-zinc-400">Rate Classification</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    bookingTicket.isWeekend
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {bookingTicket.isWeekend ? 'Weekend Rate' : 'Weekday Rate'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-zinc-400">Ground Contact</span>
                <span className="font-semibold text-zinc-200">
                  {bookingTicket.contactName} ({bookingTicket.contactPhone})
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm font-bold">
                <span className="text-zinc-200">Total Price Paid</span>
                <span className="text-amber-400 font-mono text-base">₹{bookingTicket.price}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-3 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* BOOKING FORM VIEW */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-lg font-outfit font-bold text-zinc-100">Book Ground Slot</h3>
                <p className="text-xs text-zinc-400">{ground.name}</p>
              </div>
            </div>

            <form onSubmit={handleConfirm} className="space-y-5 text-xs">
              {/* Step 1: 30-Day Interactive Calendar */}
              <CalendarStrip
                days={thirtyDays}
                selectedDate={bookingDate}
                onSelectDate={setBookingDate}
                dayNameLabel={priceDetails.dayName}
              />

              {/* Step 2: Slot Selection — price shown inline on the selected card */}
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-zinc-300 uppercase tracking-wider">
                  ⚡ 2. Select Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      slotTime: ground.timeSlots[0] || '7:00 AM - 10:30 AM',
                      label: '🌅 Morning Slot',
                      morningPrice: ground.morningPrice ?? ground.weekdayPrice ?? 1500,
                      morningWeekendPrice: ground.morningWeekendPrice ?? ground.weekendPrice ?? 2500,
                    },
                    {
                      slotTime: ground.timeSlots[1] || '2:30 PM - 5:50 PM',
                      label: '🌇 Evening Slot',
                      morningPrice: ground.eveningPrice ?? ground.weekdayPrice ?? 1800,
                      morningWeekendPrice: ground.eveningWeekendPrice ?? ground.weekendPrice ?? 2800,
                    },
                  ].map((item) => {
                    const isSelected = selectedSlot === item.slotTime;
                    const slotPriceDetails = calculateSlotPrice(
                      { ...ground, morningPrice: item.morningPrice, morningWeekendPrice: item.morningWeekendPrice },
                      bookingDate,
                      item.slotTime
                    );

                    return (
                      <button
                        key={item.slotTime}
                        type="button"
                        onClick={() => setSelectedSlot(item.slotTime)}
                        className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-zinc-100 shadow-lg shadow-amber-500/10'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-amber-400">{item.label}</span>
                          {isSelected && <CheckCircle size={15} className="text-amber-400" />}
                        </div>
                        <span className="text-sm font-mono font-bold text-zinc-100">{item.slotTime}</span>
                        {isSelected && (
                          <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              slotPriceDetails.isWeekend
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {slotPriceDetails.isWeekend ? 'Weekend' : 'Weekday'}
                            </span>
                            <span className="text-base font-mono font-bold text-amber-400">₹{slotPriceDetails.price}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Confirm Booking (₹{priceDetails.price})
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
