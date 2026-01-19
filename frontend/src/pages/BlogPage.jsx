import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/blog`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return "Data não disponível";
    }
  };

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="blog-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white mb-4">
            Blog
          </h1>
          <p className="text-[#A1A1AA] text-lg">
            Artigos, novidades e dicas sobre tecnologia
          </p>
        </div>

        {/* Posts Grid */}
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
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum artigo ainda
            </h3>
            <p className="text-[#A1A1AA]">
              Em breve teremos novos conteúdos aqui!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className={`card group block ${index === 0 ? "md:col-span-2 lg:col-span-2" : ""}`}
                data-testid={`blog-post-${post.slug}`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${index === 0 ? "h-64 lg:h-80" : "h-48"}`}>
                  <img
                    src={post.image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[#A1A1AA] border-[#27272A]">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className={`font-['Outfit'] font-semibold text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-2 ${
                    index === 0 ? "text-2xl" : "text-lg"
                  }`}>
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-sm text-[#A1A1AA] line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.created_at)}
                    </span>
                    
                    <span className="flex items-center gap-1 text-sm text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity">
                      Ler mais
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* AdSense */}
        <div className="mt-12">
          <div className="adsense-placeholder" data-testid="blog-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </div>
    </div>
  );
}
