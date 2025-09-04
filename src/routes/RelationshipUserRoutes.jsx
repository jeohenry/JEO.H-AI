//src/routes/RelationshipUserRoutes.jsx

import React from "react";
import { Route } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import {
  slideUp, slideRight, scaleFade, pageFade
} from "@/config/animations";

import Profile from "@/pages/relationship/Profile";
import Feed from "@/pages/relationship/Feed";
import ChatRoom from "@/pages/relationship/ChatRoom";
import MatchMaker from "@/pages/relationship/MatchMaker";
import Advice from "@/pages/relationship/Advice";
import GroupVideoCall from "@/pages/relationship/GroupVideoCall";
import LiveVideo from "@/pages/relationship/LiveVideoChat";
import Notifications from "@/pages/Notifications";
import UploadPicture from "@/pages/relationship/Upload";
import LiveTranslatorTabs from "@/modules/LiveTranslatorTabs";

const UserRoutes = () => (
  <>
    <Route path="profile" element={<PageWrapper animation={pageFade}><Profile /></PageWrapper>} />
    <Route path="feed" element={<PageWrapper animation={slideUp}><Feed /></PageWrapper>} />
    <Route path="chatroom" element={<PageWrapper animation={slideRight}><ChatRoom /></PageWrapper>} />
    <Route path="matchmaker" element={<PageWrapper animation={scaleFade}><MatchMaker /></PageWrapper>} />
    <Route path="advice" element={<PageWrapper animation={scaleFade}><Advice /></PageWrapper>} />
    <Route path="group-video-call" element={<PageWrapper animation={slideUp}><GroupVideoCall /></PageWrapper>} />
    <Route path="live-video-chat" element={<PageWrapper animation={slideRight}><LiveVideo /></PageWrapper>} />
    <Route path="notifications" element={<PageWrapper animation={pageFade}><Notifications /></PageWrapper>} />
    <Route path="upload" element={<PageWrapper animation={slideRight}><UploadPicture /></PageWrapper>} />
    <Route path="translate" element={<PageWrapper animation={scaleFade}><LiveTranslatorTabs /></PageWrapper>} />
  </>
);

export default UserRoutes;
