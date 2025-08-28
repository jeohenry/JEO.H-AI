import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext";
import App from './App';
import './index.css'; // Tailwind CSS

// Error boundary component
class ErrorOverlay extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    console.error("React error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255,0,0,0.95)",
          color: "white",
          padding: "20px",
          overflowY: "auto",
          fontFamily: "monospace",
          zIndex: 9999
        }}>
          <h2>React Error:</h2>
          <pre>{this.state.error && this.state.error.toString()}</pre>
          <pre>{this.state.info && this.state.info.componentStack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root for React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorOverlay>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorOverlay>
  </React.StrictMode>
);