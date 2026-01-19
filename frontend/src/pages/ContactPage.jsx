import { useState } from "react";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "contato@tutoriafacil.com",
      href: "mailto:contato@tutoriafacil.com",
    },
    {
      icon: MapPin,
      label: "Localização",
      value: "Maputo, Moçambique",
      href: null,
    },
    {
      icon: MessageSquare,
      label: "Chat de IA",
      value: "Disponível 24/7",
      href: null,
      action: () => document.querySelector('[data-testid="chat-toggle-btn"]')?.click(),
    },
  ];

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="contact-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white mb-4">
            Contato
          </h1>
          <p className="text-[#A1A1AA] text-lg">
            Tem alguma dúvida, sugestão ou parceria? Entre em contato conosco!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info) => (
              <div key={info.label} className="card p-6 group hover:border-[#8B5CF6]/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8B5CF6]/30 transition-colors">
                    <info.icon className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#A1A1AA]">{info.label}</p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="font-medium text-white hover:text-[#8B5CF6] transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : info.action ? (
                      <button
                        onClick={info.action}
                        className="font-medium text-white hover:text-[#8B5CF6] transition-colors"
                      >
                        {info.value}
                      </button>
                    ) : (
                      <p className="font-medium text-white">{info.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick AI CTA */}
            <div className="card p-6 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 border-[#8B5CF6]/30">
              <h3 className="font-['Outfit'] font-semibold text-white mb-2">
                Precisa de ajuda rápida?
              </h3>
              <p className="text-sm text-[#A1A1AA] mb-4">
                Use nosso assistente de IA para respostas instantâneas
              </p>
              <Button
                onClick={() => document.querySelector('[data-testid="chat-toggle-btn"]')?.click()}
                className="btn-primary w-full"
                data-testid="contact-chat-btn"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Abrir Chat de IA
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-6 lg:p-8">
              <h2 className="font-['Outfit'] font-semibold text-xl text-white mb-6">
                Envie uma mensagem
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nome *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                      className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white"
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white"
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Assunto *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Sobre o que você quer falar?"
                    className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white"
                    data-testid="contact-subject-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mensagem *
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Escreva sua mensagem..."
                    className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white min-h-[150px]"
                    data-testid="contact-message-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full sm:w-auto"
                  data-testid="contact-submit-btn"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* AdSense */}
        <div className="mt-12">
          <div className="adsense-placeholder" data-testid="contact-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </div>
    </div>
  );
}
