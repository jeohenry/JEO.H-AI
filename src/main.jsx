import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from "./context/ThemeContext";
import App from './App';
import './index.css'; // Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

<ThemeProvider>
  <BrowserRouter>
    <Routes>{/* your routes */}</Routes>
  </BrowserRouter>
</ThemeProvider>