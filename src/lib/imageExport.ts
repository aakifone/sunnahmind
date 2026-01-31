const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

export const exportTextAsImage = async (payload: {
  title: string;
  content: string;
  footer?: string;
  theme?: "ocean" | "nature" | "pattern";
}) => {
  const canvas = document.createElement("canvas");
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradients = {
    ocean: ["#0f172a", "#1e3a8a", "#38bdf8"],
    nature: ["#0f172a", "#14532d", "#84cc16"],
    pattern: ["#1f2937", "#4c1d95", "#f59e0b"],
  } as const;

  const colors = gradients[payload.theme ?? "pattern"];
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(0.5, colors[1]);
  gradient.addColorStop(1, colors[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(80, 80, size - 160, size - 160);

  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 46px 'Inter', sans-serif";
  const titleLines = wrapText(ctx, payload.title, size - 240);
  let y = 200;
  titleLines.forEach((line) => {
    ctx.fillText(line, 120, y);
    y += 56;
  });

  ctx.font = "32px 'Inter', sans-serif";
  const contentLines = wrapText(ctx, payload.content, size - 240);
  y += 20;
  contentLines.forEach((line) => {
    ctx.fillText(line, 120, y);
    y += 44;
  });

  if (payload.footer) {
    ctx.font = "24px 'Inter', sans-serif";
    ctx.fillStyle = "#6b7280";
    const footerLines = wrapText(ctx, payload.footer, size - 240);
    y += 30;
    footerLines.forEach((line) => {
      ctx.fillText(line, 120, y);
      y += 32;
    });
  }

  return canvas.toDataURL("image/png");
};

export const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

export const dataUrlToFile = async (dataUrl: string, filename: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};
