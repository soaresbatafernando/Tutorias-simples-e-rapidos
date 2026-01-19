import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchBar from "@/components/SearchBar";
import TutorialCard from "@/components/TutorialCard";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TutorialsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoria") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("busca") || "");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTutorials();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTutorials = async () => {
    setIsLoading(true);
    try {
      let url = `${API}/tutorials?limit=50`;
      if (selectedCategory && selectedCategory !== "all") {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          url += `&category=${category.id}`;
        }
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const response = await axios.get(url);
      setTutorials(response.data);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    if (value === "all") {
      searchParams.delete("categoria");
    } else {
      searchParams.set("categoria", value);
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      searchParams.set("busca", query);
    } else {
      searchParams.delete("busca");
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== "all" || searchQuery;

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="tutorials-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white mb-4">
            Tutoriais
          </h1>
          <p className="text-[#A1A1AA] text-lg">
            Encontre guias passo a passo para resolver qualquer problema de tecnologia
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar 
            placeholder="Buscar tutoriais..." 
            onSearch={handleSearch}
            showAIHint={false}
            className="max-w-xl"
          />

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#A1A1AA]" />
              <span className="text-sm text-[#A1A1AA]">Filtrar por:</span>
            </div>

            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48 bg-[#18181B] border-[#27272A] text-white" data-testid="category-filter">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181B] border-[#27272A]">
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-[#A1A1AA] hover:text-white"
                data-testid="clear-filters-btn"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedCategory !== "all" && (
                <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30">
                  Categoria: {categories.find(c => c.slug === selectedCategory)?.name}
                </Badge>
              )}
              {searchQuery && (
                <Badge className="bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30">
                  Busca: "{searchQuery}"
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : tutorials.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#27272A] flex items-center justify-center mb-6">
              <Filter className="w-10 h-10 text-[#A1A1AA]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum tutorial encontrado
            </h3>
            <p className="text-[#A1A1AA] mb-6">
              Tente ajustar os filtros ou usar termos diferentes na busca
            </p>
            <Button onClick={clearFilters} className="btn-primary">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#A1A1AA] mb-6">
              {tutorials.length} {tutorials.length === 1 ? "tutorial encontrado" : "tutoriais encontrados"}
            </p>
            <div className="bento-grid">
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </>
        )}

        {/* AdSense */}
        <div className="mt-12">
          <div className="adsense-placeholder" data-testid="tutorials-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </div>
    </div>
  );
}
