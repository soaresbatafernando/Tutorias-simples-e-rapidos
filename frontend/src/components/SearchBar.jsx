import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const SearchBar = ({ 
  placeholder = "Buscar tutoriais...", 
  onSearch,
  showAIHint = true,
  className = ""
}) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/tutoriais?busca=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`} data-testid="search-bar">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 h-14 bg-[#18181B] border-[#27272A] focus:border-[#8B5CF6] text-white text-base rounded-xl"
          data-testid="search-input"
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg"
          data-testid="search-submit-btn"
        >
          Buscar
        </Button>
      </div>
      
      {showAIHint && (
        <p className="mt-3 text-sm text-[#A1A1AA] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          Dica: Use o chat de IA para perguntas mais específicas
        </p>
      )}
    </form>
  );
};

export default SearchBar;
