# QR Attendance

Expo/React Native attendance app using Supabase authentication, PostgreSQL, Row Level Security, event QR generation, camera scanning, and role-aware history.

## Setup

1. Run `npm install`.
2. Copy `.env.example` to `.env` and add the Supabase project URL and anon key.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Start the app with `npm start`.

Teacher accounts can create QR-backed events and review attendees. Student accounts can scan event codes and review their own attendance.
