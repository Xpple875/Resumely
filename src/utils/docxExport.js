import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

export async function generateDOCX(resumeData) {
  const { personal, experience = [], education = [], skills = [], certifications = [], projects = [], volunteering = [], languages = [], interests = [], sectionOrder = [], sectionLabels = {} } = resumeData;


  const children = [];

  // ─── HEADER ───
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personal.name || "YOUR NAME",
          bold: true,
          size: 32,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: personal.title || "",
          color: "666666",
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: [personal.email, personal.phone, personal.location].filter(Boolean).join("  |  "),
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: [personal.linkedin, personal.github, personal.twitter, personal.portfolio, personal.website].filter(Boolean).join("  |  "),
          size: 18,
          color: "C4622D",
        }),
      ],
      spacing: { after: 400 },
    })

  );

  // ─── SUMMARY ───
  if (!personal.hideSummary && personal.summary) {
    children.push(
      createSectionHeader(sectionLabels.summary || "SUMMARY"),
      new Paragraph({
        children: [new TextRun({ text: personal.summary, size: 22 })],
        spacing: { after: 300 },
      })
    );
  }

  // ─── DYNAMIC SECTIONS ───
  for (const key of sectionOrder) {
    if (key === 'summary') continue;
    const label = sectionLabels[key] || key.toUpperCase();
    const items = resumeData[key] || [];
    if (items.length === 0) continue;

    children.push(createSectionHeader(label));

    if (["skills", "interests", "languages"].includes(key)) {
      // Simple list layout
      const text = items.map(item => typeof item === 'string' ? item : (item.name + (item.level ? ` (${item.level})` : ''))).join(", ");
      children.push(
        new Paragraph({
          children: [new TextRun({ text, size: 22 })],
          spacing: { after: 300 },
        })
      );
    } else {
      // Detailed entries layout
      items.forEach((item, idx) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.title || item.degree || item.name || item.role || "", bold: true, size: 24 }),
              new TextRun({ text: `\t${item.startDate ? `${item.startDate} — ${item.endDate || 'Present'}` : item.date || ""}`, size: 20 }),
            ],
            tabStops: [{ type: "right", position: 9000 }],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: [item.company, item.organization, item.institution, item.location, item.issuer, item.publisher].filter(Boolean).join(" · "), italic: true, size: 20, color: "444444" }),
            ],

            spacing: { after: 120 },
          })
        );

        if (item.description) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: item.description, size: 22 })],
              spacing: { after: 120 },
            })
          );
        }

        if (item.bullets && item.bullets.length > 0) {
          item.bullets.filter(b => b && b.trim()).forEach(bullet => {
            children.push(
              new Paragraph({
                text: bullet,
                bullet: { level: 0 },
                spacing: { after: 80 },
                style: "normal",
              })
            );
          });
        }
        
        children.push(new Paragraph({ spacing: { after: 200 } }));
      });
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${personal.name || "Resume"}.docx`);
}

function createSectionHeader(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: "C4622D",
        size: 24,
      }),
    ],
    border: {
      bottom: {
        color: "EEEEEE",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: { before: 200, after: 200 },
  });
}
