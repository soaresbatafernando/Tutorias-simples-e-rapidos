from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBasic()

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# ==================== MODELS ====================

class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    icon: str = "folder"
    description: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon: str = "folder"
    description: str = ""

class Tag(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str

class Tutorial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    description: str
    content: str
    category_id: str
    tags: List[str] = []
    image_url: str = ""
    video_url: str = ""
    affiliate_links: List[dict] = []
    views: int = 0
    rating_sum: int = 0
    rating_count: int = 0
    is_featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TutorialCreate(BaseModel):
    title: str
    slug: str
    description: str
    content: str
    category_id: str
    tags: List[str] = []
    image_url: str = ""
    video_url: str = ""
    affiliate_links: List[dict] = []
    is_featured: bool = False

class TutorialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    affiliate_links: Optional[List[dict]] = None
    is_featured: Optional[bool] = None

class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tutorial_id: str
    name: str
    email: str
    content: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CommentCreate(BaseModel):
    tutorial_id: str
    name: str
    email: EmailStr
    content: str

class Rating(BaseModel):
    tutorial_id: str
    rating: int = Field(ge=1, le=5)

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    image_url: str = ""
    tags: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    image_url: str = ""
    tags: List[str] = []

class FAQ(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str = "geral"
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str = "geral"
    order: int = 0

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# ==================== ADMIN AUTH ====================

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (credentials.username == "admin" and correct_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return credentials.username

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    category = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return category

@api_router.post("/admin/categories", response_model=Category)
async def create_category(data: CategoryCreate, admin: str = Depends(verify_admin)):
    category = Category(**data.model_dump())
    await db.categories.insert_one(category.model_dump())
    return category

@api_router.delete("/admin/categories/{id}")
async def delete_category(id: str, admin: str = Depends(verify_admin)):
    result = await db.categories.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return {"message": "Categoria excluída"}

# ==================== TUTORIAL ROUTES ====================

@api_router.get("/tutorials", response_model=List[Tutorial])
async def get_tutorials(category: Optional[str] = None, featured: Optional[bool] = None, search: Optional[str] = None, limit: int = 50):
    query = {}
    if category:
        query["category_id"] = category
    if featured is not None:
        query["is_featured"] = featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    tutorials = await db.tutorials.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return tutorials

@api_router.get("/tutorials/{slug}")
async def get_tutorial(slug: str):
    tutorial = await db.tutorials.find_one({"slug": slug}, {"_id": 0})
    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial não encontrado")
    # Increment views
    await db.tutorials.update_one({"slug": slug}, {"$inc": {"views": 1}})
    tutorial["views"] = tutorial.get("views", 0) + 1
    return tutorial

@api_router.post("/admin/tutorials", response_model=Tutorial)
async def create_tutorial(data: TutorialCreate, admin: str = Depends(verify_admin)):
    tutorial = Tutorial(**data.model_dump())
    await db.tutorials.insert_one(tutorial.model_dump())
    return tutorial

@api_router.put("/admin/tutorials/{id}", response_model=Tutorial)
async def update_tutorial(id: str, data: TutorialUpdate, admin: str = Depends(verify_admin)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.tutorials.update_one({"id": id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tutorial não encontrado")
    tutorial = await db.tutorials.find_one({"id": id}, {"_id": 0})
    return tutorial

@api_router.delete("/admin/tutorials/{id}")
async def delete_tutorial(id: str, admin: str = Depends(verify_admin)):
    result = await db.tutorials.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tutorial não encontrado")
    return {"message": "Tutorial excluído"}

# ==================== RATING ROUTE ====================

@api_router.post("/tutorials/{slug}/rate")
async def rate_tutorial(slug: str, rating: Rating):
    if rating.rating < 1 or rating.rating > 5:
        raise HTTPException(status_code=400, detail="Rating deve ser entre 1 e 5")
    result = await db.tutorials.update_one(
        {"slug": slug},
        {"$inc": {"rating_sum": rating.rating, "rating_count": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tutorial não encontrado")
    return {"message": "Avaliação registrada"}

# ==================== COMMENT ROUTES ====================

@api_router.get("/tutorials/{tutorial_id}/comments", response_model=List[Comment])
async def get_comments(tutorial_id: str):
    comments = await db.comments.find({"tutorial_id": tutorial_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return comments

@api_router.post("/comments", response_model=Comment)
async def create_comment(data: CommentCreate):
    comment = Comment(**data.model_dump())
    await db.comments.insert_one(comment.model_dump())
    return comment

@api_router.delete("/admin/comments/{id}")
async def delete_comment(id: str, admin: str = Depends(verify_admin)):
    result = await db.comments.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comentário não encontrado")
    return {"message": "Comentário excluído"}

# ==================== BLOG ROUTES ====================

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts(limit: int = 20):
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return posts

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return post

@api_router.post("/admin/blog", response_model=BlogPost)
async def create_blog_post(data: BlogPostCreate, admin: str = Depends(verify_admin)):
    post = BlogPost(**data.model_dump())
    await db.blog_posts.insert_one(post.model_dump())
    return post

@api_router.delete("/admin/blog/{id}")
async def delete_blog_post(id: str, admin: str = Depends(verify_admin)):
    result = await db.blog_posts.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return {"message": "Post excluído"}

# ==================== FAQ ROUTES ====================

@api_router.get("/faqs", response_model=List[FAQ])
async def get_faqs(category: Optional[str] = None):
    query = {"category": category} if category else {}
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs

@api_router.post("/admin/faqs", response_model=FAQ)
async def create_faq(data: FAQCreate, admin: str = Depends(verify_admin)):
    faq = FAQ(**data.model_dump())
    await db.faqs.insert_one(faq.model_dump())
    return faq

@api_router.delete("/admin/faqs/{id}")
async def delete_faq(id: str, admin: str = Depends(verify_admin)):
    result = await db.faqs.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="FAQ não encontrado")
    return {"message": "FAQ excluído"}

# ==================== CONTACT ROUTES ====================

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact(data: ContactCreate):
    contact = ContactMessage(**data.model_dump())
    await db.contacts.insert_one(contact.model_dump())
    return contact

@api_router.get("/admin/contacts", response_model=List[ContactMessage])
async def get_contacts(admin: str = Depends(verify_admin)):
    contacts = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return contacts

# ==================== AI CHAT ROUTE ====================

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(data: ChatMessage):
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="API key não configurada")
    
    session_id = data.session_id or str(uuid.uuid4())
    
    # Get tutorials for context
    tutorials = await db.tutorials.find({}, {"_id": 0, "title": 1, "description": 1, "slug": 1}).to_list(20)
    faqs = await db.faqs.find({}, {"_id": 0, "question": 1, "answer": 1}).to_list(20)
    
    tutorials_context = "\n".join([f"- {t['title']}: {t['description']}" for t in tutorials])
    faqs_context = "\n".join([f"P: {f['question']}\nR: {f['answer']}" for f in faqs])
    
    system_message = f"""Você é o assistente virtual do Tutoria Fácil, um portal de tutoriais de tecnologia.
Seu papel é ajudar os visitantes com dúvidas sobre tecnologia, celulares, computadores, internet e ganhar dinheiro online.
Seja sempre útil, amigável e forneça respostas claras e detalhadas em português.

Tutoriais disponíveis no site:
{tutorials_context}

Perguntas frequentes:
{faqs_context}

Se a pergunta for relacionada a algum tutorial disponível, sugira o tutorial específico.
Responda de forma concisa mas completa. Use markdown para formatação quando apropriado."""

    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message
    ).with_model("gemini", "gemini-3-flash-preview")
    
    user_message = UserMessage(text=data.message)
    response = await chat.send_message(user_message)
    
    return ChatResponse(response=response, session_id=session_id)

# ==================== SEED DATA ====================

@api_router.post("/admin/seed")
async def seed_data(admin: str = Depends(verify_admin)):
    # Categories
    categories_data = [
        {"name": "Computador", "slug": "computador", "icon": "monitor", "description": "Tutoriais sobre PCs e notebooks"},
        {"name": "Celular", "slug": "celular", "icon": "smartphone", "description": "Dicas para smartphones e tablets"},
        {"name": "Internet", "slug": "internet", "icon": "wifi", "description": "Tutoriais sobre internet e redes"},
        {"name": "Ganhar Dinheiro", "slug": "ganhar-dinheiro", "icon": "dollar-sign", "description": "Como ganhar dinheiro online"},
        {"name": "Programação", "slug": "programacao", "icon": "code", "description": "Tutoriais de programação"},
    ]
    
    for cat_data in categories_data:
        existing = await db.categories.find_one({"slug": cat_data["slug"]})
        if not existing:
            cat = Category(**cat_data)
            await db.categories.insert_one(cat.model_dump())
    
    # Tutorials
    tutorials_data = [
        {
            "title": "Como Formatar um PC Windows",
            "slug": "como-formatar-pc-windows",
            "description": "Guia completo passo a passo para formatar seu computador Windows e reinstalar o sistema",
            "content": """# Como Formatar um PC Windows

## Introdução
Formatar o PC é uma solução eficaz para resolver problemas de lentidão, vírus ou simplesmente começar do zero.

## O que você vai precisar
- Pendrive com pelo menos 8GB
- Backup dos seus arquivos importantes
- Chave de licença do Windows (se aplicável)

## Passo 1: Faça Backup dos Dados
Antes de formatar, copie todos os arquivos importantes para um HD externo ou nuvem.

## Passo 2: Crie um Pendrive Bootável
1. Baixe a ferramenta de criação de mídia da Microsoft
2. Execute e selecione "Criar mídia de instalação"
3. Escolha o pendrive como destino

## Passo 3: Configure a BIOS
1. Reinicie o PC e pressione F2, F12 ou DEL
2. Vá em Boot Options
3. Coloque o USB como primeira opção

## Passo 4: Instale o Windows
1. Reinicie com o pendrive conectado
2. Siga as instruções na tela
3. Escolha "Instalação personalizada"
4. Delete todas as partições e crie novas

## Conclusão
Após a instalação, instale os drivers e seus programas favoritos.""",
            "category_id": "computador",
            "tags": ["windows", "formatação", "instalação", "pc"],
            "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            "is_featured": True
        },
        {
            "title": "Como Criar um Site com Inteligência Artificial",
            "slug": "como-criar-site-com-ia",
            "description": "Aprenda a usar ferramentas de IA para criar seu próprio site sem programar",
            "content": """# Como Criar um Site com Inteligência Artificial

## Introdução
A inteligência artificial revolucionou a criação de sites. Agora qualquer pessoa pode criar um site profissional.

## Ferramentas Recomendadas
- **Wix ADI**: Cria sites automaticamente baseado nas suas respostas
- **Framer AI**: Design moderno com IA
- **Emergent**: Desenvolvimento completo com IA

## Passo 1: Defina o Objetivo
Decida o tipo de site:
- Portfolio pessoal
- Loja virtual
- Blog
- Site institucional

## Passo 2: Escolha a Ferramenta
Para iniciantes, recomendamos o Wix ADI pela simplicidade.

## Passo 3: Responda as Perguntas
A IA vai perguntar sobre:
- Seu nicho de mercado
- Cores preferidas
- Funcionalidades necessárias

## Passo 4: Personalize
Após a criação automática:
- Edite textos
- Troque imagens
- Ajuste cores

## Passo 5: Publique
Configure um domínio e publique seu site!""",
            "category_id": "programacao",
            "tags": ["ia", "site", "web", "inteligência artificial"],
            "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
            "is_featured": True
        },
        {
            "title": "Como Ganhar Dinheiro Online em Moçambique",
            "slug": "ganhar-dinheiro-online-mocambique",
            "description": "Métodos comprovados para ganhar dinheiro pela internet em Moçambique",
            "content": """# Como Ganhar Dinheiro Online em Moçambique

## Introdução
O mercado digital oferece várias oportunidades para moçambicanos ganharem dinheiro online.

## Método 1: Freelancing
Plataformas como Upwork e Fiverr permitem oferecer serviços:
- Design gráfico
- Redação
- Tradução
- Programação

## Método 2: Marketing de Afiliados
Promova produtos e ganhe comissões:
- Hotmart
- Monetizze
- Amazon Associates

## Método 3: Criação de Conteúdo
- YouTube: monetização após 1000 inscritos
- TikTok: fundo de criadores
- Blog: Google AdSense

## Método 4: Vendas Online
- Crie uma loja no Instagram
- Use marketplaces locais
- Dropshipping internacional

## Método 5: Ensino Online
Crie cursos sobre o que você sabe:
- Udemy
- Hotmart
- Teachable

## Dicas Importantes
1. Tenha paciência - resultados levam tempo
2. Invista em aprendizado
3. Use métodos de pagamento internacionais (Payoneer, Wise)
4. Comece com o que você já sabe fazer""",
            "category_id": "ganhar-dinheiro",
            "tags": ["dinheiro", "online", "moçambique", "renda extra"],
            "image_url": "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800",
            "is_featured": True
        },
        {
            "title": "Como Liberar Espaço no Celular Android",
            "slug": "liberar-espaco-celular-android",
            "description": "Dicas práticas para liberar memória e acelerar seu smartphone Android",
            "content": """# Como Liberar Espaço no Celular Android

## Por que o celular fica cheio?
- Fotos e vídeos
- Cache de aplicativos
- Downloads esquecidos
- Aplicativos não utilizados

## Método 1: Limpar Cache
1. Vá em Configurações > Armazenamento
2. Toque em "Dados em cache"
3. Confirme a limpeza

## Método 2: Google Files
1. Instale o Google Files
2. Use a função "Limpar"
3. Remova arquivos duplicados

## Método 3: Mover para Nuvem
1. Ative backup do Google Fotos
2. Delete fotos locais após backup
3. Use Google Drive para documentos

## Método 4: Desinstalar Apps
1. Identifique apps não utilizados
2. Desinstale ou desative

## Método 5: Cartão SD
Se seu celular suporta:
1. Mova apps para SD
2. Configure câmera para salvar no SD

## Resultado Esperado
Você pode liberar de 2GB a 10GB dependendo do uso.""",
            "category_id": "celular",
            "tags": ["android", "memória", "armazenamento", "limpeza"],
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            "is_featured": False
        },
        {
            "title": "Como Configurar Wi-Fi Mais Rápido",
            "slug": "configurar-wifi-mais-rapido",
            "description": "Otimize sua rede Wi-Fi e tenha internet mais rápida em casa",
            "content": """# Como Configurar Wi-Fi Mais Rápido

## Diagnóstico Inicial
Teste sua velocidade atual em speedtest.net

## Dica 1: Posição do Roteador
- Coloque em local central
- Evite paredes grossas
- Mantenha longe de microondas

## Dica 2: Canal Wi-Fi
1. Acesse 192.168.0.1 ou 192.168.1.1
2. Vá em configurações wireless
3. Teste canais 1, 6 ou 11 (2.4GHz)
4. Para 5GHz, escolha canais menos congestionados

## Dica 3: Atualizar Firmware
Fabricantes lançam atualizações de segurança e performance.

## Dica 4: Usar 5GHz
Se seu roteador suporta:
- 5GHz = mais rápido, menor alcance
- 2.4GHz = mais alcance, mais interferência

## Dica 5: Extensores de Sinal
Para casas grandes, considere:
- Repetidores Wi-Fi
- Sistema Mesh
- Powerline

## Dica 6: Trocar DNS
Use DNS mais rápidos:
- Google: 8.8.8.8
- Cloudflare: 1.1.1.1""",
            "category_id": "internet",
            "tags": ["wifi", "internet", "velocidade", "roteador"],
            "image_url": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800",
            "is_featured": False
        }
    ]
    
    for tut_data in tutorials_data:
        # Find category id
        cat = await db.categories.find_one({"slug": tut_data["category_id"]})
        if cat:
            tut_data["category_id"] = cat["id"]
        existing = await db.tutorials.find_one({"slug": tut_data["slug"]})
        if not existing:
            tut = Tutorial(**tut_data)
            await db.tutorials.insert_one(tut.model_dump())
    
    # FAQs
    faqs_data = [
        {"question": "Como faço para resetar meu celular?", "answer": "Vá em Configurações > Sistema > Redefinir > Restaurar padrão de fábrica. Lembre-se de fazer backup antes!", "category": "celular"},
        {"question": "O que fazer quando o PC está lento?", "answer": "1. Limpe arquivos temporários\n2. Desative programas de inicialização\n3. Verifique por vírus\n4. Considere adicionar mais RAM ou SSD", "category": "computador"},
        {"question": "Como melhorar a velocidade da internet?", "answer": "Reinicie o roteador, posicione-o em local central, use cabo ethernet quando possível e verifique se há muitos dispositivos conectados.", "category": "internet"},
        {"question": "Como proteger minha conta de hackers?", "answer": "Use senhas fortes e únicas, ative autenticação de dois fatores, não clique em links suspeitos e mantenha seus dispositivos atualizados.", "category": "geral"},
        {"question": "É possível ganhar dinheiro assistindo vídeos?", "answer": "Sim, existem plataformas que pagam por assistir vídeos, mas os ganhos são baixos. Considere métodos mais rentáveis como freelancing ou criação de conteúdo.", "category": "ganhar-dinheiro"},
    ]
    
    for faq_data in faqs_data:
        existing = await db.faqs.find_one({"question": faq_data["question"]})
        if not existing:
            faq = FAQ(**faq_data)
            await db.faqs.insert_one(faq.model_dump())
    
    # Blog posts
    blog_data = [
        {
            "title": "5 Tendências de Tecnologia para 2025",
            "slug": "tendencias-tecnologia-2025",
            "excerpt": "Descubra as principais tendências tecnológicas que vão dominar o próximo ano",
            "content": """# 5 Tendências de Tecnologia para 2025

## 1. Inteligência Artificial Generativa
A IA está cada vez mais presente no dia a dia, desde assistentes virtuais até criação de conteúdo.

## 2. Computação Quântica
Empresas como IBM e Google estão avançando rapidamente nesta área.

## 3. Internet das Coisas (IoT)
Casas inteligentes e cidades conectadas são o futuro.

## 4. Realidade Aumentada
AR vai transformar como compramos e aprendemos.

## 5. Blockchain e Web3
Além das criptomoedas, a tecnologia blockchain tem várias aplicações.

Fique atento a essas tendências para não ficar para trás!""",
            "image_url": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
            "tags": ["tecnologia", "tendências", "2025", "ia"]
        }
    ]
    
    for blog in blog_data:
        existing = await db.blog_posts.find_one({"slug": blog["slug"]})
        if not existing:
            post = BlogPost(**blog)
            await db.blog_posts.insert_one(post.model_dump())
    
    return {"message": "Dados iniciais criados com sucesso"}

# ==================== STATS ====================

@api_router.get("/stats")
async def get_stats():
    tutorials_count = await db.tutorials.count_documents({})
    categories_count = await db.categories.count_documents({})
    comments_count = await db.comments.count_documents({})
    faqs_count = await db.faqs.count_documents({})
    return {
        "tutorials": tutorials_count,
        "categories": categories_count,
        "comments": comments_count,
        "faqs": faqs_count
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Tutoria Fácil API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
