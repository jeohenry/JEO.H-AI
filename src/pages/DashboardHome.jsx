// src/pages/DashboardHome.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PageWrapper from "@/components/PageWrapper";
import { scaleFade } from "@/config/animations";

const DashboardHome = () => {
  return (
    <PageWrapper animation={scaleFade}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">Welcome Back</h3>
            <p className="text-muted-foreground">Check your insights and updates.</p>
          </CardContent>
        </Card>
        {/* Add more widgets/cards as needed */}
      </div>
    </PageWrapper>
  );
};

export default DashboardHome;