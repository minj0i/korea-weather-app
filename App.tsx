import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';
import { CompareScreen } from './src/screens/CompareScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { initAmplitude } from './src/services/amplitude';
import { Colors } from './src/constants/theme';
import type { City } from './src/constants/cities';

type Tab    = 'search' | 'calendar';
type Screen = 'home' | 'weather' | 'compare';

interface WeatherParams {
  city: City;
  date: Date;
}

export default function App() {
  const [tab, setTab]       = useState<Tab>('search');
  const [screen, setScreen] = useState<Screen>('home');
  const [params, setParams] = useState<WeatherParams | null>(null);

  useEffect(() => { initAmplitude(); }, []);

  function handleSearch(city: City, date: Date) {
    setParams({ city, date });
    setScreen('weather');
  }

  // 날씨 결과 / 비교 화면은 탭바 없이 풀스크린
  if (screen === 'compare' && params) {
    return (
      <CompareScreen
        city={params.city}
        date={params.date}
        onBack={() => setScreen('weather')}
      />
    );
  }
  if (screen === 'weather' && params) {
    return (
      <WeatherScreen
        city={params.city}
        date={params.date}
        onBack={() => setScreen('home')}
        onCompare={() => setScreen('compare')}
      />
    );
  }

  // 탭바가 있는 메인 화면
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        {tab === 'search'
          ? <HomeScreen onSearch={handleSearch} />
          : <CalendarScreen />
        }
      </View>

      {/* 하단 탭바 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => { setTab('search'); setScreen('home'); }}
          accessibilityRole="button"
        >
          <Text style={styles.tabIcon}>{tab === 'search' ? '🔍' : '🔎'}</Text>
          <Text style={[styles.tabText, tab === 'search' && styles.tabTextActive]}>
            날짜 조회
          </Text>
          {tab === 'search' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setTab('calendar')}
          accessibilityRole="button"
        >
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={[styles.tabText, tab === 'calendar' && styles.tabTextActive]}>
            월간 달력
          </Text>
          {tab === 'calendar' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1, alignItems: 'center',
    paddingVertical: 10, gap: 3, position: 'relative',
  },
  tabIcon: { fontSize: 22 },
  tabText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  tabIndicator: {
    position: 'absolute', bottom: 0,
    width: 24, height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
