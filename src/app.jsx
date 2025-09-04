// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layouts
import MainLayout from "./layouts/MainLayout";
import RelationshipLayout from "./layouts/RelationshipLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RelationshipRoutes from "./routes/RelationshipRoutes";

// UI Components
import PageWrapper from "./components/PageWrapper";

// Animations
import { slideUp, slideRight, scaleFade, pageFade } from "./config/animations";

// Core Pages
import Home from "./pages/Home";
import DashboardHome from "./pages/DashboardHome";
import NotFound from "./pages/NotFound";

// Context
import { LoadingProvider, useLoading } from "./context/LoadingContext";

// Lazy-loaded AI Modules
const ChatAI = lazy(() => import("./modules/Chat/ChatModule"));
const TranslateAI = lazy(() => import("./pages/trackingAI"));
const PredictAI = lazy(() => import("./pages/predictAI"));
const RecommendAI = lazy(() => import("./pages/recommend"));
const HealthAI = lazy(() => import("./pages/healthAI"));
const ContentAI = lazy(() => import("./modules/ContentCreator/ContentCreator"));
const AdvertisingAI = lazy(() => import("./pages/advertising"));
const MusicAI = lazy(() => import("./modules/Music/MusicAI"));
const FaceDetectAI = lazy(() => import("./modules/FaceDetection/FaceDetection"));
const ImageClassifyAI = lazy(() => import("./modules/ImageClassifier/ImageClassifier"));
const VoiceAssistant = lazy(() => import("./modules/Voice/VoiceAssistant"));
const ProgressiveAI = lazy(() => import("./components/ProgressivelearningAI"));

/* 🔹 Component that hooks into router to trigger Loading overlay */
function RouteChangeHandler() {
  const { setLoading } = useLoading();
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Show loading when navigation starts
    setLoading(true);

    // Hide after short delay (when new component mounts)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location, navigationType, setLoading]);

  return null;
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <RouteChangeHandler /> {/* 👈 listens to navigation */}
        <AnimatePresence mode="wait">
          <Suspense fallback={null}> {/* handled via context */}
            <Routes>
              {/* 🧠 GENERAL AI MODULES (MainLayout) */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<PageWrapper animation={pageFade}><Home /></PageWrapper>} />
                <Route path="/chat" element={<PageWrapper animation={slideUp}><ChatAI /></PageWrapper>} />
                <Route path="/translate" element={<PageWrapper animation={slideRight}><TranslateAI /></PageWrapper>} />
                <Route path="/predict" element={<PageWrapper animation={scaleFade}><PredictAI /></PageWrapper>} />
                <Route path="/recommend" element={<PageWrapper animation={slideRight}><RecommendAI /></PageWrapper>} />
                <Route path="/health" element={<PageWrapper animation={slideUp}><HealthAI /></PageWrapper>} />
                <Route path="/content" element={<PageWrapper animation={scaleFade}><ContentAI /></PageWrapper>} />
                <Route path="/advertising" element={<PageWrapper animation={slideRight}><AdvertisingAI /></PageWrapper>} />
                <Route path="/music" element={<PageWrapper animation={scaleFade}><MusicAI /></PageWrapper>} />
                <Route path="/face-detect" element={<PageWrapper animation={slideUp}><FaceDetectAI /></PageWrapper>} />
                <Route path="/image-classify" element={<PageWrapper animation={slideUp}><ImageClassifyAI /></PageWrapper>} />
                <Route path="/voice-assistant" element={<PageWrapper animation={pageFade}><VoiceAssistant /></PageWrapper>} />
                <Route path="/progressive-ai" element={<PageWrapper animation={slideRight}><ProgressiveAI /></PageWrapper>} />
              </Route>

              {/* ❤️ RELATIONSHIP MODULE */}
              <Route path="/relationship/*" element={<RelationshipLayout />}>
                <Route path="*" element={<RelationshipRoutes />} />
              </Route>

              {/* 📊 DASHBOARD ROUTES (Admin or Internal Use) */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<PageWrapper animation={pageFade}><DashboardHome /></PageWrapper>} />
              </Route>

              {/* ❌ CATCH ALL */}
              <Route path="*" element={<PageWrapper animation={pageFade}><NotFound /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </LoadingProvider>
    </Router>
  );
}

export default App;