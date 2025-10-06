// src/modules/Advertising.tsx
import React, { useState } from "react";
import API, { BASE_URL } from "@/api"; // ✅ Import both API instance & BASE_URL
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download } from "lucide-react";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { slideUp } from "../config/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Advertising = () => {
  const [formData, setFormData] = useState({
    product: "",
    audience: "",
    media_type: "text",
  });

  const [result, setResult] = useState({
    copy: "",
    strategy: "",
    pitch: "",
    imageUrl: "",
    videoUrl: "",
  });

  const [blobKey, setBlobKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const generateAds = async () => {
    const { product, audience, media_type } = formData;
    if (!product || !audience) {
      setError("⚠️ Please provide both product/service and target audience.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use centralized API instance
      const response = await API.post("/advertising/", {
        product,
        audience,
        media_type,
      });

      setResult({
        copy: response.data.ad_text,
        strategy: response.data.strategy || "",
        pitch: response.data.pitch || "",
        imageUrl: response.data.image_url || "",
        videoUrl: response.data.video_url || "",
      });

      setBlobKey(response.data.blob_key || null);
    } catch (err) {
      console.error(err);
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFormData({ product: "", audience: "", media_type: "text" });
    setResult({ copy: "", strategy: "", pitch: "", imageUrl: "", videoUrl: "" });
    setBlobKey(null);
    setError("");
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400">
          📢 Advertising AI Generator
        </h2>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          <Input
            name="product"
            placeholder="🧪 Product or service"
            value={formData.product}
            onChange={handleChange}
            className="text-sm sm:text-base bg-white text-black placeholder-gray-500 
                       dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
          <Input
            name="audience"
            placeholder="🎯 Target audience"
            value={formData.audience}
            onChange={handleChange}
            className="text-sm sm:text-base bg-white text-black placeholder-gray-500 
                       dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
          <Input
            name="media_type"
            placeholder="🎬 Media Type (text/image/video)"
            value={formData.media_type}
            onChange={handleChange}
            className="text-sm sm:text-base bg-white text-black placeholder-gray-500 
                       dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button onClick={generateAds} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "⚙️ Generate Ad"}
          </Button>
          <Button variant="outline" onClick={clearAll} className="w-full sm:w-auto">
            🔄 Clear
          </Button>
        </div>

        {/* Results */}
        {result.copy && (
          <Card className="shadow-md mt-4 sm:mt-6">
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="copy">
                  <AccordionTrigger className="text-base sm:text-lg font-semibold text-green-700">
                    📝 Ad Copy
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm sm:text-base">{result.copy}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="strategy">
                  <AccordionTrigger className="text-base sm:text-lg font-semibold text-blue-700">
                    📈 Campaign Strategy
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm sm:text-base">{result.strategy}</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="pitch">
                  <AccordionTrigger className="text-base sm:text-lg font-semibold text-orange-700">
                    💬 Sales Pitch
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm sm:text-base">{result.pitch}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Image Section */}
              {result.imageUrl && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-purple-700">
                    🖼️ Generated Image
                  </h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={result.imageUrl}
                        alt="Generated Ad"
                        className="w-full rounded-xl shadow cursor-pointer"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-full max-h-full p-2 space-y-4">
                      <img
                        src={result.imageUrl}
                        alt="Fullscreen Ad"
                        className="w-full h-auto rounded-xl"
                      />
                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = result.imageUrl;
                          link.download = "advertisement.png";
                          link.click();
                        }}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Image
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Video Section */}
              {result.videoUrl && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-pink-700">
                    🎥 Generated Video
                  </h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <video controls className="w-full rounded-xl shadow cursor-pointer">
                        <source src={result.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </DialogTrigger>
                    <DialogContent className="max-w-full max-h-full p-2 space-y-4">
                      <video controls autoPlay className="w-full h-auto rounded-xl">
                        <source src={result.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <Button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = result.videoUrl;
                          link.download = "advertisement.mp4";
                          link.click();
                        }}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Download Video
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* ✅ Dynamic Export PDF Link */}
              {blobKey && (
                <Button
                  variant="outline"
                  className="mt-2 sm:mt-4 w-full sm:w-auto"
                  onClick={() =>
                    window.open(`${BASE_URL}/advertising/export-pdf/${blobKey}`, "_blank")
                  }
                >
                  📄 Export to PDF
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default Advertising;