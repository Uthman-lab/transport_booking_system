// Pure seat-map rules. No I/O — given a capacity and the seats already taken,
// produce the ordered list of seats with availability flags. Kept side-effect
// free so it's trivially unit-testable and reusable on server and client.

export type Seat = {
  number: number;
  isAvailable: boolean;
};

export function buildSeatMap(capacity: number, occupied: number[]): Seat[] {
  const taken = new Set(occupied);
  return Array.from({ length: Math.max(capacity, 0) }, (_, index) => {
    const number = index + 1;
    return { number, isAvailable: !taken.has(number) };
  });
}
