import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Platform, StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CITIES, City } from '../constants/cities';
import { trackDateChanged } from '../services/amplitude';
import { CitySelector } from '../components/CitySelector';
import { useSettings } from '../context/SettingsContext';
import { Colors } from '../constants/theme';

interface Props {
  onSearch: (city: City, date: Date) => void;
}

export function HomeScreen({ onSearch }: Props) {
  const { t, language, defaultCity } = useSettings();
  const [selectedCity, setSelectedCity] = useState<City>(defaultCity);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - 1);
  const minDate = new Date('1940-01-01');

  function handleDateChange(_: unknown, d?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (d) {
      setDate(d);
      trackDateChanged(d.toISOString().split('T')[0]);
    }
  }

  const formattedDate = date.toLocaleDateString(
    language === 'en' ? 'en-US' : 'ko-KR',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <Text style={styles.title}>{t('home_title')}</Text>
          <Text style={styles.subtitle}>{t('home_subtitle')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('home_city')}</Text>
          <CitySelector selected={selectedCity} onSelect={setSelectedCity} screen="search" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('home_date')}</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowPicker(true)}
            accessibilityRole="button"
          >
            <Text style={styles.dateIcon}>📅</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.dateArrow}>›</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              locale={language === 'en' ? 'en-US' : 'ko-KR'}
              textColor="#FFFFFF"
              themeVariant="dark"
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => onSearch(selectedCity, date)}
          accessibilityRole="button"
        >
          <Text style={styles.searchButtonText}>{t('home_search')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 24, gap: 28 },
  header: { marginTop: 16, gap: 6 },
  title:    { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 15, color: Colors.textSecondary },
  section:  { gap: 12 },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  datePicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 16, borderWidth: 1.5, borderColor: Colors.border, gap: 12,
  },
  dateIcon:  { fontSize: 20 },
  dateText:  { flex: 1, fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  dateArrow: { fontSize: 22, color: Colors.textSecondary },
  searchButton: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  searchButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
