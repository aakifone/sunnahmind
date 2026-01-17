import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTranslate } from "@/hooks/useTranslate";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactDialog = ({ open, onOpenChange }: ContactDialogProps) => {
  const { toast } = useToast();
  const { t } = useTranslate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [purpose, setPurpose] = useState("");
  const [hadithRequest, setHadithRequest] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t("Message sent"),
      description: t("Thank you for contacting us. We'll get back to you soon!"),
    });
    onOpenChange(false);
    // Reset form
    setName("");
    setEmail("");
    setMessage("");
    setPurpose("");
    setHadithRequest("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gold-text">
            {t("Contact Us")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("Name")}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("Email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">{t("Purpose")}</Label>
            <Select value={purpose} onValueChange={setPurpose} required>
              <SelectTrigger id="purpose">
                <SelectValue placeholder={t("Select a purpose")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t("Bug Report")}</SelectItem>
                <SelectItem value="suggestion">{t("Suggestion")}</SelectItem>
                <SelectItem value="feedback">{t("Feedback")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("Message")}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hadithRequest">
              {t("Request a Hadith (Optional)")}
            </Label>
            <Input
              id="hadithRequest"
              value={hadithRequest}
              onChange={(e) => setHadithRequest(e.target.value)}
              placeholder={t("e.g., Hadith about patience")}
            />
          </div>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            {t("Send Message")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
