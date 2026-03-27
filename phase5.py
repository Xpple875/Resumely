import os

def update_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ Preview Styles Fixed: {path}")

css_content = """
.resume-container {
  background: #D9D3CC;
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-panel {
  overflow-y: auto;
  height: calc(100vh - 56px);
}

.global-paper-flow {
  background: #fff;
  width: 210mm;
  min-height: 297mm;
  padding: 20mm 20mm 40mm 20mm; /* Increased bottom padding for Page 1 footer */
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  position: relative;

  /* THE GAP ENGINE:
     Creates a 20mm beige desk gap every 297mm.
     We use a solid color block to 'cut' the paper visually.
  */
  background-image: linear-gradient(
    to bottom,
    transparent 297mm,
    #D9D3CC 297mm,
    #D9D3CC 317mm,
    transparent 317mm
  );
  background-size: 100% 317mm;
}

/* Restores Skill Tags */
.skill-tag-preview {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  border: 1px solid #ddd;
  display: inline-block;
}

/* Ensure text actually wraps and doesn't bleed out */
.global-paper-flow * {
  word-break: break-word;
  overflow-wrap: anywhere !important;
}

.r-section-title {
  font-weight: bold;
  font-size: 12px;
  border-bottom: 1px solid #eee;
  margin: 20px 0 10px 0;
  padding-bottom: 4px;
  color: #333;
  text-transform: uppercase;
}

.r-entry {
  margin-bottom: 15px;
}

.r-entry-bullets {
  margin-top: 6px;
  padding-left: 20px;
}

/* The 'Infinite Paper' background for pages 2+ */
.global-paper-flow::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: -1;
}
"""

update_file('src/styles/preview.css', css_content)
