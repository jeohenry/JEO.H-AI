// src/config/routesConfig.js
import React, { lazy } from "react";
import {
  FaHome,
  FaBrain,
  FaComments,
  FaGlobe,
  FaChartLine,
  FaHeartbeat,
  FaPalette,
  FaMusic,
  FaCompactDisc,
  FaUserCircle,
  FaMicrophone,
  FaRobot,
  FaTachometerAlt,
  FaHeart,
} from "react-icons/fa";

// 🔹 Animations
import { slideUp, slideRight, scaleFade, pageFade } from "./animations";

// 🔹 Lazy-loaded pages/modules
const Home = lazy(() => import("@/pages/Home"));
const ChatAI = lazy(() => import("@/modules/ChatModule"));
const LiveTranslatorTabs = lazy(() => import("@/modules/LiveTranslatorTabs"));
const PredictAI = lazy(() => import("@/modules/Predict"));
const RecommendAI = lazy(() => import("@/modules/Recommend"));
const ProgressiveAI = lazy(() => import("@/modules/ProgressiveLearningAI"));
const TrackingAI = lazy(() => import("@/modules/TrackingAI"));
const HealthAI = lazy(() => import("@/modules/HealthAI"));
const ContentAI = lazy(() => import("@/modules/ContentCreator"));
const AdvertisingAI = lazy(() => import("@/modules/Advertising"));
const MusicModule = lazy(() => import("@/modules/MusicModule"));
const MusicAI = lazy(() => import("@/modules/MusicAI"));
const FaceDetectAI = lazy(() => import("@/modules/FaceDetection"));
const ImageClassifyAI = lazy(() => import("@/modules/ImageClassifier"));
const VoiceAssistant = lazy(() => import("@/modules/VoiceAssistant"));
const RelationshipRoutes = lazy(() => import("@/routes/RelationshipRoutes"));

export const routesConfig = [
  {
    name: "Home",
    path: "/",
    icon: <FaHome />,
    component: Home,
    animation: pageFade,
  },
  {
    name: "Core AI",
    icon: <FaBrain />,
    children: [
      { name: "Chat", path: "/chat", icon: <FaComments />, component: ChatAI, animation: slideUp },
      { name: "Translate", path: "/translate", icon: <FaGlobe />, component: LiveTranslatorTabs, animation: slideRight },
      { name: "Predict", path: "/predict", icon: <FaBrain />, component: PredictAI, animation: scaleFade },
      { name: "Recommend", path: "/recommend", icon: <FaChartLine />, component: RecommendAI, animation: slideRight },
      { name: "Progressive AI", path: "/progressive-ai", icon: <FaBrain />, component: ProgressiveAI, animation: slideRight },
      { name: "Tracking", path: "/tracking", icon: <FaTachometerAlt />, component: TrackingAI, animation: slideUp },
    ],
  },
  {
    name: "Health",
    path: "/health",
    icon: <FaHeartbeat />,
    component: HealthAI,
    animation: slideUp,
  },
  {
    name: "Content",
    path: "/content",
    icon: <FaPalette />,
    component: ContentAI,
    animation: scaleFade,
  },
  {
    name: "Advertising",
    path: "/advertising",
    icon: <FaChartLine />,
    component: AdvertisingAI,
    animation: slideRight,
  },
  {
    name: "Music Tools",
    icon: <FaMusic />,
    children: [
      { name: "Music Generator", path: "/music", icon: <FaMusic />, component: MusicModule, animation: scaleFade },
      { name: "Music AI Analyzer", path: "/music-ai", icon: <FaCompactDisc />, component: MusicAI, animation: slideUp },
    ],
  },
  {
    name: "Vision AI",
    icon: <FaUserCircle />,
    children: [
      { name: "Face Detect", path: "/face-detect", icon: <FaUserCircle />, component: FaceDetectAI, animation: slideUp },
      { name: "Image Classify", path: "/image-classify", icon: <FaUserCircle />, component: ImageClassifyAI, animation: slideUp },
    ],
  },
  {
    name: "Voice Assistant",
    path: "/voice-assistant",
    icon: <FaMicrophone />,
    component: VoiceAssistant,
    animation: pageFade,
  },
  {
    name: "Relationship",
    path: "/relationship/*",
    icon: <FaHeart />,
    component: RelationshipRoutes,
    animation: pageFade,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaRobot />,
    component: null, // handled separately with DashboardLayout
  },
];
