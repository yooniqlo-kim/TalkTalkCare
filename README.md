# TalkTalkCare

## 1️⃣ 서비스 소개

### 개요

- 화상 미팅과 게임을 통한 치매 예방과 치매 진단 테스트를 통해 치매 악화 방지 및 예방
- 서비스명 : **TalkTalkCare ( 톡톡케어)**

### 타겟층 🎯

- 치매가 걱정되는 누구나🫂
- 50-80대 외로움있는 노인들👳🧓

### UCC 📽️

![톡톡케어](https://drive.google.com/file/d/1yswyQNzEGOZRCsFwHLAnHNfp9EJVNIF2/view?usp=drive_link)

## 2️⃣기획 배경

### 배경

- 치매가 걱정되는 우리 할머니😢 내가 매일 돌봐드릴 순 없으니 다른 좋은 방법이 있을까❓
- 요새 좀 깜빡깜빡 하는 것 같다. 혹시 나는 치매 초기인가❓
- 치매가 올까봐 무섭다😨 예방하려면 어떻게 해야할까❓
- 조발성 치매 환자 증가‼️
- 독거노인 수 증가‼️
- 그렇게 치매 예방과 조기 진단을 돕고, 가족과 사회가 함께 치매를 극복할 수 있도록 **TalkTalkCare**가 탄생했습니다!

### 목적 ✅

치매 예방과 더불어 어르신들의 적적함을 달래주자 ‼️

## 3️⃣기능 소개

### 📌메인 화면

<img src = "asset/MainPage.png" width="100%" height="100%">

### 📌친구 목록

웹소켓으로 연결된 세션들을 레디스로 관리해서 실시간 사용자 접속 상태를 구현했습니다

<img src = "asset/FriendList.png" width="100%" height="100%">

### 📌화상 통화

친구 목록에 버튼 또는 화상통화 페이지에 전화번호 UI로 전연령 모두가 부담없이 화상통화 서비스를 이용할 수 있습니다 

웹소켓을 사용해서 화상통화에 참여하고 있는 두 사용자를 연결 시킨 뒤, 이벤트를 서로 공유하게 하여 페이지 공유를 구현했습니다

<img src = "asset/VideoCall.png" width="100%" height="100%">
<img src = "asset/VideoCall2.png" width="100%" height="100%">
<img src = "asset/VideoCall3.png" width="100%" height="100%">

### 📌치매 예방 게임

치매 예방에 도움 되는 카테고리 5개별 간단한 미니게임을 자바바스크립트로 구현 했습니다

각 게임의 시간, 난이도를 재구성하여 저희 서비스의 의도와 맞게 만들었고, 간단한 게임으로 모두가 참여하고 즐길 수 있도록 만들었습니다

<img src = "asset/GameList.png" width="100%" height="100%">
<img src = "asset/GamePage.png" width="100%" height="100%">
<img src = "asset/GameIng.png" width="100%" height="100%">

### 📌치매 진단 테스트

삼성 의료원에서 개발한 치매  테스트 인 SDQ, 주관적 기억감퇴 설문인 자가 치매 테스트 SMCQ, 신뢰할 수 있는 두가지 치매 테스트의 각 결과를 미리 프롬프팅한 AI를 통해 결과를 진단 받습니다

<img src = "asset/DementiaTest.png" width="100%" height="100%">
<img src = "asset/DementiaTest2.png" width="100%" height="100%">
<img src = "asset/DementiaTest3.png" width="100%" height="100%">

### 📌마이페이지

사용자가 게임을 한 기록을 저장하여 한달에 한번 배치프로그램으로 카테고리별 평균 게임 점수를 표시합니다. 어떤 부분이 부족한지, 어떤 부분을 잘하는지 알 수 있습니다

또한 과거의 치매진단테스트 결과들과 보호자가 해준 진단 결과들을 볼 수 있습니다다

<img src = "asset/MyPage.png" width="100%" height="100%">
<img src = "asset/MyPage2.png" width="100%" height="100%">

## 4️⃣기술 스택

### BackEnd

- Java
- Spring Boot
- MySQL
- Redis
- WebRTC
- openvidu
- Web Socket
- Amazon S3

### Frontend

- React
- TypeScript
- Tailwind CSS

### Infrastructure

- Gitlab Actions
- Nignx
- Docker
- Amazon EC2

## 5️⃣서비스 아키텍처

![image.png](asset/SystemArchitecture.png)

## 6️⃣프로젝트 산출물

### 📌 ERD

![image.png](asset/ERD.png)

![image.png](asset/ERD2.png)

### 📌 Flow chart

![image.png](asset/flowchart.png)

### 📌Figma

![image.png](asset/Figma.png)

### 📌 API 문서

![api_swagger.gif](asset/API_swagger.gif)