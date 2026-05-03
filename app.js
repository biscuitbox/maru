const logEl = document.getElementById('log');
const csvFileEl = document.getElementById('csvFile');
const fontDialog = document.getElementById('fontDialog');
const fontList = document.getElementById('fontList');

const FONT_OPTIONS = [
  { label: '나눔고딕 (NanumGothic)', value: 'NanumGothic:style=Regular' },
  { label: '나눔명조 (NanumMyeongjo)', value: 'NanumMyeongjo:style=Regular' },
  { label: 'Noto Sans CJK KR', value: 'Noto Sans CJK KR:style=Regular' },
  { label: 'Noto Serif CJK KR', value: 'Noto Serif CJK KR:style=Regular' },
  { label: 'KoPub 바탕체 (KoPubBatang)', value: 'KoPubBatang:style=Regular' },
];

function log(msg) { logEl.textContent += msg + '\n'; }
function sanitize(name) { return String(name).replace(/[\\/:*?"<>|]/g, '_'); }

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV 데이터가 비어 있습니다.');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(',').map((v) => v.trim()));
  return { headers, rows };
}

function findHeader(headers, aliases) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias.toLowerCase());
    if (idx >= 0) return idx;
  }
  throw new Error(`필수 헤더 없음: ${aliases.join('/')}`);
}

function makeScad({ symbol, name, number, atomicNumber, fontName, tileSize, symbolSize, nameSize, numberSize }) {
  return `symbol = "${symbol}";
name = "${name}";
number = "${number}";
atomic_number = "${atomicNumber}";
font_name = "${fontName}";

show_tile = true;
show_connector = false;
tile_size = ${tileSize};
symbol_size = ${symbolSize};
name_size = ${nameSize};
number_size = ${numberSize};
use <element_tiles.scad>;
`;
}


function makeConvertSh() {
  return `#!/usr/bin/env bash
set -euo pipefail
mkdir -p stl
for f in *.scad; do
  base="\${f%.scad}"
  openscad -o "stl/\${base}.stl" "$f"
done
echo "완료: stl/ 폴더 확인"
`;
}

function makeConvertBat() {
  return `@echo off
if not exist stl mkdir stl
for %%f in (*.scad) do (
  openscad -o "stl\\%%~nf.stl" "%%f"
)
echo 완료: stl 폴더 확인
`;
}

function renderFontOptions() {
  fontList.innerHTML = '';
  for (const font of FONT_OPTIONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = font.label;
    button.addEventListener('click', () => {
      document.getElementById('fontName').value = font.value;
      fontDialog.close();
    });
    fontList.appendChild(button);
  }
}

renderFontOptions();
document.getElementById('fontPickerBtn').addEventListener('click', () => fontDialog.showModal());
document.getElementById('showStlGuideBtn').addEventListener('click', () => document.getElementById('stlDialog').showModal());

document.getElementById('downloadSample').addEventListener('click', () => {
  const sample = '원자번호,기호,이름,원자량\n1,H,수소,1.008\n2,He,헬륨,4.0026\n52,Te,텔루륨,127.60\n';
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'elements_sample.csv';
  a.click();
});

document.getElementById('generateBtn').addEventListener('click', async () => {
  try {
    logEl.textContent = '';
    const file = csvFileEl.files[0];
    if (!file) return log('CSV 파일을 먼저 선택하세요.');

    const { headers, rows } = parseCSV(await file.text());
    const idxAtomic = findHeader(headers, ['원자번호', 'atomic_number']);
    const idxSymbol = findHeader(headers, ['기호', 'symbol']);
    const idxName = findHeader(headers, ['이름', 'name']);
    const idxNumber = findHeader(headers, ['원자량', 'number']);

    const fontName = document.getElementById('fontName').value;
    const tileSize = Number(document.getElementById('tileSize').value);
    const symbolSize = Number(document.getElementById('symbolSize').value);
    const nameSize = Number(document.getElementById('nameSize').value);
    const numberSize = Number(document.getElementById('numberSize').value);

    const zip = new JSZip();
    for (const row of rows) {
      const atomicNumber = row[idxAtomic] || '';
      const symbol = row[idxSymbol] || '';
      if (!symbol) continue;
      const scad = makeScad({ symbol, name: row[idxName] || '', number: row[idxNumber] || '', atomicNumber, fontName, tileSize, symbolSize, nameSize, numberSize });
      const filename = `${sanitize(atomicNumber)}_${sanitize(symbol)}.scad`;
      zip.file(filename, scad);
      log(`추가됨: ${filename}`);
    }

    zip.file('convert_to_stl.sh', makeConvertSh());
    zip.file('convert_to_stl.bat', makeConvertBat());

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'element_scad_files.zip';
    a.click();
    log('완료: element_scad_files.zip 다운로드');
    log('안내: ZIP 안의 convert_to_stl.sh 또는 convert_to_stl.bat 실행 시 STL 일괄 변환 가능');
  } catch (err) {
    log(`오류: ${err.message}`);
  }
});
