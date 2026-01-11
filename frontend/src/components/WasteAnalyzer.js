import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/WasteAnalyzer.css";

// Function to generate a default/not-found result structure
// NOTE: Updated to match the fields available in your DB
const createDefaultResult = (name, confidence = null) => ({
  waste_name: name,
  // Removed 'uses' field
  process: "Unknown or not categorized.",
  market_value: "N/A - Data currently unavailable.",
  challenges: "Data not available.",
  success_stories: "Data not available.",
  environmental_impact: "Data not available.",
  classification: name, // Used as a fallback for image analysis
  confidence: confidence,
});

const WasteAnalyzer = () => {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysisType, setAnalysisType] = useState("text"); // 'text' or 'image'
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // State for managing active result tab

  const navigate = useNavigate();

  // 1. UPDATED: Common waste types for quick selection using specific examples
  const commonWasteTypes = [
    "Rice Straw", // Crop Residue
    "Sugarcane Bagasse", // Crop Residue
    "Poultry Litter (Manure + Bedding)", // Animal Waste
    "Grape Pomace", // Agro-Industrial Waste
    "Coconut Shells", // Agro-Industrial Waste
  ];

  // Load analysis history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("wasteAnalysisHistory");
    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Set default tab when a result is loaded/cleared
  useEffect(() => {
    if (result) {
      setActiveTab("overview");
    }
  }, [result]);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null); // Clear error on new image upload
    }
  };

  const handleTabChange = (type) => {
    setAnalysisType(type);
    setResult(null);
    setError(null);
    setQuery("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleQuickSelect = (wasteType) => {
    setQuery(wasteType);
    setResult(null); // Clear previous result when starting a new query
    setError(null);
    // 2. FIX: Automatically submit the query when a quick select button is clicked
    analyzeWaste({ preventDefault: () => {} });
  };

  const analyzeWaste = async (e) => {
    // Prevent default form submission if triggered by an event object
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const currentQuery = query.trim();
    if (analysisType === "text" && !currentQuery) {
      setError("Please enter a waste type to analyze");
      return;
    }

    if (analysisType === "image" && !imageFile) {
      setError("Please upload an image to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      let response;
      let analysisResult;

      if (analysisType === "text") {
        // Text-based analysis
        try {
          response = await axios.get(
            `/api/waste-info/${encodeURIComponent(currentQuery)}`
          );
          analysisResult = response.data.data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // Handle 404 Not Found from the backend (no data in MongoDB)
            analysisResult = createDefaultResult(currentQuery);
            setError(
              `Waste type "${currentQuery}" not found in the database. Showing default information.`
            );
          } else {
            // Re-throw other errors
            throw err;
          }
        }

        setResult(analysisResult);

        // Save to recent searches
        const recentSearches = JSON.parse(
          localStorage.getItem("wasteSearches") || "[]"
        );
        if (!recentSearches.includes(currentQuery)) {
          recentSearches.unshift(currentQuery);
          if (recentSearches.length > 5) recentSearches.pop();
          localStorage.setItem(
            "wasteSearches",
            JSON.stringify(recentSearches)
          );
        }

        // Save to analysis history
        saveToHistory({
          type: "text",
          query: currentQuery,
          result: analysisResult,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Image-based analysis
        const formData = new FormData();
        formData.append("image", imageFile);

        response = await axios.post("/api/waste-classification", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.success) {
          const wasteType = response.data.data.wasteType;
          const classificationConfidence = response.data.data.confidence;
          let wasteInfoResponse;

          try {
            // Get waste info for the classified waste type
            wasteInfoResponse = await axios.get(
              `/api/waste-info/${encodeURIComponent(wasteType)}`
            );

            if (wasteInfoResponse.data.success) {
              analysisResult = {
                ...wasteInfoResponse.data.data,
                classification: wasteType,
                analysis: response.data.data.analysis,
                confidence: classificationConfidence,
              };
            } else {
              // Fallback for classification success but info lookup failure
              analysisResult = createDefaultResult(
                wasteType,
                classificationConfidence
              );
              setError(
                `Image classified as "${wasteType}", but detailed info is unavailable.`
              );
            }
          } catch (infoError) {
            console.error("Error fetching waste info:", infoError);
            analysisResult = createDefaultResult(
              wasteType,
              classificationConfidence
            );
            setError(
              `Image classified as "${wasteType}", but there was an error fetching detailed information.`
            );
          }

          setResult(analysisResult);

          // Save to analysis history with image preview
          saveToHistory({
            type: "image",
            query: wasteType,
            result: analysisResult,
            imagePreview: imagePreview,
            timestamp: new Date().toISOString(),
          });
        } else {
          setError(
            response.data.message || "Failed to classify waste image"
          );
        }
      }
    } catch (err) {
      console.error("Error analyzing waste:", err);
      // Catch-all error message for network issues or unhandled server errors
      setError(
        err.response?.data?.message ||
          "An error occurred while analyzing the waste. Please check your network connection."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save analysis to history
  const saveToHistory = (historyItem) => {
    const updatedHistory = [historyItem, ...analysisHistory];
    // Limit history to 10 items
    if (updatedHistory.length > 10) {
      updatedHistory.pop();
    }
    setAnalysisHistory(updatedHistory);
    localStorage.setItem(
      "wasteAnalysisHistory",
      JSON.stringify(updatedHistory)
    );
  };

  const viewWasteProducts = () => {
    navigate("/waste");
  };

  // Load a previous analysis from history
  const loadFromHistory = (historyItem) => {
    setResult(historyItem.result);
    setError(null);

    if (historyItem.type === "text") {
      setAnalysisType("text");
      setQuery(historyItem.query);
      setImageFile(null);
      setImagePreview(null);
    } else if (historyItem.type === "image") {
      setAnalysisType("image");
      setQuery("");
      // Note: We can't restore the actual file object from localStorage
      setImagePreview(historyItem.imagePreview);
    }

    setShowHistory(false);
    setActiveTab("overview"); // Reset to the overview tab
  };

  // Toggle history panel
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Function to render the result content for a tab
  // NOTE: This utility function is kept general.
  const renderTabContent = (tabName, iconClass, title, contentKey) => {
    // Explicitly convert the content to a string to prevent "Objects are not valid as a React child" error
    const content = result[contentKey] ? String(result[contentKey]) : "N/A";

    return (
      <div className="result-section">
        <h4>
          <i className={`bi ${iconClass} me-2`}></i>
          {title}
        </h4>
        <p>{content}</p>
      </div>
    );
  };

  return (
    <div className="waste-analyzer-container">
      <div className="analyzer-header">
        <div className="analyzer-tabs">
          <button
            className={`tab-button ${analysisType === "text" ? "active" : ""}`}
            onClick={() => handleTabChange("text")}
          >
            <i className="bi bi-search me-2"></i>
            Text Analysis
          </button>
          <button
            className={`tab-button ${analysisType === "image" ? "active" : ""}`}
            onClick={() => handleTabChange("image")}
          >
            <i className="bi bi-camera me-2"></i>
            Image Analysis
          </button>
        </div>
        <button
          className={`history-button ${showHistory ? "active" : ""}`}
          onClick={toggleHistory}
          title="View Analysis History"
        >
          <i className="bi bi-clock-history me-2"></i>
          History
          {analysisHistory.length > 0 && (
            <span className="history-count">{analysisHistory.length}</span>
          )}
        </button>
      </div>

      {/* History Panel (JSX remains unchanged) */}
      {showHistory && (
        <div className="history-panel">
          <div className="history-panel-header">
            <h4>Analysis History</h4>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                localStorage.removeItem("wasteAnalysisHistory");
                setAnalysisHistory([]);
              }}
            >
              Clear History
            </button>
          </div>
          {analysisHistory.length === 0 ? (
            <div className="history-empty">
              <i className="bi bi-clock-history"></i>
              <p>No analysis history yet</p>
            </div>
          ) : (
            <div className="history-items">
              {analysisHistory.map((item, index) => (
                <div
                  key={index}
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                >
                  <div className="history-item-header">
                    <div className="history-item-type">
                      <i
                        className={`bi ${
                          item.type === "text" ? "bi-search" : "bi-camera"
                        }`}
                      ></i>
                      <span>{item.query}</span>
                    </div>
                    <div className="history-item-time">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {item.type === "image" && item.imagePreview && (
                    <div className="history-item-image">
                      <img src={item.imagePreview} alt={item.query} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="analyzer-content">
        {analysisType === "text" ? (
          <>
            {/* 3. FIX: Ensure analyzeWaste is called with an event on submit */}
            <form onSubmit={analyzeWaste} className="analyzer-form">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter agricultural waste type (e.g., rice straw, coconut shells)"
                  value={query}
                  onChange={handleQueryChange}
                />
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={isAnalyzing || !query.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 1. UPDATED: Quick Select with specific waste names */}
            <div className="quick-select-container">
              <p className="quick-select-label">Quick Select (Examples):</p>
              <div className="quick-select-buttons">
                {commonWasteTypes.map((wasteType) => (
                  <button
                    key={wasteType}
                    className="btn btn-sm btn-outline-secondary me-2 mb-2"
                    // FIX: Clicking quick select sets query and calls analyzeWaste (via handleQuickSelect)
                    onClick={() => handleQuickSelect(wasteType)}
                  >
                    {wasteType.split('(')[0].trim()} {/* Display only the main name */}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="image-upload-container">
            <div className="image-preview-area">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
              ) : (
                <div className="image-placeholder">
                  <i className="bi bi-image"></i>
                  <p>Upload an image of agricultural waste</p>
                </div>
              )}
            </div>

            <div className="image-upload-controls">
              <label className="btn btn-outline-primary me-3">
                <i className="bi bi-upload me-2"></i>
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
              <button
                className="btn btn-success"
                onClick={analyzeWaste}
                disabled={isAnalyzing || !imageFile}
              >
                {isAnalyzing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-danger mt-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="result-container">
            <h3 className="result-title">
              <i className="bi bi-recycle me-2"></i>
              {result.waste_name || result.classification}
              {result.confidence && (
                <span className="confidence-badge">
                  {Math.round(result.confidence * 100)}% confidence
                </span>
              )}
            </h3>

            <div className="result-card">
              {/* Tab Navigation (unchanged) */}
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("overview")}
                    role="tab"
                    aria-controls="overview"
                    aria-selected={activeTab === "overview"}
                  >
                    <i className="bi bi-info-circle me-2"></i>
                    Overview
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "details" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("details")}
                    role="tab"
                    aria-controls="details"
                    aria-selected={activeTab === "details"}
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    Details
                  </button>
                </li>
                {result.environmental_impact && (
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${
                        activeTab === "impact" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("impact")}
                      role="tab"
                      aria-controls="impact"
                      aria-selected={activeTab === "impact"}
                    >
                      <i className="bi bi-globe me-2"></i>
                      Impact
                    </button>
                  </li>
                )}
              </ul>

              {/* Tab Content */}
              <div className="tab-content p-3">
                {/* Overview Tab Pane */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "overview" ? "show active" : ""
                  }`}
                  id="overview"
                  role="tabpanel"
                  aria-labelledby="overview-tab"
                >
                  {/* NOTE: Potential Uses section remains removed */}
                  
                  {renderTabContent(
                    "overview",
                    "bi-arrow-repeat",
                    "Processing Methods",
                    "process"
                  )}
                  {renderTabContent(
                    "overview",
                    "bi-currency-rupee",
                    "Market Value",
                    "market_value"
                  )}
                </div>

                {/* Details Tab Pane (unchanged) */}
                <div
                  className={`tab-pane fade ${
                    activeTab === "details" ? "show active" : ""
                  }`}
                  id="details"
                  role="tabpanel"
                  aria-labelledby="details-tab"
                >
                  {result.challenges &&
                    renderTabContent(
                      "details",
                      "bi-exclamation-triangle",
                      "Challenges",
                      "challenges"
                    )}
                  {result.success_stories &&
                    renderTabContent(
                      "details",
                      "bi-trophy",
                      "Success Stories",
                      "success_stories"
                    )}
                </div>

                {/* Impact Tab Pane (unchanged) */}
                {result.environmental_impact && (
                  <div
                    className={`tab-pane fade ${
                      activeTab === "impact" ? "show active" : ""
                    }`}
                    id="impact"
                    role="tabpanel"
                    aria-labelledby="impact-tab"
                  >
                    {renderTabContent(
                      "impact",
                      "bi-globe",
                      "Environmental Impact",
                      "environmental_impact"
                    )}
                  </div>
                )}
              </div>

              {/* Result Actions: CLIPBOARD LOGIC IS CORRECTLY UPDATED */}
              <div className="result-actions">
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => {
                    const clipboardText = `
Waste Type: ${result.waste_name || result.classification}
Processing Methods: ${result.process}
Market Value: ${result.market_value}
${
  result.environmental_impact
    ? `Environmental Impact: ${result.environmental_impact}`
    : ""
}
${result.challenges ? `Challenges: ${result.challenges}` : ""}
${result.success_stories ? `Success Stories: ${result.success_stories}` : ""}
`.trim();
                    navigator.clipboard.writeText(clipboardText);
                    alert("Analysis results copied to clipboard!");
                  }}
                >
                  <i className="bi bi-clipboard me-2"></i>
                  Copy Results
                </button>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    `${
                      result.waste_name || result.classification
                    } agricultural waste recycling`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-search me-2"></i>
                  Learn More
                </a>
              </div>
            </div>

            <div className="related-waste-section">
              <h4>Find Related Products</h4>
              <div className="related-waste-buttons">
                <button
                  className="btn btn-outline-success"
                  onClick={() =>
                    navigate(
                      `/waste?search=${encodeURIComponent(
                        result.waste_name || result.classification
                      )}`
                    )
                  }
                >
                  <i className="bi bi-search me-2"></i>
                  Find Similar Waste Products
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/waste-products/add")}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  List Your Waste Product
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={viewWasteProducts}>
                <i className="bi bi-shop me-2"></i>
                View Waste Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteAnalyzer;