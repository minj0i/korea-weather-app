import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Platform, StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CITIES, City } from '../constants/cities';
import { trackCitySelected, trackDateChanged } from '../services/amplitude';
import { Colors, Typography } from '../constants/theme';

interface Props {
  onSearch: (city: City, date: Date) => void;
}

export function HomeScreen({ onSearch }: Props) {
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - 1); // 어제까지만 조회 가능

  const minDate = new Date('1940-01-01');

  function handleCitySelect(city: City) {
    setSelectedCity(city);
    trackCitySelected(city.name);
  }

  function handleDateChange(_: unknown, d?: Date) {
    setShowPicker(Platform.OS === 'ios');
    if (d) {
      setDate(d);
      trackDateChanged(d.toISOString().split('T')[0]);
    }
  }

  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>

        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>🌤 과거 날씨</Text>
          <Text style={styles.subtitle}>대한민국 과거 날씨를 검색해보세요</Text>
        </View>

        {/* 도시 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>도시 선택</Text>
          <View style={styles.cityGrid}>
            {CITIES.map(city => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.cityChip,
                  selectedCity.id === city.id && styles.cityChipActive,
                ]}
                onPress={() => handleCitySelect(city)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCity.id === city.id }}
              >
                <Text style={[
                  styles.cityChipText,
                  selectedCity.id === city.id && styles.cityChipTextActive,
                ]}>
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 날짜 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>날짜 선택</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowPicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`날짜 선택: ${formattedDate}`}
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
              locale="ko-KR"
            />
          )}
        </View>

        {/* 조회 버튼 */}
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => onSearch(selectedCity, date)}
          accessibilityRole="button"
        >
          <Text style={styles.searchButtonText}>날씨 조회하기</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    gap: 28,
  },
  header: {
    marginTop: 16,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  cityChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  dateIcon: {
    fontSize: 20,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  dateArrow: {
    fontSize: 22,
    color: Colors.textSecondary,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
