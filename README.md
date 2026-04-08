# Sendbird UIKit Polls Sample

Sendbird UIKit for React를 사용한 투표(Polls) 기능 샘플 앱입니다.

## Setup

1. 의존성 설치

```bash
npm install
```

2. `.env` 파일을 프로젝트 루트에 생성

```
VITE_APP_ID=<Sendbird App ID>
VITE_USER_ID=<User ID>
VITE_NICKNAME=<Nickname>
VITE_ACCESS_TOKEN=<Access Token>
```

Sendbird App ID는 [Sendbird Dashboard](https://dashboard.sendbird.com)에서 확인할 수 있습니다.

## Available Scripts

### `npm start`

개발 서버를 실행합니다. [http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

### `npm run build`

프로덕션용 번들을 `dist/` 폴더에 생성합니다.

### `npm run preview`

프로덕션 빌드를 로컬에서 미리보기합니다. `npm run build` 후 사용합니다.
