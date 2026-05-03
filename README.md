# 원소 타일 만들기 사용 설명서 (비개발자용)

## 1) 이 프로그램으로 무엇을 할 수 있나요?
이 도구는 **원소 정보가 들어있는 표(CSV 파일)**를 읽어서, 3D 프린터용 모델(STL)을 만들 수 있게 도와줍니다.

- 웹페이지에서 CSV 업로드
- 원소별 모델 파일 생성
- OpenSCAD로 STL 변환 후 출력

---

## 2) 준비물
아래 2가지만 설치하면 됩니다.

1. **OpenSCAD (무료)**
   - 3D 모델(STL) 변환에 필요
2. **이 프로젝트 파일**
   - `index.html`, `app.js`, `styles.css`
   - `element_tiles.scad`
   - `generate_tiles.py`
   - `samples/elements_sample.csv`

---

## 3) 가장 쉬운 사용 방법 (웹페이지)
1. `index.html` 파일을 더블클릭해서 브라우저로 엽니다.
2. **CSV 파일 선택**으로 원소표 파일을 올립니다.
3. 폰트, 크기(mm)를 원하는 값으로 설정합니다.
4. **SCAD ZIP 만들기 (STL 변환 스크립트 포함)** 버튼을 누릅니다.
5. ZIP 파일이 다운로드됩니다.

> ZIP 안에는 SCAD 파일들과 STL 변환용 파일(`convert_to_stl.bat`, `convert_to_stl.sh`)이 함께 들어 있습니다.

---

## 4) 폰트 설정
웹페이지에서 **폰트 고르기** 버튼을 누르면 한글 지원 + 상업용 무료 폰트 5개 중 선택할 수 있습니다.

- 나눔고딕
- 나눔명조
- Noto Sans CJK KR
- Noto Serif CJK KR
- KoPub 바탕체

---

## 5) 크기 단위
웹페이지의 크기 단위는 모두 **mm(밀리미터)** 입니다.

- 타일 크기 (mm)
- 기호 크기 (mm)
- 이름 크기 (mm)
- 원자량 크기 (mm)

---

## 6) STL 파일로 바꾸는 방법
### Windows
1. 다운로드한 ZIP을 풉니다.
2. 같은 폴더에서 `convert_to_stl.bat`를 실행합니다.
3. `stl` 폴더에 결과 파일이 생성됩니다.

### macOS/Linux
1. ZIP을 풉니다.
2. 터미널에서 해당 폴더로 이동합니다.
3. 아래 명령을 실행합니다.

```bash
chmod +x convert_to_stl.sh
./convert_to_stl.sh
