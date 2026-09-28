import { create } from 'zustand';
import type { Rect } from '../../theme/layout.ts';

/** Something flying across the desktop, from one box to another (logical stage pixels). */
export interface Flight {
  id: number;
  from: Rect;
  to: Rect;
  label: string;
  variant: 'option' | 'capture';
  delayMs: number;
  /** Called once, when the chip reaches its target. */
  onLand?: () => void;
}

export interface FlightState {
  flights: Flight[];
  launch: (flight: Omit<Flight, 'id'>) => void;
  land: (id: number) => void;
}

let counter = 0;

export const useFlights = create<FlightState>()((set, get) => ({
  flights: [],
  launch: (flight) => {
    counter += 1;
    set((state) => ({ flights: [...state.flights, { ...flight, id: counter }] }));
  },
  land: (id) => {
    const flight = get().flights.find((f) => f.id === id);
    set((state) => ({ flights: state.flights.filter((f) => f.id !== id) }));
    flight?.onLand?.();
  },
}));
