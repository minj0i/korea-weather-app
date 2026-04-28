import * as amplitude from '@amplitude/analytics-react-native';
import { AMPLITUDE_API_KEY } from '@env';

export function initAmplitude() {
  amplitude.init(AMPLITUDE_API_KEY);
}

// ─── 이벤트 이름 상수 ────────────────────────────────────────────
const Events = {
  // 날짜 조회 탭
  WEATHER_SEARCHED:   'Weather Searched',
  CITY_SELECTED:      'City Selected',
  DATE_CHANGED:       'Date Changed',
  MORE_CITIES_TOGGLED:'More Cities Toggled',

  // 날씨 결과 화면
  HOURLY_EXPANDED:    'Hourly Chart Expanded',
  COMPARE_TAPPED:     'Compare Today Tapped',
  WEATHER_SHARED:     'Weather Shared',

  // 비교 화면
  COMPARE_VIEWED:     'Compare Screen Viewed',

  // 월간 달력 탭
  CALENDAR_MONTH_VIEWED:  'Calendar Month Viewed',
  CALENDAR_MONTH_CHANGED: 'Calendar Month Changed',
  CALENDAR_DAY_SELECTED:  'Calendar Day Selected',

  // 탭 네비게이션
  TAB_VIEWED: 'Tab Viewed',
} as const;

// ─── 날짜 조회 탭 ────────────────────────────────────────────────
export function trackWeatherSearch(city: string, date: string, weatherCode: number) {
  amplitude.track(Events.WEATHER_SEARCHED, { city, date, weather_code: weatherCode });
}

export function trackCitySelected(city: string, screen: 'search' | 'calendar') {
  amplitude.track(Events.CITY_SELECTED, { city, screen });
}

export function trackDateChanged(date: string) {
  amplitude.track(Events.DATE_CHANGED, { date });
}

export function trackMoreCitiesToggled(expanded: boolean, screen: 'search' | 'calendar') {
  amplitude.track(Events.MORE_CITIES_TOGGLED, { expanded, screen });
}

// ─── 날씨 결과 화면 ──────────────────────────────────────────────
export function trackHourlyExpanded(city: string, date: string) {
  amplitude.track(Events.HOURLY_EXPANDED, { city, date });
}

export function trackCompareTapped(city: string, date: string) {
  amplitude.track(Events.COMPARE_TAPPED, { city, date });
}

export function trackWeatherShared(city: string, date: string) {
  amplitude.track(Events.WEATHER_SHARED, { city, date });
}

// ─── 비교 화면 ───────────────────────────────────────────────────
export function trackCompareViewed(city: string, pastDate: string, recentDate: string) {
  amplitude.track(Events.COMPARE_VIEWED, { city, past_date: pastDate, recent_date: recentDate });
}

// ─── 월간 달력 탭 ────────────────────────────────────────────────
export function trackCalendarMonthViewed(city: string, year: number, month: number) {
  amplitude.track(Events.CALENDAR_MONTH_VIEWED, {
    city,
    year,
    month: month + 1, // 사람이 읽기 쉽게 1~12
    year_month: `${year}-${String(month + 1).padStart(2, '0')}`,
  });
}

export function trackCalendarMonthChanged(
  city: string,
  year: number,
  month: number,
  direction: 'prev' | 'next',
) {
  amplitude.track(Events.CALENDAR_MONTH_CHANGED, {
    city,
    year,
    month: month + 1,
    direction,
    year_month: `${year}-${String(month + 1).padStart(2, '0')}`,
  });
}

export function trackCalendarDaySelected(
  city: string,
  date: string,
  weatherCode: number,
  tempMax: number,
  tempMin: number,
) {
  amplitude.track(Events.CALENDAR_DAY_SELECTED, {
    city,
    date,
    weather_code: weatherCode,
    temp_max: tempMax,
    temp_min: tempMin,
  });
}

// ─── 탭 네비게이션 ───────────────────────────────────────────────
export function trackTabViewed(tab: 'search' | 'calendar') {
  amplitude.track(Events.TAB_VIEWED, { tab });
}
