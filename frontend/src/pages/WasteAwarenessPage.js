import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/WasteAwareness.css";

const WasteAwarenessPage = () => {
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
          {
            id: 6,
            category: "horticulture",
            title: "Banana Fiber from Pseudostem Sheath",
            description: "Process to extract high-quality natural fibers from banana pseudostem sheaths that are typically discarded after harvest.",
            benefits: ["Creates textile-grade fibers", "Utilizes post-harvest waste", "Biodegradable alternative to synthetic fibers", "Additional income for banana farmers"],
            image: "https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg" // Banana plant/fiber image
          },
          
          // Fisheries & Animal Waste Technologies
          {
            id: 7,
            category: "fisheries",
            title: "Chitin and Chitosan from Prawn Shell Waste",
            description: "Process to extract chitin and chitosan from prawn shell waste, creating valuable biomaterials with numerous applications.",
            benefits: ["Pharmaceutical applications", "Food preservation", "Water treatment", "Biomedical uses"],
            image: "https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg" // Prawn/seafood image
          },
          {
            id: 8,
            category: "fisheries",
            title: "Calcium from Fish Bones",
            description: "Technology to extract high-quality calcium from fish bones that would otherwise be discarded as waste.",
            benefits: ["Nutritional supplements", "Pharmaceutical applications", "Complete fish utilization", "Reduces fishery waste"],
            image: "https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg" // Fish processing image
          },
          
          // Waste Processing Technologies
          {
            id: 9,
            category: "processes",
            title: "Pilot Plant for Production of Protein Isolates from De-Oiled Cakes",
            description: "Technology to extract high-quality protein isolates from de-oiled seed cakes, a by-product of oil extraction.",
            benefits: ["High-protein food ingredients", "Utilizes oil industry by-products", "Nutritional enhancement", "Value addition"],
            image: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg" // Protein powder/food processing image
          },
          {
            id: 10,
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
            <h1>Waste Awareness</h1>
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
              <WasteAwarenessImage
                src="https://images.pexels.com/photos/2537122/pexels-photo-2537122.jpeg"
                alt="Sustainable Agriculture"
                className="img-fluid rounded shadow"
                fallbackCategory="agriculture"
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
                  <WasteAwarenessImage
                    src={tech.image}
                    className="card-img-top"
                    alt={tech.title}
                    fallbackCategory="waste"
                    style={{ height: '200px', objectFit: 'cover' }}
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
                <WasteAwarenessImage
                  src={selectedTech.image}
                  className="img-fluid rounded"
                  alt={selectedTech.title}
                  fallbackCategory="waste"
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
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
                  <Link to="/wastes" className="btn btn-outline-success me-2">
                    Explore Waste Marketplace
                  </Link>
                  <Link to="/contact" className="btn btn-outline-primary">
                    Contact for Implementation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="awareness-facts mt-5 p-4 rounded">
          <h3>Did You Know?</h3>
          <div className="row">
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="fact-card">
                <div className="fact-icon">
                  <i className="bi bi-trash"></i>
                </div>
                <h4>350 Million</h4>
                <p>Tonnes of agricultural waste is generated in India every year</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="fact-card">
                <div className="fact-icon">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <h4>18,000 MW</h4>
                <p>Potential power generation from agricultural waste annually</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="fact-card">
                <div className="fact-icon">
                  <i className="bi bi-recycle"></i>
                </div>
                <h4>1.3 Billion</h4>
                <p>Tonnes of food products for human consumption gets wasted globally every year</p>
              </div>
            </div>
            <div className="col-md-6 col-lg-3 mb-3">
              <div className="fact-card">
                <div className="fact-icon">
                  <i className="bi bi-globe"></i>
                </div>
                <h4>2 Million</h4>
                <p>Tonnes of potato waste is generated in India alone annually</p>
              </div>
            </div>
          </div>
        </div>

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
                <div className="row">
                  <div className="col-md-5">
                    <WasteAwarenessImage
                      src="https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg"
                      alt="Advanced Composting"
                      className="img-fluid rounded mb-3"
                      fallbackCategory="compost"
                    />
                  </div>
                  <div className="col-md-7">
                    <p>Modern composting techniques using microbial inoculants and controlled conditions can convert agricultural waste into premium organic fertilizer in just 15-20 days, compared to traditional methods that take 3-4 months.</p>
                  </div>
                </div>
                <ul className="practice-list">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Faster decomposition</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Higher nutrient content</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Better pathogen control</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Premium market value</li>
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
                <div className="row">
                  <div className="col-md-5">
                    <WasteAwarenessImage
                      src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg"
                      alt="Bio-CNG Production"
                      className="img-fluid rounded mb-3"
                      fallbackCategory="biogas"
                    />
                  </div>
                  <div className="col-md-7">
                    <p>Converting agricultural waste into Bio-CNG provides a sustainable alternative to fossil fuels. Modern plants can process mixed agricultural waste to produce high-quality vehicle fuel and organic fertilizer as a by-product.</p>
                  </div>
                </div>
                <ul className="practice-list">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Clean vehicle fuel</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Reduced GHG emissions</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Additional income stream</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Organic fertilizer by-product</li>
                </ul>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="practice-card h-100 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-3">
                  <div className="practice-icon me-3">
                    <i className="bi bi-box-seam text-success"></i>
                  </div>
                  <h4 className="mb-0">Bio-Packaging Materials</h4>
                </div>
                <div className="row">
                  <div className="col-md-5">
                    <WasteAwarenessImage
                      src="https://images.pexels.com/photos/5725891/pexels-photo-5725891.jpeg"
                      alt="Bio-Packaging"
                      className="img-fluid rounded mb-3"
                      fallbackCategory="packaging"
                    />
                  </div>
                  <div className="col-md-7">
                    <p>Agricultural waste like sugarcane bagasse, rice straw, and corn stalks can be processed into biodegradable packaging materials, replacing plastic and styrofoam containers.</p>
                  </div>
                </div>
                <ul className="practice-list">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Eco-friendly alternatives</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Biodegradable products</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Growing market demand</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Premium pricing</li>
                </ul>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="practice-card h-100 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-3">
                  <div className="practice-icon me-3">
                    <i className="bi bi-building text-success"></i>
                  </div>
                  <h4 className="mb-0">Construction Materials</h4>
                </div>
                <div className="row">
                  <div className="col-md-5">
                    <WasteAwarenessImage
                      src="https://images.pexels.com/photos/7108819/pexels-photo-7108819.jpeg"
                      alt="Construction Materials"
                      className="img-fluid rounded mb-3"
                      fallbackCategory="construction"
                    />
                  </div>
                  <div className="col-md-7">
                    <p>Agricultural waste can be transformed into sustainable construction materials like particle boards, insulation panels, and eco-friendly bricks, reducing the carbon footprint of the construction industry.</p>
                  </div>
                </div>
                <ul className="practice-list">
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Sustainable building materials</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Lower carbon footprint</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Cost-effective alternatives</li>
                  <li><i className="bi bi-check-circle-fill text-success me-2"></i>Improved insulation properties</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="waste-impact-section mt-5 p-4 rounded shadow-sm">
          <h3 className="text-center mb-4">Environmental Impact of Agricultural Waste</h3>

          <div className="impact-intro mb-4">
            <div className="row align-items-center">
              <div className="col-md-4">
                <WasteAwarenessImage
                  src="https://images.pexels.com/photos/4167544/pexels-photo-4167544.jpeg"
                  alt="Environmental Impact"
                  className="img-fluid rounded shadow"
                  fallbackCategory="pollution"
                />
              </div>
              <div className="col-md-8">
                <p className="lead">Agricultural waste, when improperly managed, can have severe consequences for our environment and health.</p>
                <p>Each year, millions of tons of agricultural waste are generated globally. Without proper management, this waste contributes to various environmental problems, from water pollution to climate change. Understanding these impacts is crucial for developing effective waste management strategies.</p>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6 col-lg-3 mb-4">
              <div className="impact-card h-100 p-3 bg-light rounded shadow-sm">
                <div className="impact-icon mb-3">
                  <i className="bi bi-water text-primary"></i>
                </div>
                <h5>Water Pollution</h5>
                <p>Improper disposal of agricultural waste can lead to water pollution through runoff containing pesticides, fertilizers, and organic matter, causing eutrophication and harming aquatic ecosystems.</p>
                <div className="impact-stat mt-3 p-2 bg-white rounded text-center">
                  <span className="text-danger fw-bold">70%</span> of agricultural runoff reaches water bodies
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3 mb-4">
              <div className="impact-card h-100 p-3 bg-light rounded shadow-sm">
                <div className="impact-icon mb-3">
                  <i className="bi bi-cloud text-primary"></i>
                </div>
                <h5>Air Pollution</h5>
                <p>Burning agricultural waste releases particulate matter, carbon monoxide, and other harmful gases into the atmosphere, contributing to air pollution and respiratory health issues.</p>
                <div className="impact-stat mt-3 p-2 bg-white rounded text-center">
                  <span className="text-danger fw-bold">92 Million</span> tonnes of crop residue burned annually
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3 mb-4">
              <div className="impact-card h-100 p-3 bg-light rounded shadow-sm">
                <div className="impact-icon mb-3">
                  <i className="bi bi-globe text-primary"></i>
                </div>
                <h5>Greenhouse Gas Emissions</h5>
                <p>Decomposing agricultural waste in landfills produces methane, a potent greenhouse gas that contributes significantly to climate change.</p>
                <div className="impact-stat mt-3 p-2 bg-white rounded text-center">
                  <span className="text-danger fw-bold">25x</span> more potent than CO₂ (methane)
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3 mb-4">
              <div className="impact-card h-100 p-3 bg-light rounded shadow-sm">
                <div className="impact-icon mb-3">
                  <i className="bi bi-flower1 text-primary"></i>
                </div>
                <h5>Soil Degradation</h5>
                <p>Improper waste management can lead to soil contamination and degradation, reducing agricultural productivity and threatening food security.</p>
                <div className="impact-stat mt-3 p-2 bg-white rounded text-center">
                  <span className="text-danger fw-bold">33%</span> of global soil is moderately to highly degraded
                </div>
              </div>
            </div>
          </div>

          <div className="impact-solution mt-4 p-3 bg-success-subtle rounded">
            <h5 className="text-success"><i className="bi bi-lightbulb me-2"></i>The Solution</h5>
            <p>Proper waste management practices can transform these environmental challenges into opportunities. By implementing composting, biogas production, and other sustainable techniques, we can reduce pollution while creating valuable resources from waste.</p>
          </div>
        </div>

        <div className="educational-resources mt-5 p-4 rounded shadow-sm">
          <h3 className="text-center mb-4">Educational Resources</h3>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="resource-card h-100 p-3 bg-light rounded shadow-sm text-center">
                <div className="resource-icon mb-3">
                  <i className="bi bi-book text-success"></i>
                </div>
                <h5>Guides & Manuals</h5>
                <p>Download comprehensive guides on agricultural waste management techniques for farmers and agricultural businesses.</p>
                <button className="btn btn-outline-success mt-3">Download Resources</button>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="resource-card h-100 p-3 bg-light rounded shadow-sm text-center">
                <div className="resource-icon mb-3">
                  <i className="bi bi-camera-video text-success"></i>
                </div>
                <h5>Video Tutorials</h5>
                <p>Watch step-by-step video tutorials on implementing various waste management practices on your farm.</p>
                <button className="btn btn-outline-success mt-3">Watch Videos</button>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="resource-card h-100 p-3 bg-light rounded shadow-sm text-center">
                <div className="resource-icon mb-3">
                  <i className="bi bi-people text-success"></i>
                </div>
                <h5>Community Forums</h5>
                <p>Join our community of farmers and experts to share experiences and get advice on waste management.</p>
                <button className="btn btn-outline-success mt-3">Join Community</button>
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
                <Link to="/wastes" className="btn btn-light btn-lg me-3 mb-2">
                  <i className="bi bi-recycle me-2"></i>
                  Explore Waste Marketplace
                </Link>
                <Link to="/contact" className="btn btn-outline-light btn-lg mb-2">
                  <i className="bi bi-envelope me-2"></i>
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="col-lg-4 d-none d-lg-block">
              <WasteAwarenessImage
                src="https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg"
                alt="Sustainable Farming"
                className="img-fluid rounded shadow"
                fallbackCategory="sustainable"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteAwarenessPage;