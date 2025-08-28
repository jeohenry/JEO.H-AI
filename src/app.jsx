import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "./components/Loading";
import PageWrapper from "./components/PageWrapper";
import Home from "./pages/Home";

// Example lazy-loaded AI module
// const ChatAI = lazy(() => import("./modules/Chat/ChatModule"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        {/* <Route path="/chat" element={<PageWrapper><ChatAI /></PageWrapper>} /> */}
      </Routes>
    </Suspense>
  );
}

export default App;