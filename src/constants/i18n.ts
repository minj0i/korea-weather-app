export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    // 탭
    tab_search:   '날짜 조회',
    tab_calendar: '월간 달력',
    tab_settings: '설정',

    // 홈 화면
    home_title:    '🌤 과거 날씨',
    home_subtitle: '대한민국 과거 날씨를 검색해보세요',
    home_city:     '도시 선택',
    home_date:     '날짜 선택',
    home_search:   '날씨 조회하기',
    home_more:     '＋ 더보기',
    home_collapse: '▲ 접기',

    // 날씨 결과
    weather_back:        '돌아가기',
    weather_loading:     '날씨 데이터를 불러오는 중…',
    weather_error:       '데이터를 찾을 수 없어요',
    weather_retry:       '다시 시도',
    weather_precipitation: '강수량',
    weather_wind:        '최대 풍속',
    weather_humidity:    '평균 습도',
    weather_temp_diff:   '기온 차',
    weather_hourly:      '시간별 기온',
    weather_compare:     '📊 올해 같은 날과 비교하기',

    // 비교 화면
    compare_title:    '📊 날씨 비교',
    compare_subtitle: '같은 날 비교',
    compare_vs:       'VS',
    compare_detail:   '상세 비교',
    compare_temp_max: '최고 기온',
    compare_temp_min: '최저 기온',
    compare_precip:   '강수량',
    compare_wind:     '최대 풍속',
    compare_humidity: '평균 습도',
    compare_summary:  '한줄 요약',
    compare_hotter:   '년이 {diff}° 더 더웠어요 🥵',
    compare_same:     '두 해 최고 기온이 같아요 😲',

    // 달력 화면
    calendar_title:      '📅 월간 달력',
    calendar_loading:    '두 날짜 데이터를 불러오는 중…',
    calendar_month_max:  '월 최고',
    calendar_month_rain: '월 강수량',
    calendar_sunny:      '맑은 날',

    // 설정 화면
    settings_title:         '⚙️ 설정',
    settings_language:      '언어',
    settings_language_ko:   '한국어',
    settings_language_en:   'English',
    settings_temp_unit:     '온도 단위',
    settings_default_city:  '기본 도시',
    settings_about:         '앱 정보',
    settings_version:       '버전',
    settings_data_source:   '데이터 출처',
    settings_github:        'GitHub',
    settings_section_display: '표시',
    settings_section_general: '일반',
    settings_section_about:   '정보',
  },

  en: {
    // Tabs
    tab_search:   'Search',
    tab_calendar: 'Calendar',
    tab_settings: 'Settings',

    // Home
    home_title:    '🌤 Past Weather',
    home_subtitle: 'Search historical weather in Korea',
    home_city:     'Select City',
    home_date:     'Select Date',
    home_search:   'Search Weather',
    home_more:     '＋ More',
    home_collapse: '▲ Less',

    // Weather result
    weather_back:          'Back',
    weather_loading:       'Loading weather data…',
    weather_error:         'Data not found',
    weather_retry:         'Retry',
    weather_precipitation: 'Precipitation',
    weather_wind:          'Max Wind',
    weather_humidity:      'Avg Humidity',
    weather_temp_diff:     'Temp Range',
    weather_hourly:        'Hourly Temp',
    weather_compare:       '📊 Compare with Same Day This Year',

    // Compare
    compare_title:    '📊 Weather Comparison',
    compare_subtitle: 'Same day comparison',
    compare_vs:       'VS',
    compare_detail:   'Detailed Comparison',
    compare_temp_max: 'High Temp',
    compare_temp_min: 'Low Temp',
    compare_precip:   'Precipitation',
    compare_wind:     'Max Wind',
    compare_humidity: 'Avg Humidity',
    compare_summary:  'Summary',
    compare_hotter:   'was {diff}° hotter 🥵',
    compare_same:     'Same high temperature both years 😲',

    // Calendar
    calendar_title:      '📅 Monthly Calendar',
    calendar_loading:    'Loading data for both dates…',
    calendar_month_max:  'Monthly High',
    calendar_month_rain: 'Total Rain',
    calendar_sunny:      'Sunny Days',

    // Settings
    settings_title:         '⚙️ Settings',
    settings_language:      'Language',
    settings_language_ko:   '한국어',
    settings_language_en:   'English',
    settings_temp_unit:     'Temperature Unit',
    settings_default_city:  'Default City',
    settings_about:         'About',
    settings_version:       'Version',
    settings_data_source:   'Data Source',
    settings_github:        'GitHub',
    settings_section_display: 'Display',
    settings_section_general: 'General',
    settings_section_about:   'About',
  },
} as const;

export type TranslationKey = keyof typeof translations.ko;
