import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Mail, HelpCircle, ChevronRight } from "lucide-react";

const faqs = [
  {
    question: "How do I save articles?",
    answer: "Tap the bookmark icon on any article to save it for later reading.",
  },
  {
    question: "How do I change the app theme?",
    answer: "Go to Profile > Appearance to toggle between light and dark mode.",
  },
  {
    question: "Can I read articles offline?",
    answer: "Saved articles are cached for offline reading when possible.",
  },
  {
    question: "How do I report an issue?",
    answer: "Use the Contact Support option below to send us an email.",
  },
];

const HelpSupportPage = () => {
  const navigate = useNavigate();

  const handleContactSupport = () => {
    window.location.href = "mailto:support@borntoblog.app?subject=Support Request";
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* FAQ Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <Card className="shadow-card border-0">
            <CardContent className="p-0 divide-y divide-border">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4">
                  <h3 className="font-medium mb-1">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contact Options */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Contact Us
          </h2>
          <Card className="shadow-card border-0">
            <CardContent className="p-0">
              <button
                onClick={handleContactSupport}
                className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@borntoblog.app</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HelpSupportPage;