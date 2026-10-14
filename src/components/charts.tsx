import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface CashflowPoint {
  label: string;
  income: number;
  expense: number;
}

/** Diagram batang arus kas (pemasukan vs pengeluaran). */
export function CashflowBars({ data }: { data: CashflowPoint[] }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <View style={styles.chartRows}>
      {data.map((point, index) => (
        <View key={`${point.label}-${index}`} style={styles.barColumnWrap}>
          <View style={styles.barsPair}>
            <Bar
              ratio={point.income / max}
              color={theme.income}
              label={null}
            />
            <Bar
              ratio={point.expense / max}
              color={theme.expense}
              label={null}
            />
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            {point.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function Bar({ ratio, color }: { ratio: number; color: string; label: null }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.max(ratio, 0.02), { duration: 500 });
  }, [ratio, progress]);
  const style = useAnimatedStyle(() => ({ flexGrow: progress.value }));

  const minHeight = 4;
  return (
    <View style={styles.barOuter}>
      <Animated.View style={[styles.barFill, { backgroundColor: color, minHeight }, style]} />
    </View>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/** Donut chart distribusi pengeluaran per kategori (SVG). */
export function CategoryDonut({ slices }: { slices: DonutSlice[] }) {
  const size = 148;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total <= 0) {
    return null;
  }

  // Hitung offset tiap segmen sebelum render (imutabel, tanpa re-assign luar).
  interface Segment {
    slice: DonutSlice;
    dash: number;
    dashOffset: number;
  }
  const segments: Segment[] = slices.reduce<Segment[]>((acc, slice) => {
    const last = acc[acc.length - 1];
    const start = last ? last.dashOffset + last.dash : 0;
    const dash = (slice.value / total) * circumference;
    return [...acc, { slice, dash, dashOffset: start }];
  }, []);

  return (
    <View style={styles.donutRow}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(128,128,128,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map(({ slice, dash, dashOffset }) => (
          <Circle
            key={slice.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-dashOffset}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
      </Svg>
      <View style={styles.legend}>
        {slices.map((slice) => (
          <View key={slice.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <ThemedText type="caption" themeColor="textSecondary" style={styles.legendLabel} numberOfLines={1}>
              {slice.label}
            </ThemedText>
            <ThemedText type="caption" style={styles.legendValue}>
              {Math.round((slice.value / total) * 100)}%
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Batang perbandingan bulanan pemasukan vs pengeluaran. */
export function MonthlyCompare({ data }: { data: CashflowPoint[] }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));

  return (
    <View style={styles.monthlyWrap}>
      {data.map((point) => (
        <View key={point.label} style={styles.monthlyColumn}>
          <View style={styles.monthlyBars}>
            <Bar ratio={point.income / max} color={theme.income} label={null} />
            <Bar ratio={point.expense / max} color={theme.expense} label={null} />
          </View>
          <ThemedText type="caption" themeColor="textSecondary" style={styles.monthlyLabel}>
            {point.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chartRows: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barColumnWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barsPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 120,
    alignSelf: 'stretch',
  },
  barOuter: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
  },
  legendValue: {
    fontVariant: ['tabular-nums'],
  },
  monthlyWrap: {
    flexDirection: 'row',
    gap: 12,
  },
  monthlyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  monthlyBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 110,
    alignSelf: 'stretch',
  },
  monthlyLabel: {
    fontVariant: ['tabular-nums'],
  },
});
