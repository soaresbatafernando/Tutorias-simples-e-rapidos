import { ExternalLink, Wrench, Calculator, FileText, Globe, Palette, Code, Shield, Zap } from "lucide-react";

const tools = [
  {
    name: "Teste de Velocidade",
    description: "Verifique a velocidade da sua internet em segundos",
    icon: Zap,
    url: "https://www.speedtest.net/",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Conversor de Arquivos",
    description: "Converta documentos, imagens, vídeos e áudio online",
    icon: FileText,
    url: "https://cloudconvert.com/",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Verificar Site Seguro",
    description: "Verifique se um site é seguro antes de acessar",
    icon: Shield,
    url: "https://www.urlvoid.com/",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Encurtador de Links",
    description: "Encurte links longos para compartilhar facilmente",
    icon: Globe,
    url: "https://bitly.com/",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Paleta de Cores",
    description: "Gere paletas de cores para seus projetos",
    icon: Palette,
    url: "https://coolors.co/",
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "Editor de Código Online",
    description: "Escreva e teste código diretamente no navegador",
    icon: Code,
    url: "https://codepen.io/",
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Calculadora Online",
    description: "Calculadora científica e conversões",
    icon: Calculator,
    url: "https://www.desmos.com/scientific",
    color: "from-teal-500 to-green-500",
  },
  {
    name: "Removedor de Fundo",
    description: "Remova o fundo de imagens automaticamente",
    icon: Wrench,
    url: "https://www.remove.bg/",
    color: "from-rose-500 to-pink-500",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="tools-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-['Outfit'] text-3xl sm:text-4xl font-bold text-white">
                Ferramentas
              </h1>
            </div>
          </div>
          <p className="text-[#A1A1AA] text-lg">
            Recursos úteis e gratuitos para o seu dia a dia digital
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group p-6 hover:border-[#8B5CF6]/50"
              data-testid={`tool-${tool.name.toLowerCase().replace(/\s/g, "-")}`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="font-['Outfit'] font-semibold text-white mb-2 flex items-center gap-2">
                {tool.name}
                <ExternalLink className="w-4 h-4 text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              
              <p className="text-sm text-[#A1A1AA]">
                {tool.description}
              </p>
            </a>
          ))}
        </div>

        {/* Tech Workspace Image Section */}
        <section className="mt-16">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1759661881353-5b9cc55e1cf4?w=1920&q=80"
              alt="Tech Workspace"
              className="w-full h-64 lg:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h2 className="font-['Outfit'] text-2xl font-bold text-white mb-2">
                Mais ferramentas em breve
              </h2>
              <p className="text-[#A1A1AA]">
                Estamos sempre adicionando novas ferramentas úteis para você
              </p>
            </div>
          </div>
        </section>

        {/* AdSense */}
        <div className="mt-12">
          <div className="adsense-placeholder" data-testid="tools-adsense">
            Espaço reservado para Google AdSense
          </div>
        </div>
      </div>
    </div>
  );
}
