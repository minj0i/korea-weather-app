const BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windspeedMax: number;
  weatherCode: number;
}

export interface HourlyWeather {
  time: string[];
  temperature: number[];
  humidity: number[];
  precipitation: number[];
}

export interface WeatherResult {
  daily: DailyWeather;
  hourly: HourlyWeather;
}

// WMO 날씨 코드 → 한국어 + 아이콘
export const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: '맑음',         icon: '☀️' },
  1:  { label: '대체로 맑음',   icon: '🌤' },
  2:  { label: '부분적 흐림',   icon: '⛅️' },
  3:  { label: '흐림',         icon: '☁️' },
  45: { label: '안개',         icon: '🌫' },
  48: { label: '결빙 안개',     icon: '🌫' },
  51: { label: '가벼운 이슬비', icon: '🌦' },
  61: { label: '약한 비',      icon: '🌧' },
  63: { label: '비',           icon: '🌧' },
  65: { label: '강한 비',      icon: '⛈' },
  71: { label: '약한 눈',      icon: '🌨' },
  73: { label: '눈',           icon: '❄️' },
  75: { label: '강한 눈',      icon: '❄️' },
  80: { label: '소나기',       icon: '🌦' },
  95: { label: '뇌우',         icon: '⛈' },
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function fetchHistoricalWeather(
  lat: number,
  lon: number,
  date: Date,
): Promise<WeatherResult> {
  const dateStr = formatDate(date);
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: dateStr,
    end_date: dateStr,
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'windspeed_10m_max',
      'weathercode',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relativehumidity_2m',
      'precipitation',
    ].join(','),
    timezone: 'Asia/Seoul',
  });

  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`날씨 데이터를 불러오지 못했어요 (${res.status})`);

  const json = await res.json();

  return {
    daily: {
      date: dateStr,
      tempMax:       json.daily.temperature_2m_max[0],
      tempMin:       json.daily.temperature_2m_min[0],
      precipitation: json.daily.precipitation_sum[0],
      windspeedMax:  json.daily.windspeed_10m_max[0],
      weatherCode:   json.daily.weathercode[0],
    },
    hourly: {
      time:          json.hourly.time,
      temperature:   json.hourly.temperature_2m,
      humidity:      json.hourly.relativehumidity_2m,
      precipitation: json.hourly.precipitation,
    },
  };
}
