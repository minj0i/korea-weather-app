import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { fetchHistoricalWeather, WeatherResult, WMO_CODES } from '../services/weatherApi';
import { Colors } from '../constants/theme';
import { trackCompareTapped } from '../services/amplitude';
import type { City } from '../constants/cities';

interface Props {
  city: City;
  date: Date;        // 사용자가 선택한 과거 날짜
  onBack: () => void;
}

// 같은 월/일 기준으로 비교할 "올해(혹은 작년)" 날짜 계산
function getCompareDate(original: Date): Date {
  const today = new Date();
  const candidate = new Date(today.getFullYear(), original.getMonth(), original.getDate());
  // 아직 올해 해당 날짜가 안 지났으면 작년으로
  if (candidate >= today) {
    candidate.setFullYear(candidate.getFullYear() - 1);
  }
  return candidate;
}

interface CompareData {
  past: WeatherResult;
  recent: WeatherResult;
}

function DiffBadge({ past, recent }: { past: number; recent: number }) {
  const diff = +(recent - past).toFixed(1);
  if (diff === 0) return <Text style={styles.diffNeutral}>─</Text>;
  const up = diff > 0;
  return (
    <Text style={up ? styles.diffUp : styles.diffDown}>
      {up ? '▲' : '▼'} {Math.abs(diff)}
    </Text>
  );
}

function CompareRow({
  label,
  icon,
  pastVal,
  recentVal,
  unit,
}: {
  label: string;
  icon: string;
  pastVal: number;
  recentVal: number;
  unit: string;
}) {
  return (
    <View style={styles.compareRow}>
      <Text style={styles.compareRowPast}>{pastVal}{unit}</Text>
      <View style={styles.compareRowMid}>
        <Text style={styles.compareRowIcon}>{icon}</Text>
        <Text style={styles.compareRowLabel}>{label}</Text>
        <DiffBadge past={pastVal} recent={recentVal} />
      </View>
      <Text style={styles.compareRowRecent}>{recentVal}{unit}</Text>
    </View>
  );
}

export function CompareScreen({ city, date, onBack }: Props) {
  const [result, setResult] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const compareDate = getCompareDate(date);

  const pastLabel = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const recentLabel = compareDate.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [past, recent] = await Promise.all([
        fetchHistoricalWeather(city.lat, city.lon, date),
        fetchHistoricalWeather(city.lat, city.lon, compareDate),
      ]);
      setResult({ past, recent });
      trackCompareTapped(city.name, past.daily.date);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [city, date]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>두 날짜 데이터를 불러오는 중…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error ?? '데이터를 찾을 수 없어요'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { past, recent } = result;
  const pastWmo = WMO_CODES[past.daily.weatherCode] ?? { label: '알 수 없음', icon: '🌡' };
  const recentWmo = WMO_CODES[recent.daily.weatherCode] ?? { label: '알 수 없음', icon: '🌡' };
  const pastAvgHumidity = Math.round(
    past.hourly.humidity.reduce((a, b) => a + b, 0) / past.hourly.humidity.length,
  );
  const recentAvgHumidity = Math.round(
    recent.hourly.humidity.reduce((a, b) => a + b, 0) / recent.hourly.humidity.length,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* 네비 */}
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>돌아가기</Text>
        </TouchableOpacity>

        {/* 제목 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>📊 날씨 비교</Text>
          <Text style={styles.subtitle}>{city.name} · 같은 날 비교</Text>
        </View>

        {/* 날짜 헤더 */}
        <View style={styles.dateHeader}>
          <View style={styles.dateHeaderCol}>
            <Text style={styles.dateHeaderYear}>{date.getFullYear()}년</Text>
            <Text style={styles.dateHeaderMd}>
              {date.getMonth() + 1}월 {date.getDate()}일
            </Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={[styles.dateHeaderCol, { alignItems: 'flex-end' }]}>
            <Text style={styles.dateHeaderYear}>{compareDate.getFullYear()}년</Text>
            <Text style={styles.dateHeaderMd}>
              {compareDate.getMonth() + 1}월 {compareDate.getDate()}일
            </Text>
          </View>
        </View>

        {/* 날씨 아이콘 비교 */}
        <View style={styles.iconRow}>
          <View style={styles.iconCol}>
            <Text style={styles.weatherIcon}>{pastWmo.icon}</Text>
            <Text style={styles.weatherLabel}>{pastWmo.label}</Text>
          </View>
          <View style={styles.iconCol}>
            <Text style={styles.weatherIcon}>{recentWmo.icon}</Text>
            <Text style={styles.weatherLabel}>{recentWmo.label}</Text>
          </View>
        </View>

        {/* 지표 비교 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>상세 비교</Text>

          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardColLabel}>{date.getFullYear()}</Text>
            <View style={styles.cardColMid} />
            <Text style={styles.cardColLabel}>{compareDate.getFullYear()}</Text>
          </View>

          <View style={styles.divider} />

          <CompareRow
            icon="🌡" label="최고 기온"
            pastVal={past.daily.tempMax}
            recentVal={recent.daily.tempMax}
            unit="°"
          />
          <CompareRow
            icon="🌡" label="최저 기온"
            pastVal={past.daily.tempMin}
            recentVal={recent.daily.tempMin}
            unit="°"
          />
          <CompareRow
            icon="💧" label="강수량"
            pastVal={past.daily.precipitation}
            recentVal={recent.daily.precipitation}
            unit="mm"
          />
          <CompareRow
            icon="💨" label="최대 풍속"
            pastVal={past.daily.windspeedMax}
            recentVal={recent.daily.windspeedMax}
            unit="km/h"
          />
          <CompareRow
            icon="🌊" label="평균 습도"
            pastVal={pastAvgHumidity}
            recentVal={recentAvgHumidity}
            unit="%"
          />
        </View>

        {/* 한줄 요약 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>한줄 요약</Text>
          <Text style={styles.summaryText}>
            {recent.daily.tempMax > past.daily.tempMax
              ? `${compareDate.getFullYear()}년이 ${(recent.daily.tempMax - past.daily.tempMax).toFixed(1)}° 더 더웠어요 🥵`
              : recent.daily.tempMax < past.daily.tempMax
              ? `${date.getFullYear()}년이 ${(past.daily.tempMax - recent.daily.tempMax).toFixed(1)}° 더 더웠어요 🥵`
              : '두 해 최고 기온이 같아요 😲'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, gap: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },
  errorIcon: { fontSize: 40 },
  errorText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  retryText: { color: '#fff', fontWeight: '600' },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  backIcon: { fontSize: 26, color: Colors.primary, lineHeight: 30 },
  backText: { fontSize: 15, color: Colors.primary, fontWeight: '500' },

  titleSection: { gap: 4 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary },

  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateHeaderCol: { flex: 1 },
  dateHeaderYear: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  dateHeaderMd: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  vsText: {
    fontSize: 16, fontWeight: '800',
    color: Colors.primary,
    paddingHorizontal: 16,
  },

  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCol: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weatherIcon: { fontSize: 44 },
  weatherLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardColLabel: {
    flex: 1, fontSize: 13, fontWeight: '700',
    color: Colors.textSecondary, textAlign: 'center',
  },
  cardColMid: { flex: 1.2 },
  divider: { height: 1, backgroundColor: Colors.border },

  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareRowPast: {
    flex: 1, fontSize: 16, fontWeight: '700',
    color: Colors.accent, textAlign: 'center',
  },
  compareRowMid: {
    flex: 1.2, alignItems: 'center', gap: 2,
  },
  compareRowIcon: { fontSize: 18 },
  compareRowLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  compareRowRecent: {
    flex: 1, fontSize: 16, fontWeight: '700',
    color: Colors.primaryLight, textAlign: 'center',
  },
  diffUp:      { fontSize: 11, color: Colors.danger,   fontWeight: '700' },
  diffDown:    { fontSize: 11, color: Colors.primary,  fontWeight: '700' },
  diffNeutral: { fontSize: 11, color: Colors.textSecondary },

  summaryCard: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  summaryText:  { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, lineHeight: 22 },
});
