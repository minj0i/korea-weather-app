import * as amplitude from '@amplitude/analytics-react-native';
import { AMPLITUDE_API_KEY } from '@env';

const API_KEY = AMPLITUDE_API_KEY;

export function initAmplitude() {
  amplitude.init(API_KEY);
}

const Events = {
  WEATHER_SEARCHED: 'Weather Searched',
  CITY_SELECTED: 'City Selected',
  DATE_CHANGED: 'Date Changed',
  HOURLY_EXPANDED: 'Hourly Chart Expanded',
  COMPARE_TAPPED: 'Compare Today Tapped',
  SHARE_TAPPED: 'Share Tapped',
} as const;

export function trackWeatherSearch(
  city: string,
  date: string,
  weatherCode: number,
) {
  amplitude.track(Events.WEATHER_SEARCHED, {
    city,
    date,
    weather_code: weatherCode,
  });
}

export function trackCitySelected(city: string) {
  amplitude.track(Events.CITY_SELECTED, {city});
}

export function trackDateChanged(date: string) {
  amplitude.track(Events.DATE_CHANGED, {date});
}

export function trackHourlyExpanded(city: string, date: string) {
  amplitude.track(Events.HOURLY_EXPANDED, {city, date});
}

export function trackCompareTapped(city: string, date: string) {
  amplitude.track(Events.COMPARE_TAPPED, {city, date});
}
