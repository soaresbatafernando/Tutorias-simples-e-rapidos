import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

// Pages
import HomePage from "@/pages/HomePage";
import TutorialsPage from "@/pages/TutorialsPage";
import TutorialDetailPage from "@/pages/TutorialDetailPage";
import QuickSolutionsPage from "@/pages/QuickSolutionsPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import ToolsPage from "@/pages/ToolsPage";
import ContactPage from "@/pages/ContactPage";
import AdminPage from "@/pages/AdminPage";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import BackToTop from "@/components/BackToTop";

function App() {
  return (
    <div className="min-h-screen bg-[#09090B] noise-bg">
      <BrowserRouter>
        <Navbar />
        <main className="pt-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tutoriais" element={<TutorialsPage />} />
            <Route path="/tutoriais/:slug" element={<TutorialDetailPage />} />
            <Route path="/solucoes-rapidas" element={<QuickSolutionsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/ferramentas" element={<ToolsPage />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
        <BackToTop />
        <Toaster position="top-right" theme="dark" />
      </BrowserRouter>
    </div>
  );
}

export default App;
