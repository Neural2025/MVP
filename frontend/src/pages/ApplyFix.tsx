import React from "react";
import { Navigate } from "react-router-dom";

const ApplyFix: React.FC = () => {
  // Redirect to Code Analysis page, where Apply Fix tab is present
  return <Navigate to="/code-analysis" replace />;
};

export default ApplyFix;
