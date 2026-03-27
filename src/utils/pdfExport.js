
const PW = 595.28; const PH = 841.89; const ML = 52; const MR = 52; const MT = 52; const MB = 52; const CW = PW - ML - MR;
const C_DARK = '0.102 0.090 0.078'; const C_MID = '0.420 0.392 0.376'; const C_LIGHT = '0.627 0.596 0.580'; const C_ACCENT = '0.769 0.384 0.176';

function esc(str) { return !str ? '' : String(str).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]/g, ''); }

const WIDTHS_REGULAR = { default: 278, ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191, '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278, '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556, '@': 1015, 'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778, 'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778, 'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944, 'X': 667, 'Y': 667, 'Z': 611, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556, '`': 333, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556, 'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556, 'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722, 'x': 500, 'y': 500, 'z': 500, '{': 334, '|': 260, '}': 334, '~': 584 };
const WIDTHS_BOLD = { ...WIDTHS_REGULAR };

function strWidth(str, bold, size) {
    const map = bold ? WIDTHS_BOLD : WIDTHS_REGULAR;
    let w = 0;
    for (const ch of String(str || '')) { w += (map[ch] ?? map.default); }
    return (w / 1000) * size;
}

function wrapText(str, maxPt, bold, size) {
    if (!str) return [];
    const lines = [];
    const words = String(str).split(' ');
    let currentLine = '';

    for (const word of words) {
        if (strWidth(word, bold, size) > maxPt) {
            if (currentLine) lines.push(currentLine);
            let temp = '';
            for (const char of word) {
                if (strWidth(temp + char, bold, size) > maxPt) { lines.push(temp); temp = char; }
                else { temp += char; }
            }
            currentLine = temp;
            continue;
        }
        const test = currentLine ? currentLine + ' ' + word : word;
        if (strWidth(test, bold, size) <= maxPt) { currentLine = test; }
        else { lines.push(currentLine); currentLine = word; }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

class PDFWriter {
    constructor() { this.objects = []; this.pages = []; this.pageIds = []; this._oid = 0; }
    newObj() { const id = ++this._oid; const obj = { id, lines: [] }; this.objects.push(obj); return obj; }
    buildPages(pageDataList) {
        for (const ops of pageDataList) {
            const stream = ops.join('\n');
            const contentObj = this.newObj();
            contentObj.lines = [`${contentObj.id} 0 obj`, `<< /Length ${stream.length} >>`, 'stream', stream, 'endstream', 'endobj'];
            this.pages.push(contentObj.id);
            const pageObj = this.newObj();
            this.pageIds.push(pageObj.id);
            pageObj._contentId = contentObj.id;
        }
    }
    serialise() {
        const f1 = this.newObj(); f1.lines = [`${f1.id} 0 obj`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', 'endobj'];
        const f2 = this.newObj(); f2.lines = [`${f2.id} 0 obj`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>', 'endobj'];
        const pagesObj = this.newObj(); const kids = this.pageIds.map(id => `${id} 0 R`).join(' ');
        pagesObj.lines = [`${pagesObj.id} 0 obj`, `<< /Type /Pages /Kids [${kids}] /Count ${this.pageIds.length} >>`, 'endobj'];
        for (let i = 0; i < this.pageIds.length; i++) {
            const p = this.objects.find(o => o.id === this.pageIds[i]);
            p.lines = [`${p.id} 0 obj`, `<< /Type /Page /Parent ${pagesObj.id} 0 R /MediaBox [0 0 ${PW} ${PH}] /Contents ${p._contentId} 0 R /Resources << /Font << /F1 ${f1.id} 0 R /F2 ${f2.id} 0 R >> >> >>`, 'endobj'];
        }
        const cat = this.newObj(); cat.lines = [`${cat.id} 0 obj`, `<< /Type /Catalog /Pages ${pagesObj.id} 0 R >>`, 'endobj'];
        const lines = ['%PDF-1.4', '%\xE2\xE3\xCF\xD3']; const offsets = [];
        for (const obj of this.objects) { offsets.push({ id: obj.id, offset: lines.join('\n').length + 1 }); lines.push(...obj.lines, ''); }
        const xr = lines.join('\n').length + 1; lines.push('xref', `0 ${this.objects.length + 1}`, '0000000000 65535 f ');
        for (const { offset } of offsets) { lines.push(String(offset).padStart(10, '0') + ' 00000 n '); }
        lines.push('trailer', `<< /Size ${this.objects.length + 1} /Root ${cat.id} 0 R >>`, 'startxref', String(xr), '%%EOF');
        return lines.join('\n');
    }
}

export async function generatePDF(_element, resumeData, filename = 'resume') {
    const { personal, experience, education, skills, projects } = resumeData;
    const pages = []; let ops = []; let y = PH - MT;

    const newPage = () => { if (ops.length) pages.push(ops); ops = []; y = PH - MT; };
    const checkBreak = (needed = 40) => { if (y - needed < MB) newPage(); };
    const drawText = (str, x, py, font, size, col) => { if (!str) return; ops.push('BT', `/${font} ${size} Tf`, `${col} rg`, `${x} ${py} Td`, `(${esc(str)}) Tj`, 'ET'); };
    const drawTextRight = (str, rx, py, font, size, col) => { const w = strWidth(str, font === 'F2', size); drawText(str, rx - w, py, font, size, col); };

    const drawWrapped = (str, x, maxW, font, size, col, lh) => {
        if (!str) return;
        const lines = wrapText(str, maxW, font === 'F2', size);
        for (const line of lines) { checkBreak(lh + 2); drawText(line, x, y, font, size, col); y -= lh; }
    };

    const hline = (py, thick = 0.5, col = C_DARK) => { ops.push(`${col} RG`, `${thick} w`, `${ML} ${py} m`, `${PW - MR} ${py} l`, 'S'); };
    const thinLine = (py) => { ops.push('0.886 0.855 0.831 RG', '0.3 w', `${ML} ${py} m`, `${PW - MR} ${py} l`, 'S'); };
    const sectionTitle = (label) => { checkBreak(30); y -= 8; drawText(label.toUpperCase(), ML, y, 'F2', 8.5, C_DARK); y -= 4; thinLine(y); y -= 7; };

    // HEADER
    const nameLines = wrapText(personal.name || 'Your Name', CW, false, 28);
    for (const line of nameLines) { checkBreak(35); drawText(line, ML, y, 'F1', 28, C_DARK); y -= 32; }
    if (personal.title) { checkBreak(20); drawText(personal.title, ML, y, 'F2', 11, C_ACCENT); y -= 14; }
    const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean);
    if (contactParts.length) { drawWrapped(contactParts.join('  |  '), ML, CW, 'F1', 9, C_MID, 12); }
    y -= 4; hline(y, 0.8); y -= 10;

    // CONTENT
    if (personal.summary) { sectionTitle('Summary'); drawWrapped(personal.summary, ML, CW, 'F1', 10, C_DARK, 14); y -= 6; }
    if (experience?.length) {
        sectionTitle('Experience');
        for (const e of experience) {
            if (!e.title && !e.company) continue;
            checkBreak(40);
            const d = [e.startDate, e.endDate].filter(Boolean).join(' – ');
            drawText(e.title || '', ML, y, 'F2', 10.5, C_DARK);
            if (d) drawTextRight(d, PW - MR, y, 'F1', 9, C_LIGHT);
            y -= 13;
            const sub = [e.company, e.location].filter(Boolean).join(' · ');
            if (sub) { drawText(sub, ML, y, 'F1', 9.5, C_MID); y -= 12; }
            for (const b of (e.bullets || [])) { if (b?.trim()) drawWrapped('• ' + b, ML, CW, 'F1', 10, C_DARK, 13); }
            y -= 4;
        }
    }
    if (education?.length) {
        sectionTitle('Education');
        for (const e of education) {
            if (!e.degree && !e.institution) continue;
            checkBreak(30);
            const d = [e.startDate, e.endDate].filter(Boolean).join(' – ');
            drawText(e.degree || '', ML, y, 'F2', 10.5, C_DARK);
            if (d) drawTextRight(d, PW - MR, y, 'F1', 9, C_LIGHT);
            y -= 13;
            if (e.institution) { drawText(e.institution, ML, y, 'F1', 9.5, C_MID); y -= 12; }
            y -= 2;
        }
    }
    if (skills?.length) { sectionTitle('Skills'); drawWrapped(skills.join('  ·  '), ML, CW, 'F1', 10, C_DARK, 14); y -= 6; }
    if (projects?.length) {
        sectionTitle('Projects');
        for (const p of projects) {
            if (!p.name) continue;
            checkBreak(30);
            drawText(p.url ? `${p.name}  —  ${p.url}` : p.name, ML, y, 'F2', 10.5, C_DARK);
            y -= 13;
            if (p.description) { drawWrapped(p.description, ML, CW, 'F1', 10, C_DARK, 13); }
            y -= 4;
        }
    }

    if (ops.length) pages.push(ops);
    const writer = new PDFWriter(); writer.buildPages(pages);
    const pdf = writer.serialise();
    const bytes = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) { bytes[i] = pdf.charCodeAt(i) & 0xff; }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}-resume.pdf`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
