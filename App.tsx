import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { HomeScreen }     from './src/screens/HomeScreen';
import { WeatherScreen }  from './src/screens/WeatherScreen';
import { CompareScreen }  from './src/screens/CompareScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { initAmplitude, trackTabViewed } from './src/services/amplitude';
import { Colors } from './src/constants/theme';
import type { City } from './src/constants/cities';

type Tab    = 'search' | 'calendar' | 'settings';
type Screen = 'home' | 'weather' | 'compare';

interface WeatherParams { city: City; date: Date; }

function AppContent() {
  const { t, defaultCity } = useSettings();
  const [tab, setTab]       = useState<Tab>('search');
  const [screen, setScreen] = useState<Screen>('home');
  const [params, setParams] = useState<WeatherParams | null>(null);

  useEffect(() => { initAmplitude().catch(console.warn); }, []);

  function handleSearch(city: City, date: Date) {
    setParams({ city, date });
    setScreen('weather');
  }

  function switchTab(next: Tab) {
    setTab(next);
    trackTabViewed(next === 'settings' ? 'search' : next); // settings는 별도 key 없으므로 재활용
  }

  // 날씨 결과 / 비교 — 탭바 없이 풀스크린
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        {tab === 'search'   && <HomeScreen onSearch={handleSearch} />}
        {tab === 'calendar' && <CalendarScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>

      {/* 하단 탭바 */}
      <View style={styles.tabBar}>
        {([
          { key: 'search',   icon: '🔍', labelKey: 'tab_search'   },
          { key: 'calendar', icon: '📅', labelKey: 'tab_calendar' },
          { key: 'settings', icon: '⚙️', labelKey: 'tab_settings' },
        ] as const).map(item => (
          <TouchableOpacity
            key={item.key}
            style={styles.tabItem}
            onPress={() => { switchTab(item.key); if (item.key === 'search') setScreen('home'); }}
            accessibilityRole="button"
          >
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>
              {t(item.labelKey)}
            </Text>
            {tab === item.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
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
  tabIcon: { fontSize: 20 },
  tabText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  tabIndicator: {
    position: 'absolute', bottom: 0,
    width: 24, height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
