import React from 'react';
import WasteAnalyzer from '../components/WasteAnalyzer';

const WasteAnalyzerPage = () => {
  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Agricultural Waste Analyzer</h1>
      <p className="text-center text-muted mb-4">
        Analyze agricultural waste to discover recycling opportunities and sustainable management practices.
      </p>
      <WasteAnalyzer />
    </div>
  );
};

export default WasteAnalyzerPage;