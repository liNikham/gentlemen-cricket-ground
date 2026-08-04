# Updated Add/Edit Ground Form: Slot-Specific Morning & Evening Pricing

The **Add / Edit Cricket Ground Form** ([GroundModal.tsx](file:///c:/Users/91820/Documents/gentlemen-cricket-ground/frontend/src/components/grounds/GroundModal.tsx)) has been updated with high-visibility, dedicated configuration blocks for setting different prices for Morning and Evening slots:

---

## 🌅 Morning Slot Configuration Block
- **Morning Slot Timing** (e.g. `7:00 AM - 10:30 AM`)
- **Morning Weekday Rate (₹)** (e.g. `₹1,500`)
- **Morning Weekend Rate (₹)** (e.g. `₹2,500`)

---

## 🌇 Afternoon / Evening Slot Configuration Block
- **Evening Slot Timing** (e.g. `2:30 PM - 5:50 PM`)
- **Evening Weekday Rate (₹)** (e.g. `₹1,800`)
- **Evening Weekend Rate (₹)** (e.g. `₹2,800`)

---

## 🎯 Features & Benefits
1. **Independent Pricing**: Admins can set lower rates for morning slots and higher prime rates for evening floodlit slots.
2. **Day Classification**: Handles distinct pricing for Weekday vs. Weekend on both Morning and Evening slots.
3. **Instant Sync**: Submitting the form updates both local frontend state and backend API payloads.
