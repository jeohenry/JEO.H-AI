// src/components/ErrorBoundary.jsx
import React from "react";
import { useGlobalError } from "@/context/GlobalErrorContext";

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.resetTimeout = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ App crashed:", error, errorInfo);

    if (window.eruda) {
      window.eruda.get("console").log("❌ App crashed:", error, errorInfo);
    }

    this.setState({ errorInfo });

    // Auto-reset after 10s
    this.resetTimeout = setTimeout(() => {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }, 10000);
  }

  componentWillUnmount() {
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            color: "#b91c1c",
            fontFamily: "monospace",
            background: "#fff0f0",
            borderRadius: "8px",
          }}
        >
          <h2>⚠️ Something went wrong</h2>
          <p>
            <strong>Error:</strong>{" "}
            {this.state.error?.message || this.state.error?.toString()}
          </p>
          {this.state.errorInfo?.componentStack && (
            <details style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
              <summary>Stack trace</summary>
              {this.state.errorInfo.componentStack}
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              background: "#b91c1c",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            🔄 Retry
          </button>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#7f1d1d" }}>
            Auto-resetting in 10s…
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const { error, setError } = useGlobalError();
  const [autoReset, setAutoReset] = React.useState(null);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // clear global error after 10s
      }, 10000);
      setAutoReset(timer);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "#b91c1c",
          fontFamily: "monospace",
          background: "#fff0f0",
          borderRadius: "8px",
        }}
      >
        <h2>⚠️ Global Error</h2>
        <p>
          <strong>Error:</strong> {error?.message || error?.toString()}
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            background: "#b91c1c",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔄 Retry
        </button>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#7f1d1d" }}>
          Auto-resetting in 10s…
        </p>
      </div>
    );
  }

  return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>;
}