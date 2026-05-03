## 원소기호 타일 생성기

### 1) 한글 폰트(나눔) 적용
- `element_tiles.scad`에서 `font_name = "NanumGothic:style=Regular"`로 설정되어 있습니다.
- 시스템에 나눔고딕이 설치되어 있어야 합니다.

### 2) 표 파일로 여러 원소 한 번에 STL 생성
`generate_tiles.py`를 사용하면 `.csv` 또는 `.tsv`의 각 행마다 STL이 생성됩니다.

필수 컬럼(한글/영문 모두 허용):
- `symbol` 또는 `기호`
- `name` 또는 `이름`
- `number` 또는 `원자량`
- `atomic_number` 또는 `원자번호`

샘플 파일:
- `samples/elements_sample.csv`

예시 실행:

```bash
python3 generate_tiles.py samples/elements_sample.csv --out out
```

### 3) 커넥터만 출력하려면
OpenSCAD 렌더 시 아래처럼 설정:

```bash
openscad -o connector.stl -D "show_tile=false" -D "show_connector=true" element_tiles.scad
```

### 4) 중학생 수업용 추가 권장사항
- 텍스트 높이를 `0.8~1.0`으로 올려 가독성 강화
- 모서리 라운드를 조금 키워 손베임 방지
- `fit_clearance`를 0.2~0.3까지 시험 출력해서 결합 강도 맞추기
- 원소군(금속/비금속/준금속)별 색상 필라멘트 규칙 정하기
