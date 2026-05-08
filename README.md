# 동네 보물길

Leaflet 지도와 네이버 지역검색 API를 이용해 출발지와 도착지 사이의 숨은 문화공간을 추천하는 프로토타입입니다.

## 실행 방법

1. 의존성 설치

```bash
npm install
```

2. `.env.example`을 복사해 `.env`를 만들고 네이버 API 키를 입력합니다.

```env
NAVER_CLIENT_ID=발급받은_Client_ID
NAVER_CLIENT_SECRET=발급받은_Client_Secret
PORT=8000
```

3. 서버 실행

```bash
npm start
```

4. 브라우저에서 접속

```text
http://127.0.0.1:8000/leaflet.html
```

## API

- `GET /api/search-place?query=광화문역`
  - 출발지/도착지 검색용 장소 후보를 반환합니다.
- `GET /api/places?query=전시 공간&lat=37.57&lng=126.98`
  - 중심 좌표 주변의 장소 후보를 반환합니다.

## 주의

- 네이버 Client ID/Secret은 절대 HTML에 넣지 않습니다.
- 현재 경로 표시는 실제 도보 경로가 아니라 직선 연결 기반입니다.
- 실제 도보 경로가 필요하면 별도의 라우팅 API를 연결해야 합니다.
