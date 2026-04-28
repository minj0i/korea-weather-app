import React, { useEffect, useState } from 'react';
import { HomeScreen } from './src/screens/HomeScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';
import { initAmplitude } from './src/services/amplitude';
import type { City } from './src/constants/cities';

type Screen = 'home' | 'weather';

interface WeatherParams {
  city: City;
  date: Date;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [params, setParams] = useState<WeatherParams | null>(null);

  useEffect(() => {
    initAmplitude();
  }, []);

  function handleSearch(city: City, date: Date) {
    setParams({ city, date });
    setScreen('weather');
  }

  if (screen === 'weather' && params) {
    return (
      <WeatherScreen
        city={params.city}
        date={params.date}
        onBack={() => setScreen('home')}
      />
    );
  }

  return <HomeScreen onSearch={handleSearch} />;
}
