import React from 'react';
import { Clock, MapPin, Phone, Edit2, Shield, Calendar } from 'lucide-react';
import { Ground } from '../../types/ground.types';

interface GroundCardProps {
  ground: Ground;
  isAdmin: boolean;
  onBook: (ground: Ground) => void;
  onEdit: (ground: Ground) => void;
}

export const GroundCard: React.FC<GroundCardProps> = ({
  ground,
  isAdmin,
  onBook,
  onEdit,
}) => {
  const g = ground;

  return (
    <div className="bg-zinc-950/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/30 transition-all duration-200 shadow-xl">
      <div>
        {/* Ground Image Banner */}
        <div className="h-44 bg-zinc-900 relative overflow-hidden">
          <img
            src={g.images && g.images.length > 0 ? g.images[0] : '/gcg_box_cricket.png'}
            alt={g.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1000';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h4 className="text-base font-outfit font-bold text-zinc-100">{g.name}</h4>
            <p className="text-xs text-zinc-400 font-inter flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-amber-500 shrink-0" />
              <span className="truncate">{g.address}</span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4 text-xs font-inter">
          {/* Map Location Link */}
          {g.mapLocationUrl && (
            <a
              href={g.mapLocationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:underline text-xs font-semibold"
            >
              <MapPin size={12} />
              Open Google Maps Location ↗
            </a>
          )}

          <p className="text-zinc-400 text-xs leading-relaxed">{g.description}</p>

          {/* Morning & Evening Slot Timings & Prices */}
          <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-3 space-y-2 font-inter">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block flex items-center gap-1">
              <Clock size={11} className="text-amber-500" />
              Available Time Slots & Pricing
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/80 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[9px] text-amber-400 uppercase font-semibold block">🌅 Morning Slot</span>
                <span className="text-[11px] font-mono text-zinc-200 block truncate">
                  {g.timeSlots?.[0] || '7:00 AM - 10:30 AM'}
                </span>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">WD: ₹{g.morningPrice ?? g.weekdayPrice}</span>
                  <span className="text-amber-400 font-bold">WE: ₹{g.morningWeekendPrice ?? g.weekendPrice}</span>
                </div>
              </div>
              <div className="bg-zinc-950/80 p-2 rounded-lg border border-amber-500/20">
                <span className="text-[9px] text-amber-400 uppercase font-semibold block">🌇 Evening Slot</span>
                <span className="text-[11px] font-mono text-zinc-200 block truncate">
                  {g.timeSlots?.[1] || '2:30 PM - 5:50 PM'}
                </span>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">WD: ₹{g.eveningPrice ?? g.weekdayPrice}</span>
                  <span className="text-amber-400 font-bold">WE: ₹{g.eveningWeekendPrice ?? g.weekendPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities Badges */}
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1.5">Facilities</span>
            <div className="flex flex-wrap gap-1.5">
              {g.hasParking && <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">🅿️ Parking</span>}
              {g.hasCharging && <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">⚡ EV Charger</span>}
              {g.hasFirstAid && <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">🩹 First Aid</span>}
              {g.hasDugout && <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">🛋️ Dugout</span>}
              {g.hasWashroom && <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">🚻 Washroom</span>}
              {g.hasChangingRoom && <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">👕 Changing Room</span>}
            </div>
          </div>

          {/* Contact Person */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-zinc-300">
              <Phone size={12} className="text-amber-500" />
              {g.contactName}
            </span>
            <span className="font-mono text-zinc-400">{g.contactPhone}</span>
          </div>

          {/* Ground Rules */}
          {g.rules && (
            <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-white/5 text-[11px] text-zinc-400 space-y-1">
              <span className="text-amber-400 font-semibold text-[10px] uppercase block">Ground Rules</span>
              <p className="whitespace-pre-line text-zinc-300 line-clamp-3">{g.rules}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          onClick={() => onBook(g)}
          className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
        >
          <Calendar size={14} />
          Book Ground Slot
        </button>

        {isAdmin && (
          <button
            onClick={() => onEdit(g)}
            className="bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
            title="Edit Ground Details & Prices"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
        )}
      </div>
    </div>
  );
};
