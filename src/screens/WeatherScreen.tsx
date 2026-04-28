import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Share,
} from 'react-native';
import {
  fetchHistoricalWeather,
  WeatherResult,
  WMO_CODES,
} from '../services/weatherApi';
import {HourlyChart} from '../components/HourlyChart';
import {StatCard} from '../components/StatCard';
import {Colors} from '../constants/theme';
import {
  trackWeatherSearch,
  trackHourlyExpanded,
  trackCompareTapped,
  trackWeatherShared,
} from '../services/amplitude';
import {useSettings} from '../context/SettingsContext';
import type {City} from '../constants/cities';

interface Props {
  city: City;
  date: Date;
  onBack: () => void;
  onCompare: () => void;
}

export function WeatherScreen({city, date, onBack, onCompare}: Props) {
  const {t, language, formatTemp} = useSettings();
  const [data, setData] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHourly, setShowHourly] = useState(false);

  const dateStr = date.toLocaleDateString(
    language === 'en' ? 'en-US' : 'ko-KR',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    },
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHistoricalWeather(city.lat, city.lon, date);
      setData(result);
      trackWeatherSearch(
        city.name,
        result.daily.date,
        result.daily.weatherCode,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [city, date]);

  useEffect(() => {
    load();
  }, [load]);

  function handleHourlyToggle() {
    const next = !showHourly;
    setShowHourly(next);
    if (next) trackHourlyExpanded(city.name, data?.daily.date ?? '');
  }

  async function handleShare() {
    if (!data) return;
    const _shareWmo = WMO_CODES[data.daily.weatherCode];
    const shareLabel = _shareWmo
      ? (language === 'en' ? _shareWmo.labelEn : _shareWmo.label)
      : (language === 'en' ? 'Unknown' : '알 수 없음');
    const shareIcon = _shareWmo?.icon ?? '🌡';
    const shareCityName = language === 'en' ? city.nameEn : city.name;
    const highLabel = language === 'en' ? 'High' : '최고';
    const lowLabel  = language === 'en' ? 'Low'  : '최저';
    const rainLabel = language === 'en' ? 'Rain' : '강수';
    await Share.share({
      message: `${shareCityName} ${dateStr}\n${shareIcon} ${shareLabel}\n${highLabel} ${data.daily.tempMax}°C / ${lowLabel} ${data.daily.tempMin}°C\n${rainLabel} ${data.daily.precipitation}mm`,
    });
    trackWeatherShared(city.name, data.daily.date);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('weather_loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error ?? t('weather_error')}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>{t('weather_retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const _wmo = WMO_CODES[data.daily.weatherCode];
  const wmo = {
    icon:  _wmo?.icon  ?? '🌡',
    label: _wmo ? (language === 'en' ? _wmo.labelEn : _wmo.label) : (language === 'en' ? 'Unknown' : '알 수 없음'),
  };
  const avgHumidity = Math.round(
    data.hourly.humidity.reduce((a, b) => a + b, 0) /
      data.hourly.humidity.length,
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* 상단 네비 */}
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button">
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>{t('weather_back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareBtn}
            accessibilityRole="button">
            <Text style={styles.shareIcon}>⬆</Text>
          </TouchableOpacity>
        </View>

        {/* 히어로 카드 */}
        <View style={styles.heroCard}>
          <Text style={styles.heroCity}>
            {language === 'en' ? city.nameEn : city.name}
          </Text>
          <Text style={styles.heroDate}>{dateStr}</Text>
          <Text style={styles.heroIcon}>{wmo.icon}</Text>
          <Text style={styles.heroLabel}>{wmo.label}</Text>
          <View style={styles.heroTempRow}>
            <Text style={styles.heroTempMax}>{data.daily.tempMax}°</Text>
            <Text style={styles.heroTempSep}>/</Text>
            <Text style={styles.heroTempMin}>{data.daily.tempMin}°</Text>
          </View>
        </View>

        {/* 상세 지표 */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="💧"
            label={t('weather_precipitation')}
            value={`${data.daily.precipitation} mm`}
          />
          <StatCard
            icon="💨"
            label={t('weather_wind')}
            value={`${data.daily.windspeedMax} km/h`}
          />
          <StatCard
            icon="🌊"
            label={t('weather_humidity')}
            value={`${avgHumidity}%`}
          />
          <StatCard
            icon="🌡"
            label={t('weather_temp_diff')}
            value={`${(data.daily.tempMax - data.daily.tempMin).toFixed(1)}°C`}
          />
        </View>

        {/* 시간별 기온 */}
        <View style={styles.chartSection}>
          <TouchableOpacity
            style={styles.chartHeader}
            onPress={handleHourlyToggle}>
            <Text style={styles.chartTitle}>{t('weather_hourly')}</Text>
            <Text style={styles.chartToggle}>{showHourly ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showHourly && <HourlyChart hourly={data.hourly} />}
        </View>

        {/* 오늘과 비교 CTA */}
        <TouchableOpacity style={styles.compareBtn} onPress={onCompare}>
          <Text style={styles.compareBtnText}>{t('weather_compare')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: Colors.background},
  container: {padding: 20, gap: 20, paddingBottom: 40},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16},
  loadingText: {color: Colors.textSecondary, fontSize: 15},
  errorIcon: {fontSize: 40},
  errorText: {color: Colors.textSecondary, fontSize: 15, textAlign: 'center'},
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {color: '#fff', fontWeight: '600'},

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {flexDirection: 'row', alignItems: 'center', gap: 4},
  backIcon: {fontSize: 26, color: Colors.primary, lineHeight: 30},
  backText: {fontSize: 15, color: Colors.primary, fontWeight: '500'},
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {fontSize: 16, color: Colors.textPrimary},

  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCity: {fontSize: 22, fontWeight: '700', color: Colors.textPrimary},
  heroDate: {fontSize: 13, color: Colors.textSecondary},
  heroIcon: {fontSize: 64, marginVertical: 8},
  heroLabel: {fontSize: 18, color: Colors.textSecondary, fontWeight: '500'},
  heroTempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  heroTempMax: {fontSize: 48, fontWeight: '800', color: Colors.accent},
  heroTempSep: {fontSize: 28, color: Colors.textSecondary},
  heroTempMin: {fontSize: 36, fontWeight: '600', color: Colors.primaryLight},

  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},

  chartSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  chartTitle: {fontSize: 16, fontWeight: '600', color: Colors.textPrimary},
  chartToggle: {fontSize: 14, color: Colors.textSecondary},

  compareBtn: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compareBtnText: {fontSize: 15, fontWeight: '600', color: Colors.primaryLight},
});
