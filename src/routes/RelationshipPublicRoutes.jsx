import React from "react";
import { Route } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { slideRight, scaleFade } from "@/config/animations";

import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import TranslatedPost from "@/pages/post/TranslatedPost";

const PublicRoutes = () => (
  <>
    <Route path="login" element={<PageWrapper animation={slideRight}><Login /></PageWrapper>} />
    <Route path="register" element={<PageWrapper animation={slideRight}><Register /></PageWrapper>} />
    <Route path="/post/:id/translated" element={<PageWrapper animation={scaleFade}><TranslatedPost /></PageWrapper>} />
  </>
);

export default PublicRoutes;
