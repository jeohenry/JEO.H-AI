// src/modules/LiveTranslatorTabs.jsx
import React, { useState } from "react";
import LiveTranslator from "@/modules/LiveTranslator";   // ✅ from modules
import VoiceTranslate from "@/modules/VoiceAssistant";  // ✅ from modules
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/context/UserContext";

const LiveTranslatorTabs = () => {
  const { profile } = useUser();
  const defaultLang = profile?.preferredLanguage || "fr";
  const [targetLang, setTargetLang] = useState(defaultLang);
  const [tab, setTab] = useState("text");

  return (
    <PageWrapper>
      <Tabs
        defaultValue="text"
        value={tab}
        onValueChange={setTab}
        className="max-w-4xl mx-auto mt-10"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="text">📝 Text Translate</TabsTrigger>
          <TabsTrigger value="voice">🎙️ Voice Translate</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <LiveTranslator targetLang={targetLang} setTargetLang={setTargetLang} />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceTranslate userId={profile?.id} />
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
};

export default LiveTranslatorTabs;