import { Link } from "react-router-dom";
import { Eye, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TutorialCard = ({ tutorial, featured = false }) => {
  const averageRating = tutorial.rating_count > 0 
    ? (tutorial.rating_sum / tutorial.rating_count).toFixed(1) 
    : "0.0";

  return (
    <Link
      to={`/tutoriais/${tutorial.slug}`}
      className={`card group block ${featured ? "bento-item-featured" : ""}`}
      data-testid={`tutorial-card-${tutorial.slug}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={tutorial.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"}
          alt={tutorial.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />
        
        {tutorial.is_featured && (
          <Badge className="absolute top-4 left-4 bg-[#8B5CF6] text-white">
            Destaque
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Tags */}
        {tutorial.tags && tutorial.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tutorial.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-['Outfit'] font-semibold text-lg text-white group-hover:text-[#8B5CF6] transition-colors line-clamp-2">
          {tutorial.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#A1A1AA] line-clamp-2">
          {tutorial.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tutorial.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              {averageRating}
            </span>
          </div>
          
          <span className="flex items-center gap-1 text-sm text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity">
            Ver tutorial
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default TutorialCard;
