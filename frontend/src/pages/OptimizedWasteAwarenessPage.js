import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/WasteAwareness.css";

const OptimizedWasteAwarenessPage = () => {
  const [technologies, setTechnologies] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTech, setSelectedTech] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Categories based on the JSON data
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "crops", name: "Crop Waste Technologies" },
    { id: "horticulture", name: "Horticultural Waste Technologies" },
    { id: "fisheries", name: "Fisheries & Animal Waste Technologies" },
    { id: "processes", name: "Waste Processing Technologies" }
  ];

  useEffect(() => {
    // Fetch the waste management technologies data
    const fetchTechnologies = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        // For now, we'll use a simplified version of the data
        const techData = [
          // Crop Waste Technologies
          {
            id: 1,
            category: "crops",
            title: "Preparation of Handmade Paper from Jute Waste",
            description: "Technology to convert jute waste into handmade paper products, providing an eco-friendly alternative to conventional paper.",
            benefits: ["Reduces agricultural waste", "Creates sustainable paper products", "Provides additional income for farmers"],
            image: "https://images.pexels.com/photos/6044254/pexels-photo-6044254.jpeg" // Jute/fiber waste image
          },
          {
            id: 2,
            category: "crops",
            title: "Biochar from Agricultural Waste Material",
            description: "Technology to convert agricultural waste into biochar, which improves soil health and sequesters carbon.",
            benefits: ["Improves soil fertility", "Carbon sequestration", "Waste reduction", "Sustainable farming practice"],
            image: "https://images.pexels.com/photos/5503252/pexels-photo-5503252.jpeg" // Charcoal/biochar image
          },
          {
            id: 3,
            category: "crops",
            title: "Bioreactor with Microbial Consortium to Recycle Food Waste",
            description: "Advanced bioreactor system that uses microbial consortia to rapidly convert food waste into nutrient-rich compost.",
            benefits: ["Rapid composting (15-20 days)", "Reduces landfill waste", "Creates valuable fertilizer", "Reduces greenhouse gas emissions"],
            image: "https://images.pexels.com/photos/2537122/pexels-photo-2537122.jpeg" // Food waste image
          },

          // Horticultural Waste Technologies
          {
            id: 4,
            category: "horticulture",
            title: "Alcoholic Beverage with Nutraceutical Properties from Kinnow Peels",
            description: "Process to create alcoholic beverages with health benefits from kinnow (citrus) peels that would otherwise be discarded.",
            benefits: ["Utilizes citrus waste", "Creates value-added products", "Contains nutraceutical properties"],
            image: "https://images.pexels.com/photos/1002778/pexels-photo-1002778.jpeg" // Citrus peels image
          },
          {
            id: 5,
            category: "horticulture",
            title: "Arka Fermented Cocopeat",
            description: "Technology to convert coconut husk waste into fermented cocopeat, an excellent growing medium for plants.",
            benefits: ["Excellent water retention", "Improves plant growth", "Utilizes coconut industry waste", "Organic growing medium"],
            image: "https://images.pexels.com/photos/5503250/pexels-photo-5503250.jpeg" // Coconut husk/fiber image
          },
          
          // Fisheries & Animal Waste Technologies
          {
            id: 6,
            category: "fisheries",
            title: "Chitin and Chitosan from Prawn Shell Waste",
            description: "Process to extract chitin and chitosan from prawn shell waste, creating valuable biomaterials with numerous applications.",
            benefits: ["Pharmaceutical applications", "Food preservation", "Water treatment", "Biomedical uses"],
            image: "https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg" // Prawn/seafood image
          },
          
          // Waste Processing Technologies
          {
            id: 7,
            category: "processes",
            title: "Binderless Briquetting of 100% Crop Residue",
            description: "Process to create solid fuel briquettes from crop residues without using any binding agents.",
            benefits: ["Alternative to fossil fuels", "Prevents crop burning", "Energy from waste", "Reduces air pollution"],
            image: "https://images.pexels.com/photos/5503252/pexels-photo-5503252.jpeg" // Biomass/briquette image
          }
        ];
        
        setTechnologies(techData);
        setError(null);
      } catch (err) {
        console.error("Error fetching technologies:", err);
        setError("Failed to load waste management technologies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologies();
  }, []);

  // Filter technologies based on category and search term
  const filteredTechnologies = technologies.filter((tech) => {
    const matchesCategory = selectedCategory === "all" || tech.category === selectedCategory;
    const matchesSearch = tech.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tech.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTechClick = (tech) => {
    setSelectedTech(tech);

    // Wait for the component to render with the selected tech before scrolling
    setTimeout(() => {
      const detailsElement = document.getElementById("tech-details");
      if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="waste-awareness-container">
      <div className="awareness-header">
        <div className="overlay">
          <div className="container">
            <h1>Agricultural Waste Awareness</h1>
            <p>Learn about sustainable waste management practices and technologies for a greener future</p>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        <div className="intro-section p-4 mb-5 rounded shadow-sm">
          <div className="row">
            <div className="col-lg-8">
              <h2>Why Waste Awareness Matters</h2>
              <p className="lead">Agricultural waste is a significant global challenge, but also presents tremendous opportunities for sustainable solutions.</p>
              <p>Every year, millions of tons of agricultural waste are generated worldwide. When improperly managed, this waste contributes to environmental pollution, greenhouse gas emissions, and resource depletion. However, with proper awareness and management techniques, agricultural waste can be transformed into valuable resources.</p>
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="intro-stat p-3 bg-light rounded mb-3">
                    <h4 className="text-success">350 Million</h4>
                    <p className="mb-0">Tonnes of agricultural waste generated in India annually</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="intro-stat p-3 bg-light rounded mb-3">
                    <h4 className="text-success">30-40%</h4>
                    <p className="mb-0">Of all food produced globally is lost or wasted</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4 d-flex align-items-center justify-content-center">
              <img 
                src="https://images.pexels.com/photos/2537122/pexels-photo-2537122.jpeg"
                alt="Sustainable Agriculture"
                className="img-fluid rounded shadow"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>
          </div>
        </div>

        <h3 className="mb-4">Explore Waste Management Technologies</h3>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
              <button className="btn btn-outline-secondary" type="button">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading technologies...</p>
          </div>
        ) : filteredTechnologies.length === 0 ? (
          <div className="alert alert-info">
            {searchTerm ? "No technologies match your search." : "No technologies available."}
          </div>
        ) : (
          <div className="row">
            {filteredTechnologies.map((tech) => (
              <div key={tech.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 tech-card" onClick={() => handleTechClick(tech)}>
                  <img
                    src={tech.image}
                    className="card-img-top"
                    alt={tech.title}
                    loading="lazy"
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{tech.title}</h5>
                    <p className="card-text">{tech.description.substring(0, 100)}...</p>
                    <div className="tech-category-badge">
                      {tech.category === "crops" && <span className="badge bg-success">Crop Waste</span>}
                      {tech.category === "horticulture" && <span className="badge bg-warning text-dark">Horticultural Waste</span>}
                      {tech.category === "fisheries" && <span className="badge bg-info text-dark">Fisheries & Animal Waste</span>}
                      {tech.category === "processes" && <span className="badge bg-secondary">Processing Technologies</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTech && (
          <div id="tech-details" className="tech-details mt-5 p-4 rounded shadow-sm">
            <div className="row">
              <div className="col-md-4">
                <img
                  src={selectedTech.image}
                  className="img-fluid rounded"
                  alt={selectedTech.title}
                  loading="lazy"
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              </div>
              <div className="col-md-8">
                <h3>{selectedTech.title}</h3>
                <p className="tech-description">{selectedTech.description}</p>
                <h5>Benefits:</h5>
                <ul className="benefits-list">
                  {selectedTech.benefits.map((benefit, index) => (
                    <li key={index}><i className="bi bi-check-circle-fill text-success me-2"></i>{benefit}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Link to="/waste" className="btn btn-outline-success me-2">
                    Explore Waste Marketplace
                  </Link>
                  <Link to="/waste-analyzer" className="btn btn-outline-primary">
                    Analyze Your Waste
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="waste-management-section mt-5 p-4 rounded shadow-sm">
          <h3 className="text-center mb-4">Sustainable Waste Management Practices</h3>

          <div className="row mt-4">
            <div className="col-md-6 mb-4">
              <div className="practice-card h-100 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-3">
                  <div className="practice-icon me-3">
                    <i className="bi bi-recycle text-success"></i>
                  </div>
                  <h4 className="mb-0">Advanced Composting</h4>
                </div>
                <p>Modern composting techniques using microbial inoculants and controlled conditions can convert agricultural waste into premium organic fertilizer in just 15-20 days, compared to traditional methods that take 3-4 months.</p>
                <ul className="practice-list">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Faster decomposition</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Higher nutrient content</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Better pathogen control</li>
                </ul>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="practice-card h-100 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-3">
                  <div className="practice-icon me-3">
                    <i className="bi bi-lightning-charge text-success"></i>
                  </div>
                  <h4 className="mb-0">Bio-CNG Production</h4>
                </div>
                <p>Converting agricultural waste into Bio-CNG provides a sustainable alternative to fossil fuels. Modern plants can process mixed agricultural waste to produce high-quality vehicle fuel and organic fertilizer as a by-product.</p>
                <ul className="practice-list">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Clean vehicle fuel</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Reduced GHG emissions</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Additional income stream</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="call-to-action mt-5 mb-5 p-5 text-center rounded">
          <div className="row align-items-center">
            <div className="col-lg-8 text-lg-start">
              <h2>Join the Agricultural Waste Management Revolution</h2>
              <p className="lead mb-4">Help create a sustainable future by implementing innovative waste management technologies</p>
              <div className="cta-benefits d-flex flex-wrap mb-4">
                <div className="cta-benefit me-4 mb-2">
                  <i className="bi bi-check-circle-fill text-white me-2"></i>
                  Reduce environmental impact
                </div>
                <div className="cta-benefit me-4 mb-2">
                  <i className="bi bi-check-circle-fill text-white me-2"></i>
                  Create additional revenue
                </div>
                <div className="cta-benefit me-4 mb-2">
                  <i className="bi bi-check-circle-fill text-white me-2"></i>
                  Promote sustainable farming
                </div>
              </div>
              <div className="mt-4 d-flex flex-wrap">
                <Link to="/waste" className="btn btn-light btn-lg me-3 mb-2">
                  <i className="bi bi-recycle me-2"></i>
                  Explore Waste Marketplace
                </Link>
                <Link to="/waste-analyzer" className="btn btn-outline-light btn-lg mb-2">
                  <i className="bi bi-search me-2"></i>
                  Analyze Your Waste
                </Link>
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-block">
              <img
                src="https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg"
                alt="Sustainable Farming"
                className="img-fluid rounded shadow"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedWasteAwarenessPage;