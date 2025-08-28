import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Home from "./pages/Home";
import Loading from "./components/Loading";
import PageWrapper from "./components/PageWrapper";

function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;