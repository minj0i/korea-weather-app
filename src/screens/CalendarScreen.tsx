import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { CITIES, City } from '../constants/cities';
import { fetchHistoricalWeather, WMO_CODES } from '../services/weatherApi';
import { CitySelector } from '../components/CitySelector';
import { Colors } from '../constants/theme';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

interface DayData {
  date: number;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function CalendarScreen() {
  const today = new Date();
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
  const [year, setYear]   = useState(today.getFullYear() - 1);
  const [month, setMonth] = useState(today.getMonth());
  const [dayDataMap, setDayDataMap] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const monthLabel = new Date(year, month).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long',
  });

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  // 한 달치 데이터 한 번에 fetch
  const loadMonth = useCallback(async () => {
    setLoading(true);
    setSelectedDay(null);
    const startDate = formatDate(year, month, 1);
    const endDate   = formatDate(year, month, daysInMonth);

    try {
      const { default: weatherApi } = await import('../services/weatherApi');
      const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';
      const params = new URLSearchParams({
        latitude:  selectedCity.lat.toString(),
        longitude: selectedCity.lon.toString(),
        start_date: startDate,
        end_date:   endDate,
        daily: [
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'weathercode',
        ].join(','),
        timezone: 'Asia/Seoul',
      });

      const res  = await fetch(`${BASE_URL}?${params}`);
      const json = await res.json();

      const map: Record<string, DayData> = {};
      json.daily.time.forEach((dateStr: string, i: number) => {
        const day = parseInt(dateStr.split('-')[2], 10);
        map[dateStr] = {
          date:          day,
          weatherCode:   json.daily.weathercode[i],
          tempMax:       json.daily.temperature_2m_max[i],
          tempMin:       json.daily.temperature_2m_min[i],
          precipitation: json.daily.precipitation_sum[i],
        };
      });
      setDayDataMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, year, month]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const next = new Date(year, month + 1);
    if (next >= today) return; // 미래 월 이동 불가
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // 월 통계
  const allDays = Object.values(dayDataMap);
  const monthMaxTemp   = allDays.length ? Math.max(...allDays.map(d => d.tempMax)) : null;
  const monthTotalRain = allDays.length ? +allDays.reduce((s, d) => s + d.precipitation, 0).toFixed(1) : null;
  const sunnyDays      = allDays.filter(d => d.weatherCode <= 2).length;

  // 달력 셀 배열 (빈 칸 + 날짜)
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // 7의 배수로 맞추기
  while (cells.length % 7 !== 0) cells.push(null);

  const isNextDisabled = new Date(year, month + 1) >= today;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>📅 월간 달력</Text>
        </View>

        {/* 도시 선택 */}
        <CitySelector selected={selectedCity} onSelect={setSelectedCity} />

        {/* 월 이동 */}
        <View style={styles.monthNav}>
          <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <TouchableOpacity
            style={[styles.navBtn, isNextDisabled && styles.navBtnDisabled]}
            onPress={nextMonth}
            disabled={isNextDisabled}
          >
            <Text style={[styles.navBtnText, isNextDisabled && styles.navBtnTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 달력 그리드 */}
        <View style={styles.calCard}>
          {/* 요일 헤더 */}
          <View style={styles.dowRow}>
            {DAYS_OF_WEEK.map((d, i) => (
              <Text key={d} style={[
                styles.dowText,
                i === 0 && styles.dowSun,
                i === 6 && styles.dowSat,
              ]}>{d}</Text>
            ))}
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            // 주 단위로 렌더링
            Array.from({ length: cells.length / 7 }, (_, week) => (
              <View key={week} style={styles.weekRow}>
                {cells.slice(week * 7, week * 7 + 7).map((day, col) => {
                  if (!day) return <View key={col} style={styles.emptyCell} />;
                  const key  = formatDate(year, month, day);
                  const data = dayDataMap[key];
                  const wmo  = data ? WMO_CODES[data.weatherCode] : null;
                  const isSelected = selectedDay?.date === day;

                  return (
                    <TouchableOpacity
                      key={col}
                      style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                      onPress={() => setSelectedDay(data ?? null)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dayNum,
                        col === 0 && styles.daySun,
                        col === 6 && styles.daySat,
                        isSelected && styles.dayNumSelected,
                      ]}>{day}</Text>
                      {wmo && <Text style={styles.weatherIcon}>{wmo.icon}</Text>}
                      {data && <>
                        <Text style={[styles.tempMax, isSelected && styles.tempSelected]}>
                          {data.tempMax}°
                        </Text>
                        <Text style={[styles.tempMin, isSelected && styles.tempSelected]}>
                          {data.tempMin}°
                        </Text>
                      </>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </View>

        {/* 선택된 날 상세 */}
        {selectedDay && (() => {
          const wmo = WMO_CODES[selectedDay.weatherCode] ?? { icon: '🌡', label: '알 수 없음' };
          const dateLabel = new Date(year, month, selectedDay.date)
            .toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
          return (
            <View style={styles.detailCard}>
              <Text style={styles.detailIcon}>{wmo.icon}</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailDate}>{dateLabel}</Text>
                <Text style={styles.detailLabel}>{wmo.label}</Text>
                <Text style={styles.detailSub}>
                  강수 {selectedDay.precipitation}mm
                </Text>
              </View>
              <View style={styles.detailTemp}>
                <Text style={styles.detailMax}>{selectedDay.tempMax}°</Text>
                <Text style={styles.detailMin}>{selectedDay.tempMin}°</Text>
              </View>
            </View>
          );
        })()}

        {/* 월 요약 */}
        {!loading && allDays.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>🌡</Text>
              <Text style={styles.summaryValue}>{monthMaxTemp}°</Text>
              <Text style={styles.summaryLabel}>월 최고</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>💧</Text>
              <Text style={styles.summaryValue}>{monthTotalRain}mm</Text>
              <Text style={styles.summaryLabel}>월 강수량</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>☀️</Text>
              <Text style={styles.summaryValue}>{sunnyDays}일</Text>
              <Text style={styles.summaryLabel}>맑은 날</Text>
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, gap: 16 },
  header: { marginTop: 8 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  navBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { fontSize: 20, color: Colors.textPrimary, lineHeight: 24 },
  navBtnTextDisabled: { color: Colors.textSecondary },
  monthLabel: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  calCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
    gap: 4,
  },
  dowRow: { flexDirection: 'row', marginBottom: 4 },
  dowText: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  dowSun: { color: '#ef4444' },
  dowSat: { color: Colors.primaryLight },

  loadingBox: { height: 160, alignItems: 'center', justifyContent: 'center' },

  weekRow: { flexDirection: 'row', gap: 3 },
  emptyCell: { flex: 1, minHeight: CELL_SIZE },
  dayCell: {
    flex: 1, minHeight: CELL_SIZE,
    backgroundColor: Colors.background,
    borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, gap: 1,
  },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayNum: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary, alignSelf: 'flex-end', paddingRight: 3, width: '100%', textAlign: 'right' },
  daySun: { color: '#ef4444' },
  daySat: { color: Colors.primaryLight },
  dayNumSelected: { color: '#fff' },
  weatherIcon: { fontSize: 14 },
  tempMax: { fontSize: 10, fontWeight: '700', color: Colors.accent },
  tempMin: { fontSize: 9,  fontWeight: '500', color: Colors.primaryLight },
  tempSelected: { color: 'rgba(255,255,255,0.9)' },

  detailCard: {
    backgroundColor: '#1E3A5F', borderRadius: 16,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: '#2563eb',
  },
  detailIcon:  { fontSize: 36 },
  detailInfo:  { flex: 1, gap: 3 },
  detailDate:  { fontSize: 11, color: '#93C5FD', fontWeight: '600' },
  detailLabel: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  detailSub:   { fontSize: 11, color: Colors.textSecondary },
  detailTemp:  { alignItems: 'flex-end', gap: 2 },
  detailMax:   { fontSize: 22, fontWeight: '800', color: Colors.accent },
  detailMin:   { fontSize: 15, fontWeight: '600', color: Colors.primaryLight },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  summaryItem:  { flex: 1, alignItems: 'center', gap: 4 },
  summaryIcon:  { fontSize: 20 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary },
});
