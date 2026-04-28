import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Linking,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { CitySelector } from '../components/CitySelector';
import { Colors } from '../constants/theme';
import { trackTabViewed } from '../services/amplitude';

const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const { t, language, setLanguage, tempUnit, setTempUnit, defaultCity, setDefaultCity } = useSettings();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>{t('settings_title')}</Text>
        </View>

        {/* ── 표시 설정 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings_section_display')}</Text>

          <View style={styles.card}>
            {/* 언어 */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('settings_language')}</Text>
              <View style={styles.segmentGroup}>
                <TouchableOpacity
                  style={[styles.segment, language === 'ko' && styles.segmentActive]}
                  onPress={() => setLanguage('ko')}
                >
                  <Text style={[styles.segmentText, language === 'ko' && styles.segmentTextActive]}>
                    {t('settings_language_ko')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, language === 'en' && styles.segmentActive]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.segmentText, language === 'en' && styles.segmentTextActive]}>
                    {t('settings_language_en')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* 온도 단위 */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('settings_temp_unit')}</Text>
              <View style={styles.segmentGroup}>
                <TouchableOpacity
                  style={[styles.segment, tempUnit === 'C' && styles.segmentActive]}
                  onPress={() => setTempUnit('C')}
                >
                  <Text style={[styles.segmentText, tempUnit === 'C' && styles.segmentTextActive]}>
                    °C
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, tempUnit === 'F' && styles.segmentActive]}
                  onPress={() => setTempUnit('F')}
                >
                  <Text style={[styles.segmentText, tempUnit === 'F' && styles.segmentTextActive]}>
                    °F
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── 일반 설정 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings_section_general')}</Text>

          <View style={styles.card}>
            <Text style={styles.rowLabel}>{t('settings_default_city')}</Text>
            <View style={{ marginTop: 12 }}>
              <CitySelector
                selected={defaultCity}
                onSelect={setDefaultCity}
                screen="search"
              />
            </View>
          </View>
        </View>

        {/* ── 앱 정보 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings_section_about')}</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('settings_version')}</Text>
              <Text style={styles.rowValue}>{APP_VERSION}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.rowLabel}>{t('settings_data_source')}</Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://open-meteo.com')}>
                <Text style={styles.rowLink}>Open-Meteo ↗</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {/* 미리보기: 온도 변환 */}
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>
            {language === 'ko' ? '온도 표시 미리보기' : 'Temperature Preview'}
          </Text>
          <View style={styles.previewRow}>
            {[-10, 0, 15, 25, 35].map(c => (
              <View key={c} style={styles.previewItem}>
                <Text style={styles.previewCelsius}>{c}°C</Text>
                <Text style={styles.previewArrow}>↓</Text>
                <Text style={styles.previewConverted}>
                  {tempUnit === 'F' ? `${Math.round(c * 9 / 5 + 32)}°F` : `${c}°C`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, gap: 20 },
  header: { marginTop: 8 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary },

  section: { gap: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.5, textTransform: 'uppercase',
    paddingLeft: 4,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 0,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 14 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  rowValue: { fontSize: 14, color: Colors.textSecondary },
  rowLink:  { fontSize: 14, color: Colors.primaryLight, fontWeight: '500' },

  segmentGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segment: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  segmentActive: { backgroundColor: Colors.primary },
  segmentText:       { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: '#fff' },

  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  previewLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  previewRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  previewItem:  { alignItems: 'center', gap: 4 },
  previewCelsius:   { fontSize: 11, color: Colors.textSecondary },
  previewArrow:     { fontSize: 10, color: Colors.border },
  previewConverted: { fontSize: 13, fontWeight: '700', color: Colors.accent },
});
