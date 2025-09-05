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

// 🔹 Lazy-loaded AI Modules
const ChatAI = lazy(() => import("./modules/Chat/ChatModule"));
const TrackingAI = lazy(() => import("./modules/TrackingAI"));
const PredictAI = lazy(() => import("./modules/Predict"));
const RecommendAI = lazy(() => import("./modules/Recommend"));
const HealthAI = lazy(() => import("./modules/HealthAI")); // ✅ moved from /pages to /modules
const ContentAI = lazy(() => import("./modules/ContentCreator/ContentCreator"));
const AdvertisingAI = lazy(() => import("./modules/Advertising")); // ✅ moved from /pages to /modules
const MusicAI = lazy(() => import("./modules/MusicModule")); // ✅ points to MusicModule.tsx
const FaceDetectAI = lazy(() => import("./modules/FaceDetection")); // ✅ corrected path
const ImageClassifyAI = lazy(() => import("./modules/ImageClassifier")); // ✅ corrected path
const VoiceAssistant = lazy(() => import("./modules/VoiceAssistant"));
const ProgressiveAI = lazy(() => import("./modules/ProgressiveLearningAI"));
const LiveTranslatorTabs = lazy(() => import("./modules/LiveTranslatorTabs"));

/* 🔹 Handles route change loading state */
function RouteChangeHandler() {
  const { setLoading } = useLoading();
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location, navigationType, setLoading]);

  return null;
}

function App() {
  return (
    <Router>
      <LoadingProvider>
        <RouteChangeHandler />
        <AnimatePresence mode="wait">
          <Suspense fallback={null}>
            <Routes>
              {/* 🧠 GENERAL AI MODULES */}
              <Route element={<MainLayout />}>
                <Route
                  path="/"
                  element={
                    <PageWrapper animation={pageFade}>
                      <Home />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <PageWrapper animation={slideUp}>
                      <ChatAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/translate"
                  element={
                    <PageWrapper animation={slideRight}>
                      <LiveTranslatorTabs />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/predict"
                  element={
                    <PageWrapper animation={scaleFade}>
                      <PredictAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/recommend"
                  element={
                    <PageWrapper animation={slideRight}>
                      <RecommendAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/health"
                  element={
                    <PageWrapper animation={slideUp}>
                      <HealthAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/content"
                  element={
                    <PageWrapper animation={scaleFade}>
                      <ContentAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/advertising"
                  element={
                    <PageWrapper animation={slideRight}>
                      <AdvertisingAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/music"
                  element={
                    <PageWrapper animation={scaleFade}>
                      <MusicAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/face-detect"
                  element={
                    <PageWrapper animation={slideUp}>
                      <FaceDetectAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/image-classify"
                  element={
                    <PageWrapper animation={slideUp}>
                      <ImageClassifyAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/voice-assistant"
                  element={
                    <PageWrapper animation={pageFade}>
                      <VoiceAssistant />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/progressive-ai"
                  element={
                    <PageWrapper animation={slideRight}>
                      <ProgressiveAI />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/tracking"
                  element={
                    <PageWrapper animation={slideUp}>
                      <TrackingAI />
                    </PageWrapper>
                  }
                />
              </Route>

              {/* ❤️ RELATIONSHIP MODULE */}
              <Route path="/relationship/*" element={<RelationshipLayout />}>
                <Route path="*" element={<RelationshipRoutes />} />
              </Route>

              {/* 📊 DASHBOARD ROUTES */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route
                  index
                  element={
                    <PageWrapper animation={pageFade}>
                      <DashboardHome />
                    </PageWrapper>
                  }
                />
              </Route>

              {/* ❌ 404 */}
              <Route
                path="*"
                element={
                  <PageWrapper animation={pageFade}>
                    <NotFound />
                  </PageWrapper>
                }
              />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </LoadingProvider>
    </Router>
  );
}

export default App;