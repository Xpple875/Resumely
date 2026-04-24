import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const PW = 595.28; const PH = 841.89; 
const ML = 50; const MR = 50; const MT = 50; const MB = 50; 
const CW = PW - ML - MR;

const C_BLACK = rgb(0.102, 0.090, 0.078);
const C_MID = rgb(0.420, 0.392, 0.376);
const C_LIGHT = rgb(0.627, 0.596, 0.580);
const C_WHITE = rgb(1, 1, 1);

function hexToPdfColor(hex) {
    if (!hex) return rgb(0.769, 0.384, 0.176);
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
}

function cleanText(str) {
    if (!str) return '';
    return String(str)
        .replace(/📧|📞|📍|🔗|🌐/g, '') // remove emojis silently, we draw SVGs or pass clean
        .replace(/•/g, '-')
        // Clean non-printable/unsupported characters for PDF Standard Fonts
        .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2022\u0100-\u017F]/g, ''); 
}

const I_EMAIL = "M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6";
const I_PHONE = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"; // web substituted as phone icon is annoying
const I_LOC = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z";
const I_WEB = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z";
const I_LINK = "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z";

export async function generatePDF(_element, resumeData, template = 'classic') {
    console.log('PDF Generation Started');
    try {
        const { personal, theme: dataTheme } = resumeData;
        let sectionOrder = resumeData.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects'];
        if (personal.summary && !personal.hideSummary && !sectionOrder.includes('summary')) {
            sectionOrder = ['summary', ...sectionOrder];
        }
        const sectionLabels = resumeData.sectionLabels || {};
        const accent = hexToPdfColor(dataTheme?.accentColor);

        console.log('Creating PDF Document...');
        const pdfDoc = await PDFDocument.create();
        
        // ── FONTS ──
        let mainFont, mainFontBold, serifFont;
        try {
            console.log('Loading fonts...');
            mainFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            mainFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            // Fetch font locally from same origin
            const fontUrl = '/fonts/InstrumentSerif-Regular.ttf';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
            
            let fontBytes = null;
            try {
                const res = await fetch(fontUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                    fontBytes = await res.arrayBuffer();
                } else {
                    console.warn(`Local font fetch returned ${res.status}, trying gstatic fallback`);
                    const fallbackUrl = 'https://fonts.gstatic.com/s/instrumentserif/v1/4iCs6VHR-B6Ab5Hh6G9Xy8K8Z0g.ttf';
                    const fallbackRes = await fetch(fallbackUrl);
                    if (fallbackRes.ok) fontBytes = await fallbackRes.arrayBuffer();
                }
            } catch (err) {
                console.warn('Font fetch completely failed:', err.message);
                clearTimeout(timeoutId);
            }

            if (fontBytes) {
                serifFont = await pdfDoc.embedFont(fontBytes);
            } else {
                serifFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            }
        } catch (e) {
            console.warn('Font embedding failed:', e.message);
            serifFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        }

        let page = pdfDoc.addPage([PW, PH]);
        let y = PH - MT;

        const newPage = () => {
            page = pdfDoc.addPage([PW, PH]);
            y = PH - MT;
        };

        const checkBreak = (h = 40) => {
            if (y - h < MB) newPage();
        };

        const drawText = (str, x, py, font, size, col) => {
            if (!str) return;
            const cleaned = cleanText(str);
            if (!cleaned) return;
            page.drawText(cleaned, { x, y: py, size, font, color: col });
        };

        const drawTextRight = (str, rx, py, font, size, col) => {
            if (!str) return;
            const cleaned = cleanText(str);
            const w = font.widthOfTextAtSize(cleaned, size);
            drawText(cleaned, rx - w, py, font, size, col);
        };

        const wrapText = (str, maxW, font, size) => {
            if (!str) return [];
            const cleaned = cleanText(str);
            const lines = [];
            let currentLine = '';
            
            // Basic character wrap if a single word/URL is too long
            const words = cleaned.split(' ');
            
            for (let word of words) {
                // Slicing logic: if the single word mathematically breaks margin bounds
                while (font.widthOfTextAtSize(word, size) > maxW) {
                    let len = word.length;
                    while (len > 0 && font.widthOfTextAtSize(word.substring(0, len), size) > maxW) {
                        len--;
                    }
                    if (len === 0) break; // safeguard
                    lines.push(word.substring(0, len));
                    word = word.substring(len);
                }
                
                const test = currentLine ? currentLine + ' ' + word : word;
                if (font.widthOfTextAtSize(test, size) <= maxW) {
                    currentLine = test;
                } else {
                    if (currentLine) lines.push(currentLine);
                    currentLine = word;
                }
            }
            if (currentLine) lines.push(currentLine);
            return lines;
        };

        const drawWrapped = (str, x, maxW, font, size, col, lh, bulletPrefix = null) => {
            if (!str) return;
            const lines = wrapText(str, maxW, font, size);
            for (let i = 0; i < lines.length; i++) {
                checkBreak(lh);
                if (i === 0 && bulletPrefix) drawText(bulletPrefix, x - 14, y, font, size, col);
                drawText(lines[i], x, y, font, size, col);
                y -= lh;
            }
        };

        const hline = (py, thick = 0.5, col = C_BLACK) => {
            page.drawLine({
                start: { x: ML, y: py },
                end: { x: PW - MR, y: py },
                thickness: thick,
                color: col
            });
        };

        const drawSectionTitle = (label) => {
            checkBreak(80); y -= 16;
            const font = mainFontBold;
            const size = (template === 'minimal' ? 8.5 : (template === 'modern' ? 10 : 11));
            const col = accent;
            
            drawText(label.toUpperCase(), ML, y, font, size, col);
            
            if (template === 'modern' || template === 'classic') {
                y -= 4;
                hline(y, 0.4, template === 'modern' ? rgb(0.88, 0.85, 0.83) : rgb(0.9, 0.9, 0.9));
                y -= 12;
            }
        };

        // ── RENDER HEADER ──
        console.log('Rendering Header...');

        const contactSet = [
            { t: personal.email, i: I_EMAIL },
            { t: personal.phone, i: I_PHONE },
            { t: personal.location, i: I_LOC },
            { t: personal.linkedin, i: I_LINK },
            { t: personal.website, i: I_WEB }
        ].filter(c => c.t);

        const drawDynamicContacts = (colW, startX, py, size, col, alignCenter) => {
            let cx = startX;
            if (alignCenter) {
                const str = contactSet.map(c => c.t).join('     \xb7     ');
                const cw = mainFont.widthOfTextAtSize(str, size);
                drawText(str, startX + (colW / 2) - (cw / 2), py, mainFont, size, col);
                return;
            }
            contactSet.forEach((item) => {
                const textWidth = mainFont.widthOfTextAtSize(cleanText(item.t), size);
                const blockWidth = textWidth + 24;
                if (cx + blockWidth > startX + colW) { py -= 18; cx = startX; }
                if (item.i) {
                   page.drawSvgPath(item.i, { x: cx, y: py + 8, color: col, scale: 0.045 });
                   cx += 14;
                }
                drawText(item.t, cx, py, mainFont, size, col);
                cx += textWidth + 20; 
            });
        };

        if (template === 'modern') {
            page.drawRectangle({ x: 0, y: PH - 140, width: PW, height: 140, color: rgb(0.102, 0.090, 0.078) });
            y = PH - 65;
            drawText((personal.name || 'YOUR NAME').toUpperCase(), ML, y, serifFont, 32, C_WHITE);
            y -= 32;
            drawText(personal.title || '', ML, y, mainFont, 12, accent);
            y = PH - 140 - 34;
            page.drawRectangle({ x: 0, y, width: PW, height: 34, color: rgb(0.94, 0.90, 0.87) });
            drawDynamicContacts(CW, ML, y + 13, 8.5, C_MID, false);
            y = PH - 140 - 34 - 35;
        } else if (template === 'elegant') {
            y = PH - 60;
            const name = (personal.name || 'YOUR NAME').toUpperCase();
            const nameW = serifFont.widthOfTextAtSize(name, 34);
            drawText(name, PW/2 - nameW/2, y, serifFont, 34, rgb(0.102, 0.090, 0.078));
            y -= 32;
            if (personal.title) {
                const tText = personal.title.toUpperCase();
                const tW = mainFont.widthOfTextAtSize(tText, 11);
                drawText(tText, PW/2 - tW/2, y, mainFont, 11, accent);
                y -= 22;
            }
            drawDynamicContacts(CW, ML, y, 9, C_MID, true);
            y -= 25;
            hline(y, 0.3, rgb(0.9, 0.9, 0.9));
            y -= 35;
        } else if (template === 'compact') {
            // Sidebar rectangle background
            page.drawRectangle({ x: 0, y: 0, width: 170, height: PH, color: rgb(0.96, 0.94, 0.92) });
            y = PH - 60;
            drawText((personal.name || 'YOUR NAME').toUpperCase(), 40, y, serifFont, 24, rgb(0.102, 0.090, 0.078));
            y -= 22;
            drawText(personal.title || '', 40, y, mainFont, 10, accent);
            y -= 35;
            
            // Sidebar contacts
            contactSet.forEach(c => {
                drawText(c.t, 40, y, mainFont, 8, C_MID);
                y -= 14;
            });
            y -= 20;

            // Sidebar sections
            ['skills', 'languages', 'interests'].forEach(key => {
                const items = resumeData[key] || [];
                if (!items.length) return;
                const label = (sectionLabels[key] || key).toUpperCase();
                drawText(label, 40, y, mainFontBold, 8, accent);
                y -= 15;
                items.forEach(it => {
                    const str = typeof it === 'string' ? it : it.name;
                    drawWrapped(str, 40, 100, mainFont, 8.5, C_BLACK, 11);
                    y -= 2;
                });
                y -= 15;
            });

            // Reset Y for Main Column
            y = PH - 60;
            const mainX = 195;
            const mainW = PW - mainX - MR;

            if (!personal.hideSummary && personal.summary) {
                drawText('PROFILE', mainX, y, mainFontBold, 10, accent);
                y -= 6; hline(y, 0.3, rgb(0.9, 0.9, 0.9)); y -= 15;
                drawWrapped(personal.summary, mainX, mainW, mainFont, 10, C_BLACK, 13);
                y -= 20;
            }

            sectionOrder.filter(k => !['skills', 'languages', 'interests', 'summary'].includes(k)).forEach(key => {
                const items = resumeData[key] || [];
                if (!items.length) return;
                const label = (sectionLabels[key] || key).toUpperCase();
                drawText(label, mainX, y, mainFontBold, 10, accent);
                y -= 6; hline(y, 0.3, rgb(0.9, 0.9, 0.9)); y -= 18;

                items.forEach(item => {
                    const title = item.title || item.degree || item.name || item.role;
                    const date = [item.startDate, item.endDate].filter(Boolean).join(' – ') || item.date;
                    if (title) {
                        drawText(title, mainX, y, mainFontBold, 10, C_BLACK);
                        if (date) drawTextRight(date, PW - MR, y, mainFont, 8.5, C_LIGHT);
                        y -= 13;
                    }
                    const meta = [item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ');
                    if (meta) { drawText(meta, mainX, y, mainFont, 9, C_MID); y -= 12; }
                    if (item.description) { drawWrapped(item.description, mainX, mainW, mainFont, 9.5, C_BLACK, 12); }
                    (item.bullets || []).forEach(b => {
                        if (b?.trim()) drawWrapped(b, mainX + 10, mainW - 10, mainFont, 9.5, C_BLACK, 12, '-');
                    });
                    y -= 10;
                });
            });

            // Skip standard content loop for compact since we handled it above
            sectionOrder = []; 
        } else if (template === 'minimal') {
            y = PH - 60;
            drawText((personal.name || 'YOUR NAME').toUpperCase(), ML, y, serifFont, 28, accent);
            y -= 24;
            drawText(personal.title || '', ML, y, mainFont, 11, C_MID);
            y -= 16;
            drawDynamicContacts(CW, ML, y, 9.5, C_LIGHT, false);
            y -= 12; hline(y, 0.3, rgb(0.88, 0.85, 0.83)); y -= 32;
        } else {
            y = PH - 60;
            const name = (personal.name || 'YOUR NAME').toUpperCase();
            const nameW = serifFont.widthOfTextAtSize(name, 28);
            drawText(name, PW/2 - nameW/2, y, serifFont, 28, rgb(0.102, 0.090, 0.078));
            y -= 28;
            if (personal.title) {
                const tText = personal.title.toUpperCase();
                const tW = mainFontBold.widthOfTextAtSize(tText, 11);
                drawText(tText, PW/2 - tW/2, y, mainFontBold, 11, accent);
                y -= 20;
            }
            drawDynamicContacts(CW, ML, y, 9.5, C_MID, true);
            y -= 14; hline(y, 1.2, rgb(0.102, 0.090, 0.078)); y -= 24;
        }

        // ── CONTENT LOOP (For non-compact templates) ──
        console.log('Rendering Content...');
        for (const key of sectionOrder) {
            const items = resumeData[key] || [];
            if (!items.length && key !== 'summary') continue;
            
            const label = sectionLabels[key] !== undefined && String(sectionLabels[key]).trim() === '' 
                ? 'GENERAL' 
                : (sectionLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1)));

            if (key === 'summary') {
                if (!personal.hideSummary && personal.summary) {
                    drawSectionTitle(label);
                    const isElegant = template === 'elegant';
                    const sW = isElegant ? CW * 0.85 : (template === 'minimal' ? CW - 110 : CW);
                    const sX = isElegant ? PW/2 - sW/2 : (template === 'minimal' ? ML + 115 : ML);
                    drawWrapped(personal.summary, sX, sW, mainFont, 10.5, rgb(0.102, 0.090, 0.078), 14.5);
                    y -= 8;
                }
                continue;
            }
            
            drawSectionTitle(label);
            const isElegant = template === 'elegant';
            const startX = isElegant ? ML : (template === 'minimal' ? ML + 115 : ML);
            const colW = isElegant ? CW : (template === 'minimal' ? CW - 110 : CW);
            
            if (['skills', 'interests', 'languages'].includes(key)) {
                if (template === 'modern') {
                    let cx = startX;
                    const bColor = rgb(0.94, 0.90, 0.87);
                    items.forEach(it => {
                        const str = cleanText(typeof it === 'string' ? it : (it.name + (it.level ? ` (${it.level})` : '')));
                        const w = mainFont.widthOfTextAtSize(str, 9);
                        if (cx + w + 16 > startX + colW) { y -= 20; cx = startX; checkBreak(20); }
                        page.drawRectangle({ x: cx, y: y - 4, width: w + 16, height: 16, color: bColor });
                        drawText(str, cx + 8, y, mainFont, 9, accent);
                        cx += w + 24;
                    });
                    y -= 10;
                } else {
                    let text = items.map(it => typeof it === 'string' ? it : (it.name + (it.level ? ` (${it.level})` : ''))).join('   \xb7   ');
                    drawWrapped(text, startX, colW, mainFont, 10, C_MID, 13.5);
                    y -= 8;
                }
            } else {
                for (const item of items) {
                    checkBreak(50);
                    const title = item.title || item.degree || item.name || item.role;
                    const date = [item.startDate, item.endDate].filter(Boolean).join(' – ') || item.date;
                    if (title) {
                        drawText(title, startX, y, mainFontBold, 11, rgb(0.102, 0.090, 0.078));
                        if (date) drawTextRight(date, PW - MR, y, mainFont, 9.5, C_LIGHT);
                        y -= 14;
                    }
                    const meta = [item.company, item.organization, item.institution, item.location, item.issuer].filter(Boolean).join(' · ');
                    if (meta) { drawText(meta, startX, y, mainFontBold, 10, C_MID); y -= 13; }
                    if (item.url) { drawWrapped(item.url, startX, colW, mainFont, 8.5, accent, 11); y -= 2; }
                    if (item.description) { drawWrapped(item.description, startX, colW, mainFont, 10.5, rgb(0.102, 0.090, 0.078), 14); }
                    for (const b of (item.bullets || [])) { 
                        if (b?.trim()) {
                            drawWrapped(b, startX + 14, colW - 14, mainFont, 10.5, rgb(0.102, 0.090, 0.078), 14, '-'); 
                        }
                    }
                    y -= 8;
                }
            }
        }

        console.log('Saving PDF...');
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(personal.name || 'resume').replace(/\s+/g, '-').toLowerCase()}-resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a); 
        URL.revokeObjectURL(url);
        console.log('PDF Generated Successfully');
    } catch (error) {
        console.error('CRITICAL ERROR during PDF generation:', error);
        alert('Failed to generate PDF. Please check the console for details.');
    }
}
