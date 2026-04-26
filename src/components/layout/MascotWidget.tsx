import { useState, useEffect, useRef, forwardRef } from "react";
import { X, Send, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { DEFAULT_ASSISTANT_IMAGE } from "@/lib/constants";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export const MascotWidget = forwardRef<HTMLDivElement>((_, ref) => {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [liveUsers] = useState(Math.floor(Math.random() * (140 - 50 + 1)) + 50);

  const AMAZON_TAG = "rank1scout-21";
  const SCOUTY_IMAGE = DEFAULT_ASSISTANT_IMAGE;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300 && !isVisible) setIsVisible(true);
    };
    window.addEventListener("scroll", handleScroll);

    if (!hasInitialized.current) {
      const welcome = location.pathname.includes("dating") 
        ? "Suchst du die große Liebe? ❤️" 
        : "Hi, ich bin Scouty! 🔭";
      
      setMessages([{ id: '1', text: welcome, sender: 'bot', timestamp: Date.now() }]);
      hasInitialized.current = true;
      if (window.innerWidth < 768) setShowBubble(false);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, isVisible]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue("");
    setMessages(prev => [...prev, { id: Math.random().toString(), text, sender: 'user', timestamp: Date.now() }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const botReply = `Ich checke Amazon nach "${text}"... 🔎`;
      setMessages(prev => [...prev, { id: Math.random().toString(), text: botReply, sender: 'bot', timestamp: Date.now() }]);
      setTimeout(() => {
        window.open(`https://www.amazon.de/s?k=${encodeURIComponent(text)}&tag=${AMAZON_TAG}`, '_blank');
      }, 1200);
    }, 800);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) return toast.error("E-Mail prüfen!");
    const { error } = await supabase.from("subscribers").insert({ email: emailInput, source_page: "scouty_widget" });
    if (!error) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      setEmailSent(true);
      toast.success("Deal ist unterwegs!");
    }
  };

  if (!isVisible) return null;

  return (
    <div ref={ref} className={`fixed z-[9999] flex flex-col items-end transition-all duration-300 ${isMobile ? "bottom-4 right-4" : "bottom-8 right-8"} ${isMinimized ? "translate-x-[70%] opacity-50" : "translate-x-0"}`}>
      {isOpen && (
        <div className={`bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300 mb-4 ${isMobile ? "w-[calc(100vw-32px)] h-[450px]" : "w-[360px] h-[500px]"}`}>
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-sm leading-none">Scouty AI</p>
                <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {liveUsers} online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white border flex-shrink-0 mt-1 flex items-center justify-center">
                    <img src={SCOUTY_IMAGE} alt="S" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${m.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>{m.text}</div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] text-slate-400 animate-pulse pl-8">Scouty checkt Angebote...</div>}
            {!emailSent && messages.length >= 2 && (
              <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl mx-2">
                <p className="text-xs font-bold text-secondary uppercase mb-2 text-center">Exklusiver Deal-Alarm!</p>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Deine E-Mail..." className="h-9 text-xs bg-white" />
                  <Button type="submit" size="sm" className="h-9 bg-secondary text-white"><Mail className="w-4 h-4" /></Button>
                </form>
              </div>
            )}
          </div>
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center gap-2">
              <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Frag Scouty..." className="rounded-full bg-slate-50 border-none h-11 pr-12 focus-visible:ring-secondary" />
              <Button onClick={handleSendMessage} size="icon" className="absolute right-1 w-9 h-9 rounded-full bg-secondary text-white"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isOpen && !isMobile && showBubble && (
          <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-right-5 relative flex items-center gap-3">
            <button onClick={() => setShowBubble(false)} className="absolute -top-2 -left-2 bg-slate-100 rounded-full p-1 hover:bg-slate-200 transition-colors shadow-sm"><X className="w-3 h-3 text-slate-500" /></button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
               <img src={SCOUTY_IMAGE} alt="Scouty Mini" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-medium text-slate-700 whitespace-nowrap cursor-pointer pr-2" onClick={() => setIsOpen(true)}>
              {messages[messages.length-1]?.text}
            </p>
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-slate-100 rotate-45" />
          </div>
        )}
        
        <div className="relative group">
          {!isOpen && !isMobile && (
            <button onClick={() => setIsMinimized(!isMinimized)} className="absolute -left-8 top-1/2 -translate-y-1/2 bg-slate-800/80 text-white p-1 rounded-l-lg opacity-0 group-hover:opacity-100 transition-all">
              {isMinimized ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={() => { setIsOpen(!isOpen); setHasUnread(false); setIsMinimized(false); }}
            className={`rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-4 border-white overflow-hidden relative flex items-center justify-center ${isMobile ? "w-14 h-14" : "w-16 h-16"} ${isOpen ? "bg-slate-900" : "bg-white"}`}
          >
            {isOpen ? <X className="w-8 h-8 text-white" /> : <img src={SCOUTY_IMAGE} alt="Scouty" className="w-full h-full object-cover" />}
            {hasUnread && !isOpen && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />}
          </button>
        </div>
      </div>
    </div>
  );
});

MascotWidget.displayName = "MascotWidget";
