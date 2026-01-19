import { useState, useEffect } from "react";
import { Search, ChevronDown, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const faqCategories = [
  { id: "geral", name: "Geral", color: "bg-[#8B5CF6]" },
  { id: "celular", name: "Celular", color: "bg-[#10B981]" },
  { id: "computador", name: "Computador", color: "bg-[#3B82F6]" },
  { id: "internet", name: "Internet", color: "bg-[#F59E0B]" },
  { id: "ganhar-dinheiro", name: "Ganhar Dinheiro", color: "bg-[#EF4444]" },
];

export default function QuickSolutionsPage() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [faqs, searchQuery, selectedCategory]);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API}/faqs`);
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFaqs = () => {
    let filtered = faqs;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  };

  const getCategoryInfo = (categoryId) => {
    return faqCategories.find((c) => c.id === categoryId) || faqCategories[0];
  };

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="quick-solutions-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-[#8B5CF6]" />
            <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white">
              Soluções Rápidas
            </h1>
          </div>
          <p className="text-[#A1A1AA] text-lg">
            Respostas diretas para os problemas mais comuns de tecnologia
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar soluções..."
              className="w-full pl-12 h-14 bg-[#18181B] border-[#27272A] focus:border-[#8B5CF6] text-white text-base rounded-xl"
              data-testid="faq-search-input"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-[#8B5CF6] text-white"
                : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
            }`}
            data-testid="filter-all"
          >
            Todas
          </button>
          {faqCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? `${category.color} text-white`
                  : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
              }`}
              data-testid={`filter-${category.id}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-[#27272A] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#27272A] flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-[#A1A1AA]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma solução encontrada
            </h3>
            <p className="text-[#A1A1AA]">
              Tente usar termos diferentes ou use o chat de IA para perguntas específicas
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
            {filteredFaqs.map((faq) => {
              const categoryInfo = getCategoryInfo(faq.category);
              return (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="card border-[#27272A] overflow-hidden"
                  data-testid={`faq-item-${faq.id}`}
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group">
                    <div className="flex items-start gap-4 w-full">
                      <Badge className={`${categoryInfo.color} text-white flex-shrink-0`}>
                        {categoryInfo.name}
                      </Badge>
                      <span className="font-medium text-white group-hover:text-[#8B5CF6] transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="pt-2 text-[#A1A1AA] whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {/* Results count */}
        {!isLoading && filteredFaqs.length > 0 && (
          <p className="mt-6 text-sm text-[#A1A1AA]">
            Mostrando {filteredFaqs.length} de {faqs.length} soluções
          </p>
        )}

        {/* CTA */}
        <div className="mt-12 card p-8 bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/10 border-[#8B5CF6]/30 text-center">
          <h3 className="font-['Outfit'] text-xl font-bold text-white mb-3">
            Não encontrou o que procurava?
          </h3>
          <p className="text-[#A1A1AA] mb-4">
            Use nosso assistente de IA para perguntas mais específicas
          </p>
          <button
            onClick={() => document.querySelector('[data-testid="chat-toggle-btn"]')?.click()}
            className="btn-primary"
            data-testid="ask-ai-btn"
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Perguntar à IA
          </button>
        </div>

        {/* AdSense */}
        <div className="mt-12">
          <div className="adsense-placeholder" data-testid="faq-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </div>
    </div>
  );
}
