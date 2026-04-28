import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CITIES, City } from '../constants/cities';
import { trackCitySelected } from '../services/amplitude';
import { Colors } from '../constants/theme';

// 기본 노출: 서울 + 6대 광역시 + 제주
const DEFAULT_CITY_IDS = [
  'seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan', 'jeju',
];

const DEFAULT_CITIES = CITIES.filter(c => DEFAULT_CITY_IDS.includes(c.id));
const MORE_CITIES    = CITIES.filter(c => !DEFAULT_CITY_IDS.includes(c.id));

interface Props {
  selected: City;
  onSelect: (city: City) => void;
}

export function CitySelector({ selected, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleCities = expanded ? [...DEFAULT_CITIES, ...MORE_CITIES] : DEFAULT_CITIES;

  function handleSelect(city: City) {
    onSelect(city);
    trackCitySelected(city.name);
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {visibleCities.map(city => (
          <TouchableOpacity
            key={city.id}
            style={[styles.chip, selected.id === city.id && styles.chipActive]}
            onPress={() => handleSelect(city)}
            accessibilityRole="button"
            accessibilityState={{ selected: selected.id === city.id }}
          >
            <Text style={[styles.chipText, selected.id === city.id && styles.chipTextActive]}>
              {city.name}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => setExpanded(prev => !prev)}
          accessibilityRole="button"
        >
          <Text style={styles.moreBtnText}>
            {expanded ? '▲ 접기' : '＋ 더보기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  moreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  moreBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
