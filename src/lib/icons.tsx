import React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

export type IconName =
  | 'home'
  | 'transactions'
  | 'budget'
  | 'chart'
  | 'profile'
  | 'plus'
  | 'chevron-right'
  | 'chevron-down'
  | 'close'
  | 'check'
  | 'trash'
  | 'edit'
  | 'search'
  | 'filter'
  | 'calendar'
  | 'cash'
  | 'alert'
  | 'target'
  | 'restaurant'
  | 'bus'
  | 'school'
  | 'bag'
  | 'receipt'
  | 'gamepad'
  | 'medkit'
  | 'briefcase'
  | 'wallet'
  | 'dots'
  | 'arrow-up'
  | 'arrow-down';

/**
 * Set ikon line-style sederhana berbasis stroke 24x24.
 * Dipakai lintas aplikasi agar gaya ikon konsisten.
 */
const PATHS: Record<IconName, { d: string[]; circles?: { cx: number; cy: number; r: number }[] }> = {
  home: { d: ['M3 10.5 12 4l9 6.5', 'M5 9.5V20h14V9.5'] },
  transactions: {
    d: ['M7 4h10a2 2 0 0 1 2 2v14l-4-2.5L11 20V6', 'M7 4a2 2 0 0 0-2 2v9'],
    circles: [{ cx: 12, cy: 9, r: 1.4 }],
  },
  budget: { d: ['M4 6h16M4 12h10M4 18h7'] },
  chart: { d: ['M4 20V4', 'M4 20h16', 'M8 17v-5', 'M13 17V8', 'M18 17v-8'] },
  profile: {
    d: ['M5.5 19.5a7 7 0 0 1 13 0'],
    circles: [{ cx: 12, cy: 8.5, r: 3.5 }],
  },
  plus: { d: ['M12 5v14', 'M5 12h14'] },
  'chevron-right': { d: ['m9 5 7 7-7 7'] },
  'chevron-down': { d: ['m5 9 7 7 7-7'] },
  close: { d: ['M6 6l12 12', 'M18 6 6 18'] },
  check: { d: ['m5 13 4 4L19 7'] },
  trash: { d: ['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13', 'M10 11v6M14 11v6'] },
  edit: { d: ['M4 20h4L19 9l-4-4L4 16v4', 'M13 7l4 4'] },
  search: {
    d: ['M20 20l-4-4'],
    circles: [{ cx: 11, cy: 11, r: 6 }],
  },
  filter: { d: ['M4 6h16l-6 7v6l-4-2v-4L4 6z'] },
  calendar: { d: ['M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M4 10h16', 'M8 4v4M16 4v4'] },
  cash: { d: ['M3 7h18v10H3z', 'M16 12a4 4 0 0 1-8 0 4 4 0 0 1 8 0'], circles: [{ cx: 6.5, cy: 12, r: 1 }] },
  alert: { d: ['M12 8v6', 'M12 17.5h.01', 'M10.3 4.6 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0z'] },
  target: {
    d: ['M12 3v3M21 12h-3M12 21v-3M3 12h3'],
    circles: [
      { cx: 12, cy: 12, r: 8 },
      { cx: 12, cy: 12, r: 4 },
    ],
  },
  restaurant: { d: ['M7 4v7a2.5 2.5 0 0 0 5 0V4', 'M9.5 11v9', 'M17 4c1.5 0 2.5 1 2.5 2.5S18.5 9 17 9v11'] },
  bus: { d: ['M5 5h14v10H5z', 'M5 15v3M19 15v3', 'M5 10h14', 'M8 18v1.5M16 18v1.5'], circles: [{ cx: 8, cy: 12.5, r: 1 }, { cx: 16, cy: 12.5, r: 1 }] },
  school: { d: ['m12 4 10 5-10 5L2 9z', 'M7 11.5V17c0 1.7 2.2 3 5 3s5-1.3 5-3v-5.5'] },
  bag: { d: ['M6 8h12l1 12H5L6 8', 'M9 8V6a3 3 0 0 1 6 0v2'] },
  receipt: { d: ['M6 3h12v18l-2.4-1.6L13 21l-1-1.6L11 21l-2.6-1.6L6 21V3z', 'M9 8h6M9 12h6'] },
  gamepad: { d: ['M7 12h2M8 11v2', 'M15.5 13h.01M17.5 11h.01', 'M6 8h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5 2.2L15.5 15h-7L7 16.2a3 3 0 0 1-5-2.2v-2a4 4 0 0 1 4-4z'] },
  medkit: { d: ['M4 8h16v11H4z', 'M9 8V5h6v3', 'M12 11v5', 'M9.5 13.5h5'] },
  briefcase: { d: ['M4 8h16v11H4z', 'M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8', 'M4 12h16'] },
  wallet: { d: ['M4 7h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z', 'M19 11h2v4h-2', 'M4 7a1.8 1.8 0 0 1 1.8-1.8H15'], circles: [{ cx: 15.5, cy: 13, r: 0.8 }] },
  dots: {
    d: [],
    circles: [
      { cx: 5, cy: 12, r: 1.4 },
      { cx: 12, cy: 12, r: 1.4 },
      { cx: 19, cy: 12, r: 1.4 },
    ],
  },
  'arrow-up': { d: ['M12 19V5', 'm6 11 6-6 6 6'] },
  'arrow-down': { d: ['M12 5v14', 'm18 13-6 6-6-6'] },
};

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: object;
};

export function Icon({ name, size = 20, color = '#0B1526', strokeWidth = 1.8, style }: IconProps) {
  const shape = PATHS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {shape.d.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {(shape.circles ?? []).map((c, i) => (
        <Circle key={`c${i}`} cx={c.cx} cy={c.cy} r={c.r} stroke={color} strokeWidth={strokeWidth} />
      ))}
    </Svg>
  );
}
