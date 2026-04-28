import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {Colors} from '../constants/theme';
import type {HourlyWeather} from '../services/weatherApi';
import {useSettings} from '../context/SettingsContext';

interface Props {
  hourly: HourlyWeather;
}

// 6시간 간격으로 샘플링 (0, 6, 12, 18시)
const SAMPLE_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export function HourlyChart({hourly}: Props) {
  const {language} = useSettings();
  const points = SAMPLE_HOURS.map(h => ({
    hour: `${String(h).padStart(2, '0')}${language === 'en' ? '' : '시'}`,
    temp: hourly.temperature[h] ?? 0,
    precip: hourly.precipitation[h] ?? 0,
  }));

  const temps = points.map(p => p.temp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const range = maxTemp - minTemp || 1;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}>
      {/* 막대 차트 영역 */}
      <View style={styles.chartArea}>
        {points.map((p, i) => {
          const heightRatio = (p.temp - minTemp) / range;
          const barHeight = 20 + heightRatio * 60;
          return (
            <View key={i} style={styles.column}>
              <Text style={styles.tempLabel}>{p.temp}°</Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, {height: barHeight}]} />
              </View>
              {p.precip > 0 && <Text style={styles.precipDot}>💧</Text>}
              <Text style={styles.hourLabel}>{p.hour}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {paddingHorizontal: 18, paddingBottom: 16},
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    height: 140,
  },
  column: {
    alignItems: 'center',
    gap: 4,
    width: 44,
  },
  tempLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  barTrack: {
    justifyContent: 'flex-end',
    height: 80,
  },
  bar: {
    width: 20,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    opacity: 0.85,
  },
  precipDot: {
    fontSize: 10,
  },
  hourLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
