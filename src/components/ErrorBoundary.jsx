// src/components/ErrorBoundary.jsx
import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so fallback UI is shown
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Always log to normal console
    console.error("❌ App crashed:", error, errorInfo);

    // If Eruda is enabled, log there too
    if (window.eruda) {
      window.eruda.get("console").log("❌ App crashed:", error, errorInfo);
    }

    // Store component stack for display
    this.setState({ errorInfo });
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
        </div>
      );
    }

    return this.props.children;
  }
}