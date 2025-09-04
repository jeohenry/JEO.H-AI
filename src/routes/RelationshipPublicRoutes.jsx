// src/routes/RelationshipPublicRoutes.jsx

import React from "react";
import { Route } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { slideRight, scaleFade } from "@/config/animations";

import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import PasswordReset from "@/pages/Auth/PasswordReset";
import LanguageSelector from "@/pages/Auth/LanguageSelector";

const RelationshipPublicRoutes = () => (
  <>
    <Route path="language" element={<PageWrapper animation={scaleFade}><LanguageSelector /></PageWrapper>} />
    <Route path="login" element={<PageWrapper animation={slideRight}><Login /></PageWrapper>} />
    <Route path="register" element={<PageWrapper animation={slideRight}><Register /></PageWrapper>} />
    <Route path="password-reset" element={<PageWrapper animation={slideRight}><PasswordReset /></PageWrapper>} />
  </>
);

export default RelationshipPublicRoutes;