import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Share2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/blog/${slug}`);
      setPost(response.data);

      // Fetch related posts
      const allPosts = await axios.get(`${API}/blog?limit=4`);
      setRelatedPosts(allPosts.data.filter((p) => p.slug !== slug).slice(0, 3));
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Artigo não encontrado");
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

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#27272A] rounded w-1/4" />
            <div className="h-12 bg-[#27272A] rounded w-3/4" />
            <div className="h-64 bg-[#27272A] rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-[#27272A] rounded" />
              <div className="h-4 bg-[#27272A] rounded" />
              <div className="h-4 bg-[#27272A] rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h1>
          <Link to="/blog">
            <Button className="btn-primary">Voltar ao Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="blog-post-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors"
            data-testid="back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Blog
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} className="bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-[#A1A1AA] mb-6">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#A1A1AA]">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.created_at)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-[#27272A] text-white hover:bg-[#27272A]"
              data-testid="share-btn"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {post.image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <article className="card p-6 lg:p-8 mb-8">
          <div className="markdown-content">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>

        {/* AdSense */}
        <div className="mb-8">
          <div className="adsense-placeholder" data-testid="blog-post-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-['Outfit'] text-2xl font-bold text-white mb-6">
              Artigos Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="card p-4 group"
                >
                  {related.image_url && (
                    <div className="h-32 rounded-lg overflow-hidden mb-4">
                      <img
                        src={related.image_url}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <h3 className="font-medium text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] mt-2 line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
