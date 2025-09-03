// src/modules/LiveTranslatorTabs.jsx
import React, { useState } from "react";
import LiveTranslator from "./LiveTranslator";
import VoiceTranslate from "./VoiceTranslate";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from '@/context/UserContext';

const { profile } = useUser();
const defaultLang = profile?.preferredLanguage || "fr";
const [targetLang, setTargetLang] = useState(defaultLang);
const LiveTranslatorTabs = () => {
  const [tab, setTab] = useState("text");

  return (
    <PageWrapper>
      <PageWrapper theme="relationship" />
      <Tabs defaultValue="text" value={tab} onValueChange={setTab} className="max-w-4xl mx-auto mt-10">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="text">📝 Text Translate</TabsTrigger>
          <TabsTrigger value="voice">🎙️ Voice Translate</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <LiveTranslator />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceTranslate />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
};

export default LiveTranslatorTabs;










