import { Link } from "react-router-dom";
import { Zap, Github, Twitter, Youtube, Mail } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    tutoriais: [
      { label: "Computador", href: "/tutoriais?categoria=computador" },
      { label: "Celular", href: "/tutoriais?categoria=celular" },
      { label: "Internet", href: "/tutoriais?categoria=internet" },
      { label: "Ganhar Dinheiro", href: "/tutoriais?categoria=ganhar-dinheiro" },
    ],
    recursos: [
      { label: "Blog", href: "/blog" },
      { label: "Ferramentas", href: "/ferramentas" },
      { label: "Soluções Rápidas", href: "/solucoes-rapidas" },
      { label: "Contato", href: "/contato" },
    ],
    legal: [
      { label: "Política de Privacidade", href: "#" },
      { label: "Termos de Uso", href: "#" },
      { label: "Sobre Nós", href: "#" },
    ],
  };

  return (
    <footer className="bg-[#18181B] border-t border-[#27272A] mt-20" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-['Outfit'] font-bold text-xl text-white">
                Tutoria <span className="text-[#8B5CF6]">Fácil</span>
              </span>
            </Link>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Seu portal de tutoriais de tecnologia com IA integrada. 
              Aprenda a resolver problemas e ganhar dinheiro online.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors" aria-label="Github">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors" aria-label="Youtube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:contato@tutoriafacil.com" className="text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Tutoriais */}
          <div>
            <h3 className="font-['Outfit'] font-semibold text-white mb-4">Tutoriais</h3>
            <ul className="space-y-3">
              {footerLinks.tutoriais.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-['Outfit'] font-semibold text-white mb-4">Recursos</h3>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-['Outfit'] font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#A1A1AA] hover:text-[#8B5CF6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#A1A1AA]">
            © {currentYear} Tutoria Fácil. Todos os direitos reservados.
          </p>
          <p className="text-sm text-[#A1A1AA]">
            Feito com <span className="text-[#EF4444]">♥</span> em Moçambique
          </p>
        </div>
      </div>

      {/* AdSense Placeholder */}
      <div className="border-t border-[#27272A] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="adsense-placeholder" data-testid="footer-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
