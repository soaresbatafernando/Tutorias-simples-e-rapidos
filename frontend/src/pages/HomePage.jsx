import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Monitor, Smartphone, Wifi, DollarSign, Code, BookOpen, TrendingUp, Users, Send, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import SearchBar from "@/components/SearchBar";
import TutorialCard from "@/components/TutorialCard";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = [
  { slug: "computador", name: "Computador", icon: Monitor, color: "from-blue-500 to-cyan-500" },
  { slug: "celular", name: "Celular", icon: Smartphone, color: "from-green-500 to-emerald-500" },
  { slug: "internet", name: "Internet", icon: Wifi, color: "from-purple-500 to-pink-500" },
  { slug: "ganhar-dinheiro", name: "Ganhar Dinheiro", icon: DollarSign, color: "from-yellow-500 to-orange-500" },
  { slug: "programacao", name: "Programação", icon: Code, color: "from-red-500 to-rose-500" },
];

export default function HomePage() {
  const [featuredTutorials, setFeaturedTutorials] = useState([]);
  const [stats, setStats] = useState({ tutorials: 0, categories: 0, comments: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // AI Chat state for homepage
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Sou o assistente virtual do **Tutoria Fácil**. Pergunte qualquer coisa sobre tecnologia, celulares, computadores, internet ou como ganhar dinheiro online!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tutorialsRes, statsRes] = await Promise.all([
        axios.get(`${API}/tutorials?featured=true&limit=6`),
        axios.get(`${API}/stats`),
      ]);
      setFeaturedTutorials(tutorialsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: userMessage,
        session_id: sessionId,
      });
      
      setSessionId(response.data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.response },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section with AI Chat */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1761912149936-8f662fc2a13e?w=1920&q=80"
            alt="AI Network Background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="hero-gradient absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side - Hero Text */}
            <div>
              <div className="flex items-center gap-2 mb-6 animate-fade-in">
                <div className="px-3 py-1 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] text-sm font-medium">
                  <Zap className="w-4 h-4 inline mr-1" />
                  IA Integrada
                </div>
              </div>

              <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in stagger-1">
                Tutoriais de Tecnologia
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]">
                  Simples e Diretos
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[#A1A1AA] mb-8 animate-fade-in stagger-2">
                Resolva problemas de tecnologia com tutoriais passo a passo. 
                <span className="text-white font-semibold"> Pergunte à nossa IA agora!</span>
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 animate-fade-in stagger-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.tutorials}+</p>
                    <p className="text-sm text-[#A1A1AA]">Tutoriais</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.categories}</p>
                    <p className="text-sm text-[#A1A1AA]">Categorias</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">24/7</p>
                    <p className="text-sm text-[#A1A1AA]">IA Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - AI Chat Box */}
            <div className="animate-fade-in stagger-2">
              <div className="bg-[#18181B] border border-[#8B5CF6]/30 rounded-2xl overflow-hidden shadow-2xl shadow-[#8B5CF6]/10" data-testid="hero-ai-chat">
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-[#27272A] bg-gradient-to-r from-[#8B5CF6]/20 to-[#3B82F6]/20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center animate-pulse-glow">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-lg text-white flex items-center gap-2">
                      Assistente IA
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    </h3>
                    <p className="text-sm text-[#A1A1AA]">Powered by Gemini • Online agora</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <ScrollArea className="h-[280px] p-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={
                            message.role === "user"
                              ? "bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]"
                              : "bg-[#27272A] text-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] border border-[#3f3f46]"
                          }
                        >
                          {message.role === "assistant" ? (
                            <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#27272A] text-white rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 border border-[#3f3f46]">
                          <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6]" />
                          <span className="text-sm">Pensando...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-[#27272A] bg-[#0f0f11]">
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Pergunte qualquer coisa..."
                      className="flex-1 bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white placeholder:text-[#71717a]"
                      disabled={isChatLoading}
                      data-testid="hero-chat-input"
                    />
                    <Button
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white px-4"
                      data-testid="hero-chat-send-btn"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-[#71717a] mt-2 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Pergunte sobre tutoriais, problemas de tecnologia ou como ganhar dinheiro online
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 -mt-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar placeholder="Buscar tutoriais..." showAIHint={false} />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white">
                Categorias
              </h2>
              <p className="text-[#A1A1AA] mt-2">Explore por área de interesse</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/tutoriais?categoria=${category.slug}`}
                className="group card p-6 text-center hover:border-[#8B5CF6]/50"
                data-testid={`category-${category.slug}`}
              >
                <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-medium text-white group-hover:text-[#8B5CF6] transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="py-16 lg:py-24 bg-[#0F0F11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white">
                Tutoriais em Destaque
              </h2>
              <p className="text-[#A1A1AA] mt-2">Os mais populares e acessados</p>
            </div>
            <Link to="/tutoriais">
              <Button variant="outline" className="hidden sm:flex gap-2 border-[#27272A] text-white hover:bg-[#27272A]">
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-[#27272A]" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-[#27272A] rounded w-3/4" />
                    <div className="h-3 bg-[#27272A] rounded w-full" />
                    <div className="h-3 bg-[#27272A] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bento-grid">
              {featuredTutorials.map((tutorial, index) => (
                <TutorialCard 
                  key={tutorial.id} 
                  tutorial={tutorial} 
                  featured={index === 0}
                />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/tutoriais">
              <Button className="btn-primary">
                Ver Todos os Tutoriais
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* AdSense Placeholder */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="adsense-placeholder" data-testid="home-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8 lg:p-12 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 border-[#8B5CF6]/30">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white mb-4">
                Tem uma dúvida específica?
              </h2>
              <p className="text-[#A1A1AA] mb-8">
                Use nosso assistente de IA para obter respostas instantâneas sobre qualquer 
                problema de tecnologia. É gratuito e disponível 24/7!
              </p>
              <Button 
                className="btn-primary text-lg px-8 py-6"
                onClick={() => document.querySelector('[data-testid="chat-toggle-btn"]')?.click()}
                data-testid="cta-chat-btn"
              >
                <Zap className="w-5 h-5 mr-2" />
                Conversar com a IA
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
