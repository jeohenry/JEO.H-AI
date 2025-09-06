// src/routes/RelationshipPublicRoutes.jsx

import React from "react";
import { Route } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { slideRight, scaleFade } from "@/config/animations";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import PasswordReset from "@/pages/auth/PasswordReset";
import LanguageSelector from "@/pages/auth/LanguageSelector";

const RelationshipPublicRoutes = () => (
  <>
    <Route path="language" element={<PageWrapper animation={scaleFade}><LanguageSelector /></PageWrapper>} />
    <Route path="login" element={<PageWrapper animation={slideRight}><Login /></PageWrapper>} />
    <Route path="register" element={<PageWrapper animation={slideRight}><Register /></PageWrapper>} />
    <Route path="password-reset" element={<PageWrapper animation={slideRight}><PasswordReset /></PageWrapper>} />
  </>
);

export default RelationshipPublicRoutes;