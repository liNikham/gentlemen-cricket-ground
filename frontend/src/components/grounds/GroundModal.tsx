import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, Building } from 'lucide-react';
import { Ground } from '../../types/ground.types';

interface GroundModalProps {
  editingGround: Ground | null;
  loading: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
}

export const GroundModal: React.FC<GroundModalProps> = ({
  editingGround,
  loading,
  onClose,
  onSave,
}) => {
  const [gName, setGName] = useState('');
  const [gAddress, setGAddress] = useState('');
  const [gMapUrl, setGMapUrl] = useState('');
  const [gDescription, setGDescription] = useState('');
  const [gImageUrl, setGImageUrl] = useState('');
  const [gMorningPrice, setGMorningPrice] = useState(1500);
  const [gMorningWeekendPrice, setGMorningWeekendPrice] = useState(2500);
  const [gEveningPrice, setGEveningPrice] = useState(1800);
  const [gEveningWeekendPrice, setGEveningWeekendPrice] = useState(2800);
  const [gMorningSlot, setGMorningSlot] = useState('7:00 AM - 10:30 AM');
  const [gEveningSlot, setGEveningSlot] = useState('2:30 PM - 5:50 PM');
  const [gContactName, setGContactName] = useState('');
  const [gContactPhone, setGContactPhone] = useState('+91');
  const [gRules, setGRules] = useState('');
  const [gHasParking, setGHasParking] = useState(true);
  const [gHasCharging, setGHasCharging] = useState(true);
  const [gHasFirstAid, setGHasFirstAid] = useState(true);
  const [gHasDugout, setGHasDugout] = useState(true);
  const [gHasWashroom, setGHasWashroom] = useState(true);
  const [gHasChangingRoom, setGHasChangingRoom] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGround) {
      setGName(editingGround.name);
      setGAddress(editingGround.address);
      setGMapUrl(editingGround.mapLocationUrl || '');
      setGDescription(editingGround.description);
      setGImageUrl(editingGround.images ? editingGround.images.join(', ') : '');
      setGMorningPrice(editingGround.morningPrice ?? editingGround.weekdayPrice ?? 1500);
      setGMorningWeekendPrice(editingGround.morningWeekendPrice ?? editingGround.weekendPrice ?? 2500);
      setGEveningPrice(editingGround.eveningPrice ?? editingGround.weekdayPrice ?? 1800);
      setGEveningWeekendPrice(editingGround.eveningWeekendPrice ?? editingGround.weekendPrice ?? 2800);
      setGMorningSlot(editingGround.timeSlots && editingGround.timeSlots[0] ? editingGround.timeSlots[0] : '7:00 AM - 10:30 AM');
      setGEveningSlot(editingGround.timeSlots && editingGround.timeSlots[1] ? editingGround.timeSlots[1] : '2:30 PM - 5:50 PM');
      setGContactName(editingGround.contactName);
      setGContactPhone(editingGround.contactPhone);
      setGRules(editingGround.rules);
      setGHasParking(editingGround.hasParking);
      setGHasCharging(editingGround.hasCharging);
      setGHasFirstAid(editingGround.hasFirstAid);
      setGHasDugout(editingGround.hasDugout);
      setGHasWashroom(editingGround.hasWashroom);
      setGHasChangingRoom(editingGround.hasChangingRoom);
    } else {
      setGName('');
      setGAddress('');
      setGMapUrl('');
      setGDescription('');
      setGImageUrl('');
      setGMorningPrice(1500);
      setGMorningWeekendPrice(2500);
      setGEveningPrice(1800);
      setGEveningWeekendPrice(2800);
      setGMorningSlot('7:00 AM - 10:30 AM');
      setGEveningSlot('2:30 PM - 5:50 PM');
      setGContactName('');
      setGContactPhone('+91');
      setGRules('Standard ground rules apply. Respect timings and wear non-marking shoes.');
      setGHasParking(true);
      setGHasCharging(true);
      setGHasFirstAid(true);
      setGHasDugout(true);
      setGHasWashroom(true);
      setGHasChangingRoom(true);
    }
  }, [editingGround]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (gName.trim().length < 3) {
      setError('Ground Name must be at least 3 characters long');
      return;
    }

    if (!gAddress.trim() || !gDescription.trim() || !gContactName.trim()) {
      setError('Please fill in all required fields (Name, Address, Description, Contact Name)');
      return;
    }

    let contactPhoneFormatted = gContactPhone.trim();
    if (/^\d{10}$/.test(contactPhoneFormatted)) {
      contactPhoneFormatted = `+91${contactPhoneFormatted}`;
    } else if (!contactPhoneFormatted.startsWith('+')) {
      contactPhoneFormatted = `+${contactPhoneFormatted}`;
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(contactPhoneFormatted)) {
      setError('Contact Phone must be a valid mobile number (e.g. +919876543210 or 9876543210)');
      return;
    }

    if (gMorningPrice < 0 || gMorningWeekendPrice < 0 || gEveningPrice < 0 || gEveningWeekendPrice < 0) {
      setError('Slot pricing cannot be negative');
      return;
    }

    if (gMapUrl.trim() && !/^https?:\/\//i.test(gMapUrl.trim())) {
      setError('Google Maps link must start with http:// or https://');
      return;
    }

    if (!gMorningSlot.trim() || !gEveningSlot.trim()) {
      setError('Both Morning and Evening time slots are required');
      return;
    }

    const payload = {
      name: gName,
      address: gAddress,
      mapLocationUrl: gMapUrl,
      description: gDescription,
      images: gImageUrl ? gImageUrl.split(',').map((s) => s.trim()).filter(Boolean) : [],
      weekdayPrice: Number(gMorningPrice),
      weekendPrice: Number(gMorningWeekendPrice),
      morningPrice: Number(gMorningPrice),
      morningWeekendPrice: Number(gMorningWeekendPrice),
      eveningPrice: Number(gEveningPrice),
      eveningWeekendPrice: Number(gEveningWeekendPrice),
      timeSlots: [gMorningSlot.trim(), gEveningSlot.trim()],
      contactName: gContactName,
      contactPhone: contactPhoneFormatted,
      rules: gRules,
      hasParking: gHasParking,
      hasCharging: gHasCharging,
      hasFirstAid: gHasFirstAid,
      hasDugout: gHasDugout,
      hasWashroom: gHasWashroom,
      hasChangingRoom: gHasChangingRoom,
    };

    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto font-inter">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <Building size={20} />
          </div>
          <div>
            <h3 className="text-lg font-outfit font-bold text-zinc-100">
              {editingGround ? 'Edit Cricket Ground Details' : 'Add New Cricket Ground'}
            </h3>
            <p className="text-xs text-zinc-400">Configure ground details, morning/evening slots, and pricing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Ground Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300 uppercase tracking-wider">Ground Name *</label>
            <input
              type="text"
              placeholder="e.g. Gentlemen Turf & Box Arena"
              value={gName}
              onChange={(e) => setGName(e.target.value)}
              required
              className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none font-semibold"
            />
          </div>

          {/* Address & Google Maps URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider">Address *</label>
              <input
                type="text"
                placeholder="e.g. Plot 42, Sports Complex, SG Highway"
                value={gAddress}
                onChange={(e) => setGAddress(e.target.value)}
                required
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider">Google Maps Link</label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={gMapUrl}
                onChange={(e) => setGMapUrl(e.target.value)}
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300 uppercase tracking-wider">Description *</label>
            <textarea
              rows={3}
              placeholder="Describe ground dimensions, grass quality, night floodlights, etc."
              value={gDescription}
              onChange={(e) => setGDescription(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 outline-none"
            />
          </div>

          {/* Ground Photos */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300 uppercase tracking-wider">Ground Photo URLs (Comma-separated)</label>
            <input
              type="text"
              placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              value={gImageUrl}
              onChange={(e) => setGImageUrl(e.target.value)}
              className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
            />
          </div>

          {/* Slot Timings & Slot-Specific Pricing Configuration */}
          <div className="bg-zinc-950/80 p-5 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-amber-400 uppercase text-xs tracking-wider flex items-center gap-1.5">
                ⚡ Slot Timings & Slot-Specific Pricing Configuration
              </span>
              <span className="text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-full font-mono">
                Admin Custom Slot Rates
              </span>
            </div>

            {/* Morning Slot Setup Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-900/90 p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  🌅 Morning Slot Pricing & Timing
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/40">
                  Slot 1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300 text-[11px]">Morning Slot Timing *</label>
                  <input
                    type="text"
                    placeholder="e.g. 7:00 AM - 10:30 AM"
                    value={gMorningSlot}
                    onChange={(e) => setGMorningSlot(e.target.value)}
                    required
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 text-xs text-zinc-100 outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300 text-[11px]">Morning Weekday Rate (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={gMorningPrice}
                    onChange={(e) => setGMorningPrice(Number(e.target.value))}
                    required
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 text-xs text-emerald-400 font-bold outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300 text-[11px]">Morning Weekend Rate (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={gMorningWeekendPrice}
                    onChange={(e) => setGMorningWeekendPrice(Number(e.target.value))}
                    required
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 text-xs text-amber-400 font-bold outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Evening Slot Setup Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 via-zinc-900/90 to-zinc-900/90 p-4 rounded-2xl border border-indigo-500/30 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                  🌇 Afternoon / Evening Slot Pricing & Timing
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-500/40">
                  Slot 2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300 text-[11px]">Evening Slot Timing *</label>
                  <input
                    type="text"
                    placeholder="e.g. 2:30 PM - 5:50 PM"
                    value={gEveningSlot}
                    onChange={(e) => setGEveningSlot(e.target.value)}
                    required
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-xs text-zinc-100 outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300 text-[11px]">Evening Weekday Rate (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={gEveningPrice}
                    onChange={(e) => setGEveningPrice(Number(e.target.value))}
                    required
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-xs text-emerald-400 font-bold outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-zinc-300 text-[11px]">Evening Weekend Rate (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={gEveningWeekendPrice}
                    onChange={(e) => setGEveningWeekendPrice(Number(e.target.value))}
                    required
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl px-3 text-xs text-amber-400 font-bold outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Facilities Checkboxes */}
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-white/5 space-y-3">
            <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">Facilities Available</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={gHasParking}
                  onChange={(e) => setGHasParking(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>🅿️ Parking</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={gHasCharging}
                  onChange={(e) => setGHasCharging(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>⚡ EV Charging</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={gHasFirstAid}
                  onChange={(e) => setGHasFirstAid(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>🩹 First Aid Kit</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={gHasDugout}
                  onChange={(e) => setGHasDugout(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>🛋️ Player Dugout</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={gHasWashroom}
                  onChange={(e) => setGHasWashroom(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>🚻 Clean Washroom</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={gHasChangingRoom}
                  onChange={(e) => setGHasChangingRoom(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span>👕 Changing Room</span>
              </label>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider">Responsible Person Name *</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar (Ground Manager)"
                value={gContactName}
                onChange={(e) => setGContactName(e.target.value)}
                required
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-zinc-300 uppercase tracking-wider">Contact Phone *</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={gContactPhone}
                onChange={(e) => setGContactPhone(e.target.value)}
                required
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 text-sm text-zinc-100 outline-none font-mono"
              />
            </div>
          </div>

          {/* Rules */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-zinc-300 uppercase tracking-wider">Ground Rules & Regulations *</label>
            <textarea
              rows={3}
              placeholder="1. Spike shoes not allowed&#10;2. Arrive 15 mins prior to slot&#10;3. No smoking"
              value={gRules}
              onChange={(e) => setGRules(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-zinc-100 outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/30 text-rose-500 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : (editingGround ? 'Update Ground Details' : 'Save & Publish Ground')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
