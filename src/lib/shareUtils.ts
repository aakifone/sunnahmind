interface ShareImagePayload {
  title: string;
  body: string;
  footer?: string;
}

const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) => {
  const words = text.split(" ");
  let line = "";

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && index > 0) {
      context.fillText(line.trim(), x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line.trim()) {
    context.fillText(line.trim(), x, y);
  }
};

export const createShareableImage = async ({ title, body, footer }: ShareImagePayload) => {
  const canvas = document.createElement("canvas");
  const width = 1200;
  const height = 630;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return "";

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1f2a44");
  gradient.addColorStop(1, "#4c3b1a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(255,255,255,0.95)";
  context.fillRect(80, 80, width - 160, height - 160);

  context.fillStyle = "#1f2a44";
  context.font = "bold 36px 'Merriweather', serif";
  context.fillText(title, 120, 160);

  context.fillStyle = "#2f2f2f";
  context.font = "24px 'Inter', sans-serif";
  wrapText(context, body, 120, 220, width - 240, 36);

  context.fillStyle = "#7a5c1e";
  context.font = "20px 'Inter', sans-serif";
  context.fillText(footer ?? "SunnahMind", 120, height - 130);

  return canvas.toDataURL("image/png");
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};
