import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Clock, Download, Share2, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import StarRating from "@/components/StarRating";
import CommentSection from "@/components/CommentSection";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TutorialDetailPage() {
  const { slug } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedTutorials, setRelatedTutorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchTutorial();
  }, [slug]);

  const fetchTutorial = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/tutorials/${slug}`);
      setTutorial(response.data);
      
      // Fetch category
      if (response.data.category_id) {
        const categories = await axios.get(`${API}/categories`);
        const cat = categories.data.find(c => c.id === response.data.category_id);
        setCategory(cat);
        
        // Fetch related tutorials
        const relatedRes = await axios.get(`${API}/tutorials?category=${response.data.category_id}&limit=4`);
        setRelatedTutorials(relatedRes.data.filter(t => t.slug !== slug).slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching tutorial:", error);
      toast.error("Tutorial não encontrado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRate = async (rating) => {
    if (hasRated) {
      toast.info("Você já avaliou este tutorial");
      return;
    }

    try {
      await axios.post(`${API}/tutorials/${slug}/rate`, {
        tutorial_id: slug,
        rating,
      });
      setUserRating(rating);
      setHasRated(true);
      toast.success("Obrigado pela avaliação!");
      fetchTutorial();
    } catch (error) {
      console.error("Error rating tutorial:", error);
      toast.error("Erro ao avaliar");
    }
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    toast.info("Gerando PDF...");

    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#09090B",
        scale: 2,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${tutorial.slug}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tutorial.title,
          text: tutorial.description,
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

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "recentemente";
    }
  };

  const averageRating = tutorial?.rating_count > 0 
    ? (tutorial.rating_sum / tutorial.rating_count).toFixed(1) 
    : "0.0";

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

  if (!tutorial) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Tutorial não encontrado</h1>
          <Link to="/tutoriais">
            <Button className="btn-primary">Voltar aos Tutoriais</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="tutorial-detail-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            to="/tutoriais"
            className="inline-flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors"
            data-testid="back-link"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Tutoriais
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {category && (
            <Link to={`/tutoriais?categoria=${category.slug}`}>
              <Badge className="mb-4 bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/30">
                {category.name}
              </Badge>
            </Link>
          )}

          <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white mb-4">
            {tutorial.title}
          </h1>

          <p className="text-lg text-[#A1A1AA] mb-6">
            {tutorial.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tutorial.views} visualizações
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(tutorial.created_at)}
            </span>
            <div className="flex items-center gap-2">
              <StarRating rating={parseFloat(averageRating)} readonly size="sm" />
              <span>{averageRating} ({tutorial.rating_count} avaliações)</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="border-[#27272A] text-white hover:bg-[#27272A]"
              data-testid="export-pdf-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-[#27272A] text-white hover:bg-[#27272A]"
              data-testid="share-btn"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button
              variant="outline"
              className="border-[#27272A] text-white hover:bg-[#27272A]"
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </header>

        {/* Featured Image */}
        {tutorial.image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={tutorial.image_url}
              alt={tutorial.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Content */}
        <article ref={contentRef} className="card p-6 lg:p-8 mb-8">
          <div className="markdown-content">
            <ReactMarkdown>{tutorial.content}</ReactMarkdown>
          </div>

          {/* Video */}
          {tutorial.video_url && (
            <div className="mt-8">
              <h3 className="font-['Outfit'] font-semibold text-lg text-white mb-4">
                Vídeo Tutorial
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-[#27272A]">
                <iframe
                  src={tutorial.video_url}
                  title="Video tutorial"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Affiliate Links */}
          {tutorial.affiliate_links && tutorial.affiliate_links.length > 0 && (
            <div className="mt-8 p-4 bg-[#27272A]/50 rounded-lg border border-[#27272A]">
              <h3 className="font-['Outfit'] font-semibold text-white mb-3">
                Links Recomendados
              </h3>
              <div className="space-y-2">
                {tutorial.affiliate_links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="block text-[#8B5CF6] hover:text-[#3B82F6] transition-colors"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tutorial.tags && tutorial.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#27272A]">
              <div className="flex flex-wrap gap-2">
                {tutorial.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tutoriais?busca=${tag}`}
                    className="tag"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Rating Section */}
        <div className="card p-6 mb-8" data-testid="rating-section">
          <h3 className="font-['Outfit'] font-semibold text-lg text-white mb-4">
            Avalie este tutorial
          </h3>
          <div className="flex items-center gap-4">
            <StarRating
              rating={userRating}
              onRate={handleRate}
              readonly={hasRated}
              size="lg"
            />
            {hasRated && (
              <span className="text-sm text-[#10B981]">
                Obrigado pela avaliação!
              </span>
            )}
          </div>
        </div>

        {/* AdSense */}
        <div className="mb-8">
          <div className="adsense-placeholder" data-testid="tutorial-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>

        {/* Comments */}
        <CommentSection tutorialId={tutorial.id} />

        {/* Related Tutorials */}
        {relatedTutorials.length > 0 && (
          <section className="mt-12">
            <h2 className="font-['Outfit'] text-2xl font-bold text-white mb-6">
              Tutoriais Relacionados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedTutorials.map((related) => (
                <Link
                  key={related.id}
                  to={`/tutoriais/${related.slug}`}
                  className="card p-4 group"
                >
                  <h3 className="font-medium text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] mt-2 line-clamp-2">
                    {related.description}
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
