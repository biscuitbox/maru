const logEl = document.getElementById('log');
const csvFileEl = document.getElementById('csvFile');

function log(msg) {
  logEl.textContent += msg + "\n";
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV 데이터가 비어 있습니다.');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split(',').map(v => v.trim()));
  return { headers, rows };
}

function findHeader(headers, aliases) {
  const lower = headers.map(h => h.toLowerCase());
  for (const alias of aliases) {
    const idx = lower.indexOf(alias.toLowerCase());
    if (idx >= 0) return idx;
  }
  throw new Error('필수 헤더를 찾을 수 없습니다: ' + aliases.join('/'));
}

function sanitize(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, '_');
}

function makeScad({symbol, name, number, atomicNumber, fontName, tileSize, symbolSize, nameSize, numberSize}) {
  return `symbol = "${symbol}";
name = "${name}";
number = "${number}";
atomic_number = "${atomicNumber}";

show_tile = true;
show_connector = false;
font_name = "${fontName}";

tile_size = ${tileSize};
corner_radius = 5;
base_thickness = 4;
frame_width = 1.8;
frame_height = 0.6;
text_height = 0.6;
symbol_size = ${symbolSize};
name_size = ${nameSize};
number_size = ${numberSize};
atomic_size = 7;
slot_width = 25;
slot_height = 2.0;
slot_depth = 3.0;
slot_z = 1.2;
fit_clearance = 0.15;
connector_length = slot_width - 0.2;
connector_height = slot_height - fit_clearance;
connector_depth = 2*(slot_depth - fit_clearance);
connector_gap = 8;
connector_corner = 0.6;
atomic_x = -28;
atomic_y = 28;
symbol_x = 0;
symbol_y = 9;
name_x = 0;
name_y = -16;
number_x = 0;
number_y = -28;

module rounded_square(sz, r) { offset(r = r) square([sz - 2*r, sz - 2*r], center = true); }
module outer_shape_2d() { rounded_square(tile_size, corner_radius); }
frame_inset = 0.25;
module outer_frame_2d() { difference() { offset(delta = -frame_inset) outer_shape_2d(); offset(delta = -(frame_inset + frame_width)) outer_shape_2d(); } }
module base_body() { linear_extrude(height = base_thickness) outer_shape_2d(); }
module top_outer_frame() { translate([0,0,base_thickness]) linear_extrude(height = frame_height) outer_frame_2d(); }
module left_slot() { translate([-tile_size/2 - 0.1, -slot_width/2, slot_z]) cube([slot_depth + 0.2, slot_width, slot_height]); }
module right_slot() { translate([tile_size/2 - slot_depth + 0.1, -slot_width/2, slot_z]) cube([slot_depth + 0.2, slot_width, slot_height]); }
module texts() {
 translate([atomic_x, atomic_y, base_thickness]) linear_extrude(height = text_height) text(atomic_number, size = atomic_size, halign = "center", valign = "center", font = font_name);
 translate([symbol_x, symbol_y, base_thickness]) linear_extrude(height = text_height) text(symbol, size = symbol_size, halign = "center", valign = "center", font = font_name);
 translate([name_x, name_y, base_thickness]) linear_extrude(height = text_height) text(name, size = name_size, halign = "center", valign = "center", font = font_name);
 translate([number_x, number_y, base_thickness]) linear_extrude(height = text_height) text(number, size = number_size, halign = "center", valign = "center", font = font_name);
}
module tile() { difference() { union() { base_body(); top_outer_frame(); texts(); } left_slot(); right_slot(); } }
if (show_tile) tile();
`;
}

document.getElementById('downloadSample').addEventListener('click', () => {
  const sample = '원자번호,기호,이름,원자량\n1,H,수소,1.008\n2,He,헬륨,4.0026\n52,Te,텔루륨,127.60\n';
  const blob = new Blob([sample], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'elements_sample.csv';
  a.click();
});

document.getElementById('generateBtn').addEventListener('click', async () => {
  logEl.textContent = '';
  const file = csvFileEl.files[0];
  if (!file) return log('CSV 파일을 먼저 선택하세요.');

  const text = await file.text();
  const { headers, rows } = parseCSV(text);

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
    const name = row[idxName] || '';
    const number = row[idxNumber] || '';
    if (!symbol) continue;

    const scad = makeScad({ symbol, name, number, atomicNumber, fontName, tileSize, symbolSize, nameSize, numberSize });
    const filename = `${sanitize(atomicNumber)}_${sanitize(symbol)}.scad`;
    zip.file(filename, scad);
    log(`추가됨: ${filename}`);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'element_scad_files.zip';
  a.click();
  log('완료: element_scad_files.zip 다운로드');
});
