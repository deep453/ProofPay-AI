import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNavigation from './MobileNavigation';
import AIChatDrawer from '../ai/AIChatDrawer';
import ToastContainer from '../common/ToastContainer';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar onOpenAIChat={() => setAiChatOpen(true)} />
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAIChat={() => setAiChatOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenAIChat={() => setAiChatOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
          <Outlet context={{ openAIChat: () => setAiChatOpen(true) }} />
        </main>
      </div>

      {/* Floating Global AI Chatbot Drawer */}
      <AIChatDrawer isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
