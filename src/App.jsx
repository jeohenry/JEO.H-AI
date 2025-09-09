// src/App.jsx

import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Routes & Handlers
import RouteChangeHandler from "./routes/RouteChangeHandler";

// UI
import PageWrapper from "./components/PageWrapper";

// Config
import { routesConfig } from "./config/routesConfig";

// Extras
import DashboardHome from "./pages/DashboardHome";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <RouteChangeHandler />

      <AnimatePresence mode="wait">
        <Suspense fallback={null}>
          <Routes>
            {/* Main layout routes */}
            <Route element={<MainLayout />}>
              {routesConfig.flatMap((item) =>
                item.children
                  ? item.children.map((child) =>
                      child.component ? (
                        <Route
                          key={child.path}
                          path={child.path}
                          element={
                            <PageWrapper animation={child.animation}>
                              <child.component />
                            </PageWrapper>
                          }
                        />
                      ) : null
                    )
                  : item.component && item.path !== "/dashboard" ? (
                      <Route
                        key={item.path}
                        path={item.path}
                        element={
                          <PageWrapper animation={item.animation}>
                            <item.component />
                          </PageWrapper>
                        }
                      />
                    ) : null
              )}
            </Route>

            {/* Dashboard layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route
                index
                element={
                  <PageWrapper animation="pageFade">
                    <DashboardHome />
                  </PageWrapper>
                }
              />
            </Route>

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <PageWrapper animation="pageFade">
                  <NotFound />
                </PageWrapper>
              }
            />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export default App;