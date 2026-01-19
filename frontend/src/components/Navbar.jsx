import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Monitor, Smartphone, Wifi, DollarSign, Code, Zap, BookOpen, Wrench, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { path: "/", label: "Home", icon: Home },
  { path: "/tutoriais", label: "Tutoriais", icon: BookOpen },
  { path: "/solucoes-rapidas", label: "Soluções Rápidas", icon: Zap },
  { path: "/blog", label: "Blog", icon: BookOpen },
  { path: "/ferramentas", label: "Ferramentas", icon: Wrench },
  { path: "/contato", label: "Contato", icon: Mail },
];

const categories = [
  { slug: "computador", name: "Computador", icon: Monitor },
  { slug: "celular", name: "Celular", icon: Smartphone },
  { slug: "internet", name: "Internet", icon: Wifi },
  { slug: "ganhar-dinheiro", name: "Ganhar Dinheiro", icon: DollarSign },
  { slug: "programacao", name: "Programação", icon: Code },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo-link">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-['Outfit'] font-bold text-xl text-white">
              Tutoria <span className="text-[#8B5CF6]">Fácil</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              link.path === "/tutoriais" ? (
                <DropdownMenu key={link.path}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? "text-white bg-white/5"
                          : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                      }`}
                      data-testid={`nav-${link.path.replace("/", "")}`}
                    >
                      {link.label}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#18181B] border-[#27272A]">
                    <DropdownMenuItem asChild>
                      <Link to="/tutoriais" className="flex items-center gap-2 cursor-pointer">
                        <BookOpen className="w-4 h-4" />
                        Todos os Tutoriais
                      </Link>
                    </DropdownMenuItem>
                    {categories.map((cat) => (
                      <DropdownMenuItem key={cat.slug} asChild>
                        <Link to={`/tutoriais?categoria=${cat.slug}`} className="flex items-center gap-2 cursor-pointer">
                          <cat.icon className="w-4 h-4" />
                          {cat.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? "text-white bg-white/5"
                      : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                  }`}
                  data-testid={`nav-${link.path.replace("/", "") || "home"}`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-20 bg-[#09090B] z-40 transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="mobile-menu"
      >
        <div className="p-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive(link.path)
                  ? "text-white bg-[#8B5CF6]/20"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}
              data-testid={`mobile-nav-${link.path.replace("/", "") || "home"}`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-[#27272A]">
            <p className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Categorias
            </p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/tutoriais?categoria=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#A1A1AA] hover:text-white hover:bg-white/5"
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
