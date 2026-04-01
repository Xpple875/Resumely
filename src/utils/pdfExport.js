
const PW = 595.28; const PH = 841.89; const ML = 50; const MR = 50; const MT = 50; const MB = 50; const CW = PW - ML - MR;
const C_BLACK = '0.102 0.090 0.078'; 
const C_MID = '0.420 0.392 0.376'; 
const C_LIGHT = '0.627 0.596 0.580';
const C_WHITE = '1 1 1';

function hexToPdfColor(hex) {
    if (!hex) return '0.769 0.384 0.176';
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function esc(str) { 
    if (!str) return '';
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/📧/g, '(E)')
        .replace(/📞/g, '(P)')
        .replace(/📍/g, '(L)')
        .replace(/🔗/g, '(LI)')
        .replace(/🌐/g, '(W)')
        .replace(/•/g, '-')
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]/g, ''); 
}

const WIDTHS = { default: 278, ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556, 'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556, 'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722, 'x': 500, 'y': 500, 'z': 500, 'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778, 'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778, 'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944, 'X': 667, 'Y': 667, 'Z': 611};

function strWidth(str, bold, size) {
    let w = 0;
    for (const ch of String(str || '')) { w += (WIDTHS[ch] ?? WIDTHS.default); }
    return (w / 1000) * size * (bold ? 1.1 : 1);
}

function wrapText(str, maxPt, bold, size) {
    if (!str) return [];
    const lines = [];
    const paragraphs = String(str).split('\n');
    for (const p of paragraphs) {
        const words = p.split(' ');
        let currentLine = '';
        for (const word of words) {
            const wordW = strWidth(word, bold, size);
            if (wordW > maxPt) {
                // Word is too long to fit on a line by itself. Break it character by character.
                if (currentLine) { lines.push(currentLine); currentLine = ''; }
                let temp = '';
                for (const char of word) {
                    if (strWidth(temp + char, bold, size) > maxPt) {
                        lines.push(temp);
                        temp = char;
                    } else {
                        temp += char;
                    }
                }
                currentLine = temp;
            } else {
                const test = currentLine ? currentLine + ' ' + word : word;
                if (strWidth(test, bold, size) <= maxPt) {
                    currentLine = test;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
        }
        if (currentLine) lines.push(currentLine);
    }
    return lines;
}

class PDFWriter {
    constructor() { this.objects = []; this.pages = []; this._oid = 0; }
    newObj() { const id = ++this._oid; const obj = { id, lines: [] }; this.objects.push(obj); return id; }
    addPage(ops) {
        const stream = ops.join('\n');
        const sid = this.newObj();
        this.objects.find(o => o.id === sid).lines = [`${sid} 0 obj`, `<< /Length ${stream.length} >>`, 'stream', stream, 'endstream', 'endobj'];
        const pid = this.newObj();
        this.pages.push({ pid, sid });
    }
    serialise() {
        const f1 = this.newObj(); this.objects.find(o => o.id === f1).lines = [`${f1} 0 obj`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', 'endobj'];
        const f2 = this.newObj(); this.objects.find(o => o.id === f2).lines = [`${f2} 0 obj`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>', 'endobj'];
        const pgid = this.newObj();
        const catsid = this.newObj();
        this.objects.find(o => o.id === pgid).lines = [`${pgid} 0 obj`, `<< /Type /Pages /Kids [${this.pages.map(p => `${p.pid} 0 R`).join(' ')}] /Count ${this.pages.length} >>`, 'endobj'];
        this.pages.forEach(p => {
            this.objects.find(o => o.id === p.pid).lines = [`${p.pid} 0 obj`, `<< /Type /Page /Parent ${pgid} 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${p.sid} 0 R >>`, 'endobj'];
        });
        this.objects.find(o => o.id === catsid).lines = [`${catsid} 0 obj`, `<< /Type /Catalog /Pages ${pgid} 0 R >>`, 'endobj'];
        const lines = ['%PDF-1.4', '%\xE2\xE3\xCF\xD3'];
        const offsets = [];
        for (const obj of this.objects) { offsets.push(lines.join('\n').length + 1); lines.push(...obj.lines, ''); }
        const xr = lines.join('\n').length + 1;
        lines.push('xref', `0 ${this.objects.length + 1}`, '0000000000 65535 f ');
        offsets.forEach(off => lines.push(off.toString().padStart(10, '0') + ' 00000 n '));
        lines.push('trailer', `<< /Size ${this.objects.length + 1} /Root ${catsid} 0 R >>`, 'startxref', xr.toString(), '%%EOF');
        return lines.join('\n');
    }
}

export async function generatePDF(_element, resumeData, template = 'classic') {
    const { personal, theme: dataTheme } = resumeData;
    let sectionOrder = resumeData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects'];
    
    // Ensure summary is in sectionOrder if it exists in personal but missing from order
    if (personal.summary && !sectionOrder.includes('summary')) {
        sectionOrder = ['summary', ...sectionOrder];
    }

    const sectionLabels = resumeData.sectionLabels || {};
    const accent = hexToPdfColor(dataTheme?.accentColor);

    const pages = []; let ops = []; let y = PH - MT;
    const newPage = () => { if (ops.length) pages.push(ops); ops = []; y = PH - MT; };
    const checkBreak = (h = 40) => { if (y - h < MB) newPage(); };
    const drawText = (str, x, py, font, size, col) => { if (!str) return; ops.push('BT', `/${font} ${size} Tf`, `${col} rg`, `${x} ${py} Td`, `(${esc(str)}) Tj`, 'ET'); };
    const drawTextRight = (str, rx, py, font, size, col) => { const w = strWidth(str, font === 'F2', size); drawText(str, rx - w, py, font, size, col); };
    const drawWrapped = (str, x, maxW, font, size, col, lh) => {
        const lines = wrapText(str, maxW, font === 'F2', size);
        for (const line of lines) { checkBreak(lh); drawText(line, x, y, font, size, col); y -= lh; }
    };
    const fillRect = (x, py, w, h, col) => { ops.push(`${col} rg`, `${x} ${py} ${w} ${h} re`, 'f'); };
    const hline = (py, thick = 0.5, col = C_BLACK) => { ops.push(`${col} RG`, `${thick} w`, `${ML} ${py} m`, `${PW - MR} ${py} l`, 'S'); };

    const drawSectionTitle = (label) => {
        checkBreak(35); y -= 16;
        if (template === 'minimal') {
            drawText(label.toUpperCase(), ML, y + 2, 'F2', 8.5, accent);
        } else if (template === 'modern') {
            drawText(label.toUpperCase(), ML, y, 'F2', 10, accent);
            y -= 4; ops.push('0.88 0.85 0.83 RG', '0.3 w', `${ML} ${y} m`, `${PW-MR} ${y} l`, 'S'); y -= 12;
        } else {
            drawText(label.toUpperCase(), ML, y, 'F2', 11, C_BLACK);
            y -= 4; hline(y, 0.8, C_BLACK); y -= 12;
        }
    };

    // RENDER HEADER
    if (template === 'modern') {
       fillRect(0, PH - 110, PW, 110, C_BLACK);
       y = PH - 50;
       drawText((personal.name || 'YOUR NAME').toUpperCase(), ML, y, 'F2', 28, C_WHITE);
       y -= 26;
       drawText(personal.title || '', ML, y, 'F1', 12, accent);
       
       y = PH - 110 - 24;
       fillRect(0, y, PW, 24, '0.94 0.90 0.87');
       const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean);
       drawText(contactParts.join('  |  '), ML, y + 8, 'F1', 8.5, C_MID);
       y -= 30;
    } else if (template === 'minimal') {
       y = PH - 60;
       drawText((personal.name || 'YOUR NAME').toUpperCase(), ML, y, 'F2', 26, C_BLACK);
       y -= 24;
       drawText(personal.title || '', ML, y, 'F1', 11, C_MID);
       y -= 16;
       const cp = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean);
       const cpLine = cp.join('  ·  ');
       drawText(cpLine, ML, y, 'F1', 9.5, C_LIGHT);
       y -= 12; hline(y, 0.3, '0.88 0.85 0.83'); y -= 32;
    } else {
       y = PH - 60;
       drawText((personal.name || 'YOUR NAME').toUpperCase(), PW/2 - strWidth(personal.name, true, 26)/2, y, 'F2', 26, C_BLACK);
       y -= 24;
       if (personal.title) {
          drawText(personal.title.toUpperCase(), PW/2 - strWidth(personal.title, true, 11)/2, y, 'F2', 11, accent);
          y -= 18;
       }
       const cp = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean);
       const cpText = cp.join('  ·  ');
       drawText(cpText, PW/2 - strWidth(cpText, false, 9.5)/2, y, 'F1', 9.5, C_MID);
       y -= 14; hline(y, 1.2, C_BLACK); y -= 24;
    }

    // CONTENT LOOP
    for (const key of sectionOrder) {
        const items = resumeData[key] || [];
        const label = sectionLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1));
        
        if (key === 'summary') {
            if (personal.summary) {
                drawSectionTitle(label);
                drawWrapped(personal.summary, (template === 'minimal' ? ML + 115 : ML), (template === 'minimal' ? CW - 115 : CW), 'F1', 10.5, C_BLACK, 14.5);
                y -= 8;
            }
            continue;
        }
        
        if (!items.length) continue;
        drawSectionTitle(label);
        const startX = (template === 'minimal' ? ML + 115 : ML);
        const colW = (template === 'minimal' ? CW - 115 : CW);
        
        if (['skills', 'interests', 'languages'].includes(key)) {
            let chunk = []; let rowW = 0;
            for (let it of items) {
                const s = typeof it === 'string' ? it : (it.name + (it.level ? ` (${it.level})` : ''));
                const w = strWidth(s, false, 9) + 16;
                if (rowW + w > colW) {
                   checkBreak(20);
                   let curX = startX;
                   for (let bit of chunk) {
                      fillRect(curX, y - 2, bit.w - 4, 13, '0.96 0.96 0.96');
                      drawText(bit.s, curX + 4, y + 1, 'F1', 9, C_MID);
                      curX += bit.w;
                   }
                   y -= 18; rowW = 0; chunk = [];
                }
                chunk.push({s, w}); rowW += w;
            }
            if (chunk.length) {
               checkBreak(20);
               let curX = startX;
               for (let bit of chunk) {
                  fillRect(curX, y - 2, bit.w - 4, 13, '0.96 0.96 0.96');
                  drawText(bit.s, curX + 4, y + 1, 'F1', 9, C_MID);
                  curX += bit.w;
               }
               y -= 18;
            }
        } else {
            for (const item of items) {
                checkBreak(50);
                const title = item.title || item.degree || item.name || item.role;
                const date = [item.startDate, item.endDate].filter(Boolean).join(' – ') || item.date;
                if (title) {
                    drawText(title, startX, y, 'F2', 11, C_BLACK);
                    if (date) drawTextRight(date, PW - MR, y, 'F1', 9.5, C_LIGHT);
                    y -= 14;
                }
                const meta = [item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ');
                if (meta) { drawText(meta, startX, y, 'F2', 10, C_MID); y -= 13; }
                if (item.url) { drawText(item.url, startX, y, 'F1', 8.5, accent); y -= 12; }
                if (item.description) { drawWrapped(item.description, startX, colW, 'F1', 10.5, C_BLACK, 14); }
                for (const b of (item.bullets || [])) { 
                    if (b?.trim()) {
                        checkBreak(15);
                        drawText('-', startX, y, 'F1', 10.5, C_BLACK); 
                        drawWrapped(b, startX + 10, colW - 10, 'F1', 10.5, C_BLACK, 14); 
                    }
                }
                y -= 8;
            }
        }
    }

    if (ops.length) pages.push(ops);
    const writer = new PDFWriter();
    pages.forEach(p => writer.addPage(p));
    const pdf = writer.serialise();
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) { bytes[i] = pdf.charCodeAt(i) & 0xff; }

    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${(personal.name || 'resume').replace(/\s+/g, '-').toLowerCase()}-resume.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); 
    URL.revokeObjectURL(url);
}
