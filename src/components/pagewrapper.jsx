import React from "react";

export default function PageWrapper({ children }) {
  return (
    <div className="p-4">
      {children}
    </div>
  );
}