/**
 * PDF Export — Raw PDF writer (zero dependencies)
 *
 * WHY NOT jsPDF:
 * jsPDF's built-in helvetica font has no embedded glyph data. When it
 * renders text, it outputs Type3 glyph paths (vector shapes) instead of
 * real character codes. ATS scanners parse character codes, not paths.
 * Result: invisible text.
 *
 * THIS APPROACH:
 * We build a valid PDF file from scratch using the PDF 1.4 spec.
 * Text is written using the standard 14 PDF fonts (Helvetica family).
 * These fonts are guaranteed to be available in every PDF reader AND
 * they write real text operators (Tj, TJ) with real character codes.
 * Every ATS scanner can read them.
 *
 * STRUCTURE:
 * - Pure JavaScript, no imports, no npm packages needed
 * - Outputs a Blob, triggers browser download
 * - Handles multi-line text, page breaks, sections
 */

// ── Page constants (points — 1pt = 1/72 inch) ─────────────────────────────
const PW = 595.28   // A4 width  in points
const PH = 841.89   // A4 height in points
const ML = 52       // margin left
const MR = 52       // margin right
const MT = 52       // margin top
const MB = 52       // margin bottom
const CW = PW - ML - MR  // content width

// ── Colours (R G B each 0–1) ───────────────────────────────────────────────
const C_DARK   = '0.102 0.090 0.078'   // #1A1714
const C_MID    = '0.420 0.392 0.376'   // #6B6460
const C_LIGHT  = '0.627 0.596 0.580'   // #A09894
const C_ACCENT = '0.769 0.384 0.176'   // #C4622D

// ── PDF string escaping ────────────────────────────────────────────────────
function esc(str) {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]/g, '')
}

// ── Approximate character width for Helvetica at 1pt ─────────────────────
// Using standard PDF Helvetica glyph widths (1/1000 unit)
const WIDTHS_REGULAR = {
  default: 278,
  ' ':278,' ':278,'!':278,'"':355,'#':556,'$':556,'%':889,'&':667,"'":191,'(':333,')':333,
  '*':389,'+':584,',':278,'-':333,'.':278,'/':278,
  '0':556,'1':556,'2':556,'3':556,'4':556,'5':556,'6':556,'7':556,'8':556,'9':556,
  ':':278,';':278,'<':584,'=':584,'>':584,'?':556,'@':1015,
  'A':667,'B':667,'C':722,'D':722,'E':667,'F':611,'G':778,'H':722,'I':278,'J':500,
  'K':667,'L':556,'M':833,'N':722,'O':778,'P':667,'Q':778,'R':722,'S':667,'T':611,
  'U':722,'V':667,'W':944,'X':667,'Y':667,'Z':611,
  '[':278,'\\':278,']':278,'^':469,'_':556,'`':333,
  'a':556,'b':556,'c':500,'d':556,'e':556,'f':278,'g':556,'h':556,'i':222,'j':222,
  'k':500,'l':222,'m':833,'n':556,'o':556,'p':556,'q':556,'r':333,'s':500,'t':278,
  'u':556,'v':500,'w':722,'x':500,'y':500,'z':500,
  '{':334,'|':260,'}':334,'~':584,
}
const WIDTHS_BOLD = { ...WIDTHS_REGULAR, default: 278 }

function strWidth(str, bold, size) {
  const map = bold ? WIDTHS_BOLD : WIDTHS_REGULAR
  let w = 0
  for (const ch of String(str || '')) {
    w += (map[ch] ?? map.default)
  }
  return (w / 1000) * size
}

// ── Word-wrap ──────────────────────────────────────────────────────────────
function wrapText(str, maxPt, bold, size) {
  if (!str) return []
  const words = str.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (strWidth(test, bold, size) <= maxPt) {
      line = test
    } else {
      if (line) lines.push(line)
      // if single word is too long, force it
      line = word
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

// ── PDF Builder ────────────────────────────────────────────────────────────
class PDFWriter {
  constructor() {
    this.objects = []   // [{id, lines[]}]
    this.pages  = []    // object ids of page content streams
    this.pageIds = []   // object ids of page dict objects
    this._oid   = 0
  }

  newObj() {
    const id = ++this._oid
    const obj = { id, lines: [] }
    this.objects.push(obj)
    return obj
  }

  // Each page is built as an array of PDF operators then serialised
  buildPages(pageDataList) {
    for (const ops of pageDataList) {
      const stream = ops.join('\n')
      const contentObj = this.newObj()
      contentObj.lines = [
        `${contentObj.id} 0 obj`,
        `<< /Length ${stream.length} >>`,
        'stream',
        stream,
        'endstream',
        'endobj',
      ]
      this.pages.push(contentObj.id)

      const pageObj = this.newObj()
      pageObj.lines = null  // filled in after catalog created
      this.pageIds.push(pageObj.id)
      pageObj._contentId = contentObj.id
    }
  }

  serialise() {
    // Font resource object (standard 14 — no embedding needed, always available)
    const fontObj = this.newObj()
    fontObj.lines = [
      `${fontObj.id} 0 obj`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
      'endobj',
    ]
    const fontBoldObj = this.newObj()
    fontBoldObj.lines = [
      `${fontBoldObj.id} 0 obj`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
      'endobj',
    ]

    // Pages dict
    const pagesObj = this.newObj()
    const kidsRef = this.pageIds.map(id => `${id} 0 R`).join(' ')
    pagesObj.lines = [
      `${pagesObj.id} 0 obj`,
      `<< /Type /Pages /Kids [${kidsRef}] /Count ${this.pageIds.length} >>`,
      'endobj',
    ]

    // Fill in page dicts now we have pagesObj id and font ids
    for (let i = 0; i < this.pageIds.length; i++) {
      const pageObj = this.objects.find(o => o.id === this.pageIds[i])
      pageObj.lines = [
        `${pageObj.id} 0 obj`,
        `<< /Type /Page /Parent ${pagesObj.id} 0 R`,
        `   /MediaBox [0 0 ${PW} ${PH}]`,
        `   /Contents ${pageObj._contentId} 0 R`,
        `   /Resources << /Font << /F1 ${fontObj.id} 0 R /F2 ${fontBoldObj.id} 0 R >> >>`,
        '>>',
        'endobj',
      ]
    }

    // Catalog
    const catalogObj = this.newObj()
    catalogObj.lines = [
      `${catalogObj.id} 0 obj`,
      `<< /Type /Catalog /Pages ${pagesObj.id} 0 R >>`,
      'endobj',
    ]

    // Assemble
    const lines = ['%PDF-1.4', '%\xE2\xE3\xCF\xD3']
    const offsets = []

    for (const obj of this.objects) {
      offsets.push({ id: obj.id, offset: lines.join('\n').length + 1 })
      lines.push(...obj.lines, '')
    }

    const xrefOffset = lines.join('\n').length + 1
    lines.push('xref')
    lines.push(`0 ${this.objects.length + 1}`)
    lines.push('0000000000 65535 f ')
    for (const { id, offset } of offsets) {
      lines.push(String(offset).padStart(10, '0') + ' 00000 n ')
    }
    lines.push('trailer')
    lines.push(`<< /Size ${this.objects.length + 1} /Root ${catalogObj.id} 0 R >>`)
    lines.push('startxref')
    lines.push(String(xrefOffset))
    lines.push('%%EOF')

    return lines.join('\n')
  }
}

// ── Main export function ───────────────────────────────────────────────────
export async function generatePDF(_element, resumeData, filename = 'resume') {
  const { personal, experience, education, skills, projects } = resumeData
  const pages = []     // array of pages; each page = array of operator strings
  let ops = []         // current page operators
  let y = PH - MT      // y starts at top (PDF coords: 0 = bottom)

  // ── Operator helpers ─────────────────────────────────────────────────────

  function newPage() {
    if (ops.length) pages.push(ops)
    ops = []
    y = PH - MT
  }

  function checkBreak(needed = 40) {
    if (y - needed < MB) newPage()
  }

  // Draw a single line of text
  // font: 'F1' = Helvetica regular, 'F2' = Helvetica Bold
  function drawText(str, x, py, font, size, colour) {
    if (!str) return
    ops.push(
      'BT',
      `/${font} ${size} Tf`,
      `${colour} rg`,
      `${x} ${py} Td`,
      `(${esc(str)}) Tj`,
      'ET'
    )
  }

  // Draw right-aligned text
  function drawTextRight(str, rightX, py, font, size, colour) {
    if (!str) return
    const bold = font === 'F2'
    const w = strWidth(str, bold, size)
    drawText(str, rightX - w, py, font, size, colour)
  }

  // Draw wrapped block, returns new y after block
  function drawWrapped(str, x, py, maxW, font, size, colour, lineH) {
    if (!str) return py
    const bold = font === 'F2'
    const lines = wrapText(str, maxW, bold, size)
    for (const line of lines) {
      checkBreak(lineH + 4)
      drawText(line, x, y, font, size, colour)
      y -= lineH
    }
    return y
  }

  function hline(py, thick = 0.5, colour = C_DARK) {
    ops.push(
      `${colour} RG`,
      `${thick} w`,
      `${ML} ${py} m`,
      `${PW - MR} ${py} l`,
      'S'
    )
  }

  function thinLine(py) {
    ops.push(
      '0.886 0.855 0.831 RG',  // --border colour
      '0.3 w',
      `${ML} ${py} m`,
      `${PW - MR} ${py} l`,
      'S'
    )
  }

  // ── Section title ────────────────────────────────────────────────────────
  function sectionTitle(label) {
    checkBreak(30)
    y -= 8
    drawText(label.toUpperCase(), ML, y, 'F2', 8.5, C_DARK)
    y -= 4
    thinLine(y)
    y -= 7
  }

  // ── Build content ────────────────────────────────────────────────────────

  // NAME
  const nameLines = wrapText(personal.name || 'Your Name', CW, false, 28)
  for (const line of nameLines) {
    drawText(line, ML, y, 'F1', 28, C_DARK)
    y -= 32
  }

  // TARGET ROLE
  if (personal.title) {
    drawText(personal.title, ML, y, 'F2', 11, C_ACCENT)
    y -= 14
  }

  // CONTACT
  const contactParts = [personal.email, personal.phone, personal.location, personal.linkedin, personal.website].filter(Boolean)
  if (contactParts.length) {
    const contactStr = contactParts.join('  |  ')
    const contactLines = wrapText(contactStr, CW, false, 9)
    for (const line of contactLines) {
      drawText(line, ML, y, 'F1', 9, C_MID)
      y -= 12
    }
  }

  // Header divider
  y -= 4
  hline(y, 0.8)
  y -= 10

  // SUMMARY
  if (personal.summary) {
    sectionTitle('Summary')
    drawWrapped(personal.summary, ML, y, CW, 'F1', 10, C_DARK, 14)
    y -= 6
  }

  // EXPERIENCE
  const filledExp = (experience || []).filter(e => e.title || e.company)
  if (filledExp.length) {
    sectionTitle('Experience')
    for (const entry of filledExp) {
      checkBreak(35)

      // Title + dates
      const dates = [entry.startDate, entry.endDate].filter(Boolean).join(' \u2013 ')
      drawText(entry.title || '', ML, y, 'F2', 10.5, C_DARK)
      if (dates) drawTextRight(dates, PW - MR, y, 'F1', 9, C_LIGHT)
      y -= 13

      // Company + location
      const sub = [entry.company, entry.location].filter(Boolean).join(' \u00B7 ')
      if (sub) {
        drawText(sub, ML, y, 'F1', 9.5, C_MID)
        y -= 12
      }

      // Bullets
      const bullets = (entry.bullets || []).filter(b => b && b.trim())
      for (const bullet of bullets) {
        checkBreak(14)
        const bulletStr = '\u2022 ' + bullet
        const bLines = wrapText(bulletStr, CW - 8, false, 10)
        for (let bi = 0; bi < bLines.length; bi++) {
          drawText(bLines[bi], ML + (bi > 0 ? 8 : 0), y, 'F1', 10, C_DARK)
          y -= 13
        }
      }

      y -= 4
    }
  }

  // EDUCATION
  const filledEdu = (education || []).filter(e => e.degree || e.institution)
  if (filledEdu.length) {
    sectionTitle('Education')
    for (const entry of filledEdu) {
      checkBreak(24)

      const dates = [entry.startDate, entry.endDate].filter(Boolean).join(' \u2013 ')
      drawText(entry.degree || '', ML, y, 'F2', 10.5, C_DARK)
      if (dates) drawTextRight(dates, PW - MR, y, 'F1', 9, C_LIGHT)
      y -= 13

      if (entry.institution) {
        drawText(entry.institution, ML, y, 'F1', 9.5, C_MID)
        y -= 12
      }
      if (entry.gpa) {
        drawText(entry.gpa, ML, y, 'F1', 9, C_LIGHT)
        y -= 12
      }
      y -= 2
    }
  }

  // SKILLS
  if (skills && skills.length) {
    sectionTitle('Skills')
    const skillStr = skills.join('  \u00B7  ')
    drawWrapped(skillStr, ML, y, CW, 'F1', 10, C_DARK, 14)
    y -= 6
  }

  // PROJECTS
  const filledProjects = (projects || []).filter(p => p.name)
  if (filledProjects.length) {
    sectionTitle('Projects')
    for (const entry of filledProjects) {
      checkBreak(24)

      const nameStr = entry.url ? `${entry.name}  \u2014  ${entry.url}` : entry.name
      drawText(nameStr, ML, y, 'F2', 10.5, C_DARK)
      y -= 13

      if (entry.description) {
        drawWrapped(entry.description, ML, y, CW, 'F1', 10, C_DARK, 13)
        y -= 4
      }
      y -= 4
    }
  }

  // Flush last page
  if (ops.length) pages.push(ops)

  // ── Generate PDF ─────────────────────────────────────────────────────────
  const writer = new PDFWriter()
  writer.buildPages(pages)
  const pdfString = writer.serialise()

  // Encode as Latin-1 bytes (PDF uses byte strings)
  const bytes = new Uint8Array(pdfString.length)
  for (let i = 0; i < pdfString.length; i++) {
    bytes[i] = pdfString.charCodeAt(i) & 0xff
  }

  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${filename}-resume.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
