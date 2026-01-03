import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareImageGeneratorProps {
  arabic?: string;
  english: string;
  reference: string;
  onClose: () => void;
}

export const ShareImageGenerator = ({
  arabic,
  english,
  reference,
  onClose,
}: ShareImageGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    setIsGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas dimensions
    canvas.width = 1080;
    canvas.height = 1350;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f5f0e8");
    gradient.addColorStop(1, "#ebe5d9");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    ctx.strokeStyle = "#c9a23b";
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner border
    ctx.strokeStyle = "#c9a23b40";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Arabic text (if available)
    if (arabic) {
      ctx.fillStyle = "#1a2a3a";
      ctx.font = "bold 42px 'Amiri', 'Traditional Arabic', serif";
      ctx.textAlign = "right";
      ctx.direction = "rtl";

      const arabicLines = wrapText(ctx, arabic, canvas.width - 200);
      let yPos = 200;
      arabicLines.forEach((line) => {
        ctx.fillText(line, canvas.width - 100, yPos);
        yPos += 60;
      });
    }

    // English translation
    ctx.fillStyle = "#2a3a4a";
    ctx.font = "28px 'Georgia', serif";
    ctx.textAlign = "center";
    ctx.direction = "ltr";

    const englishLines = wrapText(ctx, `"${english}"`, canvas.width - 160);
    let engYPos = arabic ? 500 : 300;
    englishLines.forEach((line) => {
      ctx.fillText(line, canvas.width / 2, engYPos);
      engYPos += 45;
    });

    // Reference
    ctx.fillStyle = "#c9a23b";
    ctx.font = "italic 24px 'Georgia', serif";
    ctx.fillText(`— ${reference}`, canvas.width / 2, engYPos + 60);

    // SunnahMind branding
    ctx.fillStyle = "#1a2a3a";
    ctx.font = "bold 28px 'Georgia', serif";
    ctx.fillText("SunnahMind", canvas.width / 2, canvas.height - 100);

    ctx.fillStyle = "#6b7a8a";
    ctx.font = "16px 'Arial', sans-serif";
    ctx.fillText("Authentic Islamic Knowledge", canvas.width / 2, canvas.height - 70);

    // Convert to image
    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
    setIsGenerating(false);
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());
    return lines;
  };

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.download = `hadith-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    toast({
      title: "Downloaded!",
      description: "Hadith image saved to your device",
    });
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "hadith.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Hadith from SunnahMind",
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      handleDownload();
    }
  };

  return (
    <div className="w-full space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {!imageUrl ? (
        <Button
          onClick={generateImage}
          disabled={isGenerating}
          className="w-full bg-white/20 hover:bg-white/30 text-white"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 mr-2" />
              Generate Share Image
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border-2 border-white/30">
            <img
              src={imageUrl}
              alt="Hadith share image"
              className="w-full h-auto"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareImageGenerator;
