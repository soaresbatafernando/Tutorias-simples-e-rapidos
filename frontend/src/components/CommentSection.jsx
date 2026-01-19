import { useState, useEffect } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CommentSection = ({ tutorialId }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    content: "",
  });

  useEffect(() => {
    fetchComments();
  }, [tutorialId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/tutorials/${tutorialId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API}/comments`, {
        tutorial_id: tutorialId,
        ...formData,
      });
      toast.success("Comentário enviado com sucesso!");
      setFormData({ name: "", email: "", content: "" });
      fetchComments();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Erro ao enviar comentário");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-8" data-testid="comment-section">
      {/* Comment Form */}
      <div className="card p-6">
        <h3 className="font-['Outfit'] font-semibold text-lg text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8B5CF6]" />
          Deixe um comentário
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white"
              data-testid="comment-name-input"
            />
            <Input
              type="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white"
              data-testid="comment-email-input"
            />
          </div>
          <Textarea
            placeholder="Escreva seu comentário..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white min-h-[100px]"
            data-testid="comment-content-input"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            data-testid="comment-submit-btn"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Comentário
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="font-['Outfit'] font-semibold text-lg text-white">
          {comments.length} {comments.length === 1 ? "Comentário" : "Comentários"}
        </h3>

        {isLoading ? (
          <div className="card p-6 text-center">
            <div className="spinner mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="card p-6 text-center text-[#A1A1AA]">
            Nenhum comentário ainda. Seja o primeiro!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div 
                key={comment.id} 
                className="card p-4"
                data-testid={`comment-${comment.id}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#27272A] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#A1A1AA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{comment.name}</span>
                      <span className="text-xs text-[#A1A1AA]">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-[#A1A1AA] text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
