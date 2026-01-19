import { useState, useEffect } from "react";
import { Lock, Plus, Trash2, Edit, BookOpen, HelpCircle, FileText, FolderOpen, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  
  // Data states
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [tutorialForm, setTutorialForm] = useState({
    title: "", slug: "", description: "", content: "", category_id: "",
    tags: "", image_url: "", video_url: "", is_featured: false,
  });
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon: "folder", description: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "geral", order: 0 });
  const [blogForm, setBlogForm] = useState({ title: "", slug: "", excerpt: "", content: "", image_url: "", tags: "" });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const authHeader = {
    auth: { username: "admin", password },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    
    try {
      await axios.get(`${API}/admin/contacts`, authHeader);
      setIsAuthenticated(true);
      fetchAllData();
    } catch (error) {
      if (error.response?.status === 401) {
        setAuthError("Senha incorreta");
      } else {
        setAuthError("Erro ao autenticar");
      }
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [tutorialsRes, categoriesRes, faqsRes, blogRes, contactsRes] = await Promise.all([
        axios.get(`${API}/tutorials`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/faqs`),
        axios.get(`${API}/blog`),
        axios.get(`${API}/admin/contacts`, authHeader),
      ]);
      setTutorials(tutorialsRes.data);
      setCategories(categoriesRes.data);
      setFaqs(faqsRes.data);
      setBlogPosts(blogRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const seedData = async () => {
    try {
      await axios.post(`${API}/admin/seed`, {}, authHeader);
      toast.success("Dados iniciais criados!");
      fetchAllData();
    } catch (error) {
      console.error("Error seeding data:", error);
      toast.error("Erro ao criar dados iniciais");
    }
  };

  // Tutorial CRUD
  const handleTutorialSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...tutorialForm,
        tags: tutorialForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      await axios.post(`${API}/admin/tutorials`, data, authHeader);
      toast.success("Tutorial criado!");
      setTutorialForm({ title: "", slug: "", description: "", content: "", category_id: "", tags: "", image_url: "", video_url: "", is_featured: false });
      setIsDialogOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Error creating tutorial:", error);
      toast.error("Erro ao criar tutorial");
    }
  };

  const deleteTutorial = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este tutorial?")) return;
    try {
      await axios.delete(`${API}/admin/tutorials/${id}`, authHeader);
      toast.success("Tutorial excluído!");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      toast.error("Erro ao excluir tutorial");
    }
  };

  // Category CRUD
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/categories`, categoryForm, authHeader);
      toast.success("Categoria criada!");
      setCategoryForm({ name: "", slug: "", icon: "folder", description: "" });
      setIsDialogOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Erro ao criar categoria");
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await axios.delete(`${API}/admin/categories/${id}`, authHeader);
      toast.success("Categoria excluída!");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  // FAQ CRUD
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/faqs`, faqForm, authHeader);
      toast.success("FAQ criada!");
      setFaqForm({ question: "", answer: "", category: "geral", order: 0 });
      setIsDialogOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Error creating FAQ:", error);
      toast.error("Erro ao criar FAQ");
    }
  };

  const deleteFaq = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta FAQ?")) return;
    try {
      await axios.delete(`${API}/admin/faqs/${id}`, authHeader);
      toast.success("FAQ excluída!");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Erro ao excluir FAQ");
    }
  };

  // Blog CRUD
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...blogForm,
        tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      await axios.post(`${API}/admin/blog`, data, authHeader);
      toast.success("Post criado!");
      setBlogForm({ title: "", slug: "", excerpt: "", content: "", image_url: "", tags: "" });
      setIsDialogOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Erro ao criar post");
    }
  };

  const deleteBlogPost = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    try {
      await axios.delete(`${API}/admin/blog/${id}`, authHeader);
      toast.success("Post excluído!");
      fetchAllData();
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Erro ao excluir post");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="admin-login">
        <div className="card p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#8B5CF6]" />
            </div>
          </div>
          <h1 className="font-['Outfit'] text-2xl font-bold text-white text-center mb-2">
            Painel Administrativo
          </h1>
          <p className="text-[#A1A1AA] text-center mb-6">
            Digite a senha para acessar
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="bg-[#27272A] border-transparent focus:border-[#8B5CF6] text-white"
              data-testid="admin-password-input"
            />
            {authError && (
              <p className="text-sm text-red-500">{authError}</p>
            )}
            <Button type="submit" className="btn-primary w-full" data-testid="admin-login-btn">
              Entrar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Outfit'] text-3xl font-bold text-white">
              Painel Administrativo
            </h1>
            <p className="text-[#A1A1AA]">Gerencie o conteúdo do site</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchAllData} variant="outline" className="border-[#27272A] text-white" data-testid="refresh-btn">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={seedData} className="btn-primary" data-testid="seed-btn">
              Criar Dados Iniciais
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tutorials" className="space-y-6">
          <TabsList className="bg-[#18181B] border border-[#27272A]">
            <TabsTrigger value="tutorials" className="data-[state=active]:bg-[#8B5CF6]">
              <BookOpen className="w-4 h-4 mr-2" />
              Tutoriais ({tutorials.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-[#8B5CF6]">
              <FolderOpen className="w-4 h-4 mr-2" />
              Categorias ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="faqs" className="data-[state=active]:bg-[#8B5CF6]">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQs ({faqs.length})
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-[#8B5CF6]">
              <FileText className="w-4 h-4 mr-2" />
              Blog ({blogPosts.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-[#8B5CF6]">
              <Mail className="w-4 h-4 mr-2" />
              Contatos ({contacts.length})
            </TabsTrigger>
          </TabsList>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Outfit'] font-semibold text-xl text-white">Tutoriais</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-primary" data-testid="add-tutorial-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Tutorial
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#18181B] border-[#27272A] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Novo Tutorial</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTutorialSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Título"
                          value={tutorialForm.title}
                          onChange={(e) => setTutorialForm({ ...tutorialForm, title: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                          required
                        />
                        <Input
                          placeholder="Slug (url)"
                          value={tutorialForm.slug}
                          onChange={(e) => setTutorialForm({ ...tutorialForm, slug: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                          required
                        />
                      </div>
                      <Input
                        placeholder="Descrição curta"
                        value={tutorialForm.description}
                        onChange={(e) => setTutorialForm({ ...tutorialForm, description: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                        required
                      />
                      <Textarea
                        placeholder="Conteúdo (Markdown)"
                        value={tutorialForm.content}
                        onChange={(e) => setTutorialForm({ ...tutorialForm, content: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white min-h-[200px]"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          value={tutorialForm.category_id}
                          onValueChange={(v) => setTutorialForm({ ...tutorialForm, category_id: v })}
                        >
                          <SelectTrigger className="bg-[#27272A] border-transparent text-white">
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#18181B] border-[#27272A]">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Tags (separadas por vírgula)"
                          value={tutorialForm.tags}
                          onChange={(e) => setTutorialForm({ ...tutorialForm, tags: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="URL da imagem"
                          value={tutorialForm.image_url}
                          onChange={(e) => setTutorialForm({ ...tutorialForm, image_url: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                        />
                        <Input
                          placeholder="URL do vídeo (embed)"
                          value={tutorialForm.video_url}
                          onChange={(e) => setTutorialForm({ ...tutorialForm, video_url: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tutorialForm.is_featured}
                          onCheckedChange={(v) => setTutorialForm({ ...tutorialForm, is_featured: v })}
                        />
                        <Label className="text-white">Destaque na home</Label>
                      </div>
                      <Button type="submit" className="btn-primary w-full">Criar Tutorial</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="spinner mx-auto" />
                </div>
              ) : tutorials.length === 0 ? (
                <p className="text-[#A1A1AA] text-center py-8">Nenhum tutorial cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {tutorials.map((tutorial) => (
                    <div key={tutorial.id} className="flex items-center justify-between p-4 bg-[#27272A] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{tutorial.title}</h3>
                        <p className="text-sm text-[#A1A1AA]">/{tutorial.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {tutorial.is_featured && (
                          <span className="text-xs px-2 py-1 bg-[#8B5CF6]/20 text-[#8B5CF6] rounded">Destaque</span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTutorial(tutorial.id)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Outfit'] font-semibold text-xl text-white">Categorias</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#18181B] border-[#27272A]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <Input
                        placeholder="Nome"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                        required
                      />
                      <Input
                        placeholder="Slug"
                        value={categoryForm.slug}
                        onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                        required
                      />
                      <Input
                        placeholder="Ícone (lucide)"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                      />
                      <Textarea
                        placeholder="Descrição"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                      />
                      <Button type="submit" className="btn-primary w-full">Criar Categoria</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {categories.length === 0 ? (
                <p className="text-[#A1A1AA] text-center py-8">Nenhuma categoria cadastrada</p>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-[#27272A] rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">{category.name}</h3>
                        <p className="text-sm text-[#A1A1AA]">/{category.slug}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Outfit'] font-semibold text-xl text-white">Perguntas Frequentes</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#18181B] border-[#27272A]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Nova FAQ</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFaqSubmit} className="space-y-4">
                      <Input
                        placeholder="Pergunta"
                        value={faqForm.question}
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                        required
                      />
                      <Textarea
                        placeholder="Resposta"
                        value={faqForm.answer}
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white min-h-[100px]"
                        required
                      />
                      <Select
                        value={faqForm.category}
                        onValueChange={(v) => setFaqForm({ ...faqForm, category: v })}
                      >
                        <SelectTrigger className="bg-[#27272A] border-transparent text-white">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#18181B] border-[#27272A]">
                          <SelectItem value="geral">Geral</SelectItem>
                          <SelectItem value="celular">Celular</SelectItem>
                          <SelectItem value="computador">Computador</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="ganhar-dinheiro">Ganhar Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" className="btn-primary w-full">Criar FAQ</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {faqs.length === 0 ? (
                <p className="text-[#A1A1AA] text-center py-8">Nenhuma FAQ cadastrada</p>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="flex items-center justify-between p-4 bg-[#27272A] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{faq.question}</h3>
                        <p className="text-sm text-[#A1A1AA] capitalize">{faq.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteFaq(faq.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Outfit'] font-semibold text-xl text-white">Posts do Blog</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#18181B] border-[#27272A] max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Novo Post</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="Título"
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                          required
                        />
                        <Input
                          placeholder="Slug"
                          value={blogForm.slug}
                          onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                          required
                        />
                      </div>
                      <Input
                        placeholder="Resumo"
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white"
                        required
                      />
                      <Textarea
                        placeholder="Conteúdo (Markdown)"
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="bg-[#27272A] border-transparent text-white min-h-[200px]"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="URL da imagem"
                          value={blogForm.image_url}
                          onChange={(e) => setBlogForm({ ...blogForm, image_url: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                        />
                        <Input
                          placeholder="Tags (separadas por vírgula)"
                          value={blogForm.tags}
                          onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                          className="bg-[#27272A] border-transparent text-white"
                        />
                      </div>
                      <Button type="submit" className="btn-primary w-full">Criar Post</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {blogPosts.length === 0 ? (
                <p className="text-[#A1A1AA] text-center py-8">Nenhum post cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-[#27272A] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{post.title}</h3>
                        <p className="text-sm text-[#A1A1AA]">/{post.slug}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteBlogPost(post.id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="card p-6">
              <h2 className="font-['Outfit'] font-semibold text-xl text-white mb-6">Mensagens de Contato</h2>

              {contacts.length === 0 ? (
                <p className="text-[#A1A1AA] text-center py-8">Nenhuma mensagem recebida</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 bg-[#27272A] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{contact.subject}</h3>
                        <span className="text-xs text-[#A1A1AA]">
                          {new Date(contact.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm text-[#A1A1AA] mb-2">
                        De: {contact.name} ({contact.email})
                      </p>
                      <p className="text-sm text-white whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
