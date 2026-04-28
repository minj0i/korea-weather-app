export const CITIES = [
  { id: 'seoul',   name: '서울',  lat: 37.5665, lon: 126.9780 },
  { id: 'busan',   name: '부산',  lat: 35.1796, lon: 129.0756 },
  { id: 'incheon', name: '인천',  lat: 37.4563, lon: 126.7052 },
  { id: 'daegu',   name: '대구',  lat: 35.8714, lon: 128.6014 },
  { id: 'daejeon', name: '대전',  lat: 36.3504, lon: 127.3845 },
  { id: 'gwangju', name: '광주',  lat: 35.1595, lon: 126.8526 },
  { id: 'jeju',    name: '제주',  lat: 33.4996, lon: 126.5312 },
  { id: 'suwon',   name: '수원',  lat: 37.2636, lon: 127.0286 },
];

export type City = (typeof CITIES)[number];
