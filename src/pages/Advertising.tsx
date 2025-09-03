import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { slideUp } from '../config/animations';

const Advertising = () => {
  const [formData, setFormData] = useState({
    product: '',
    audience: '',
    media_type: 'text'
  });

  const [result, setResult] = useState({
    copy: '',
    strategy: '',
    pitch: '',
    imageUrl: '',
    videoUrl: ''
  });

  const [adId, setAdId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const generateAds = async () => {
    const { product, audience, media_type } = formData;
    if (!product || !audience) {
      setError('⚠️ Please provide both product/service and target audience.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/advertising/', {
        product,
        audience,
        media_type
      });

      setResult({
        copy: response.data.ad_text,
        strategy: response.data.strategy || '',
        pitch: response.data.pitch || '',
        imageUrl: response.data.image_url || '',
        videoUrl: response.data.video_url || ''
      });

      setAdId(response.data.id || null);
    } catch (err) {
      console.error(err);
      setError('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFormData({ product: '', audience: '', media_type: 'text' });
    setResult({ copy: '', strategy: '', pitch: '', imageUrl: '', videoUrl: '' });
    setAdId(null);
    setError('');
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-6 space-y-6 max-w-4xl mx-auto"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700">
          📢 Advertising AI Generator
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            name="product"
            placeholder="🧪 Product or service"
            value={formData.product}
            onChange={handleChange}
          />
          <Input
            name="audience"
            placeholder="🎯 Target audience"
            value={formData.audience}
            onChange={handleChange}
          />
          <Input
            name="media_type"
            placeholder="🎬 Media Type (text/image/video)"
            value={formData.media_type}
            onChange={handleChange}
          />
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <div className="flex gap-4">
          <Button onClick={generateAds} disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : '⚙️ Generate Ad'}
          </Button>
          <Button variant="outline" onClick={clearAll}>
            🔄 Clear
          </Button>
        </div>

        {result.copy && (
          <Card className="shadow-md mt-6">
            <CardContent className="p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-green-700">📝 Ad Copy</h3>
                <p>{result.copy}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-700">📈 Campaign Strategy</h3>
                <p>{result.strategy}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-700">💬 Sales Pitch</h3>
                <p>{result.pitch}</p>
              </div>

              {result.imageUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-700">🖼️ Generated Image</h3>
                  <img
                    src={result.imageUrl}
                    alt="Generated Ad"
                    className="w-full rounded shadow"
                  />
                </div>
              )}

              {result.videoUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-pink-700">🎥 Generated Video</h3>
                  <video controls className="w-full rounded shadow">
                    <source src={result.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {adId && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    window.open(
                      `http://localhost:8000/api/advertising/export-pdf/${adId}`,
                      '_blank'
                    )
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







