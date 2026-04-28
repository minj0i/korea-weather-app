export const CITIES = [
  // 수도권
  { id: 'seoul',     name: '서울',  lat: 37.5665, lon: 126.9780 },
  { id: 'incheon',   name: '인천',  lat: 37.4563, lon: 126.7052 },
  { id: 'suwon',     name: '수원',  lat: 37.2636, lon: 127.0286 },
  // 강원
  { id: 'chuncheon', name: '춘천',  lat: 37.8747, lon: 127.7342 },
  { id: 'gangneung', name: '강릉',  lat: 37.7519, lon: 128.8761 },
  { id: 'sokcho',    name: '속초',  lat: 38.2070, lon: 128.5918 },
  // 충청
  { id: 'daejeon',   name: '대전',  lat: 36.3504, lon: 127.3845 },
  { id: 'cheongju',  name: '청주',  lat: 36.6424, lon: 127.4890 },
  // 경상
  { id: 'busan',     name: '부산',  lat: 35.1796, lon: 129.0756 },
  { id: 'daegu',     name: '대구',  lat: 35.8714, lon: 128.6014 },
  { id: 'ulsan',     name: '울산',  lat: 35.5384, lon: 129.3114 },
  { id: 'gyeongju',  name: '경주',  lat: 35.8562, lon: 129.2247 },
  // 전라
  { id: 'gwangju',   name: '광주',  lat: 35.1595, lon: 126.8526 },
  { id: 'jeonju',    name: '전주',  lat: 35.8242, lon: 127.1480 },
  { id: 'yeosu',     name: '여수',  lat: 34.7604, lon: 127.6622 },
  // 제주
  { id: 'jeju',      name: '제주',  lat: 33.4996, lon: 126.5312 },
];

export type City = (typeof CITIES)[number];
