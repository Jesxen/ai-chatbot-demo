function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsTxt(messages, businessName) {
  const header = `Chat Export — ${businessName}\n${'='.repeat(44)}\nExported: ${new Date().toLocaleString()}\n\n`;
  const body = messages
    .map((m) => {
      const role = m.role === 'user' ? 'You' : businessName;
      return `[${formatTime(m.timestamp)}] ${role}:\n${m.content}`;
    })
    .join('\n\n---\n\n');

  downloadBlob(header + body, `chat-${Date.now()}.txt`, 'text/plain');
}

export async function exportAsPdf(messages, businessName) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxW = pageW - margin * 2;
  let y = margin;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`${businessName} — Chat Export`, margin, y);
  y += 22;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 140);
  doc.text(`Exported on ${new Date().toLocaleString()}`, margin, y);
  y += 18;

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 18;

  for (const msg of messages) {
    const isUser = msg.role === 'user';
    const role = isUser ? 'You' : businessName;
    const time = formatTime(msg.timestamp);

    // Role + time label
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isUser ? 79 : 100, isUser ? 70 : 100, isUser ? 229 : 100);
    doc.text(`${role}  ·  ${time}`, margin, y);
    y += 13;

    // Message content
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(msg.content, maxW);

    if (y + lines.length * 13 > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(lines, margin, y);
    y += lines.length * 13 + 16;

    if (y > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  doc.save(`chat-${businessName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
}
