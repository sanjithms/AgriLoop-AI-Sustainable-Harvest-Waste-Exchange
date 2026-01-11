import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Card, Container, Row, Col, Form, Button, Badge, Spinner, Alert, Tabs, Tab, Modal, Image } from "react-bootstrap";
import { FaLeaf, FaRecycle, FaLightbulb, FaSearch, FaFilter, FaRobot } from "react-icons/fa";
import "../styles/Awareness.css";

// Helper function to get API base URL
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return window.location.origin.includes('localhost') 
    ? 'http://localhost:3000' 
    : window.location.origin;
};

const AwarenessPage = () => {
  const [wasteData, setWasteData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWasteType, setSelectedWasteType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const wasteTypes = [
    "All",
    "Organic Waste",
    "Plastic Waste",
    "Wood Waste",
    "Metal Waste",
    "Other"
  ];

  const fetchWasteData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/waste-info');
      
      // Log the response for debugging
      console.log('Waste info response:', response);

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      // Check if response.data.data exists and is an array
      const wasteData = response.data.data;
      if (Array.isArray(wasteData)) {
        setWasteData(wasteData);
      } else if (Array.isArray(response.data)) {
        // Handle case where data might be directly in response.data
        setWasteData(response.data);
      } else if (response.data.success && Array.isArray(response.data.items)) {
        // Handle case where data might be in response.data.items
        setWasteData(response.data.items);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error("Error in fetchWasteData:", err);
      setError(err.response?.data?.message || "Failed to fetch waste information. Please try again.");
      setWasteData([]); // Set empty array on error to prevent undefined issues
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWasteData();
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const requestAIAnalysis = async (item) => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/ai/analyze-waste', {
        wasteType: item.wasteType,
        description: item.description,
        composition: item.composition || {}
      });
      
      setAiAnalysis(response.data);
      setActiveTab('ai-analysis');
    } catch (err) {
      console.error('Error getting AI analysis:', err);
      setError('Failed to get AI analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMarketValue = (value) => {
    const colors = {
      'High': 'success',
      'Medium': 'info',
      'Low': 'warning'
    };
    return <Badge bg={colors[value] || 'secondary'}>{value}</Badge>;
  };

  const renderComplexity = (value) => {
    const colors = {
      'High': 'danger',
      'Medium': 'warning',
      'Low': 'success'
    };
    return <Badge bg={colors[value] || 'secondary'}>{value}</Badge>;
  };

  const filteredData = wasteData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedWasteType === "All" || item.wasteType === selectedWasteType;
    
    return matchesSearch && matchesType;
  });

  const renderAIAnalysisTab = () => {
    if (isAnalyzing) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Analyzing waste management opportunities...</p>
        </div>
      );
    }

    if (!aiAnalysis) {
      return (
        <div className="text-center py-4">
          <Button 
            variant="primary" 
            onClick={() => requestAIAnalysis(selectedItem)}
          >
            <FaRobot className="me-2" />
            Get AI Analysis
          </Button>
        </div>
      );
    }

    return (
      <div className="mt-3">
        <h5><FaRobot className="me-2" />AI Recommendations</h5>
        {aiAnalysis.recommendations && (
          <Card className="mb-3">
            <Card.Body>
              <h6>Recommended Processing Methods</h6>
              <ul>
                {aiAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}

        {aiAnalysis.marketOpportunities && (
          <Card className="mb-3">
            <Card.Body>
              <h6>Market Opportunities</h6>
              <ul>
                {aiAnalysis.marketOpportunities.map((opp, idx) => (
                  <li key={idx}>
                    {opp.opportunity} 
                    {opp.potentialValue && (
                      <Badge bg="success" className="ms-2">
                        Potential Value: {opp.potentialValue}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}

        {aiAnalysis.environmentalImpact && (
          <Card>
            <Card.Body>
              <h6>Environmental Impact Assessment</h6>
              <p>{aiAnalysis.environmentalImpact}</p>
            </Card.Body>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="text-center mb-4 p-4 bg-light rounded-3">
            <h1 className="display-5 fw-bold mb-3">
              <FaRecycle className="me-2 text-success" />
              Smart Waste Management & Upcycling
            </h1>
            <p className="lead px-md-5 mx-md-5">
              Transform agricultural waste into valuable resources with our innovative solutions. 
              Explore sustainable practices, discover new revenue streams, and contribute to a greener future.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <Badge bg="success" className="p-2">Reduce Waste</Badge>
              <Badge bg="info" className="p-2">Create Value</Badge>
              <Badge bg="warning" className="p-2">Sustainable Farming</Badge>
            </div>
          </div>
        </Col>
      </Row>

      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col lg={6} md={12} className="mb-3 mb-lg-0">
              <Form.Group className="position-relative">
                <Form.Label><FaSearch className="me-2" />Search Waste Solutions</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by keyword, material, or application..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                  className="py-2"
                />
                <FaSearch style={{ position: 'absolute', right: '10px', bottom: '12px', opacity: 0.5 }} />
              </Form.Group>
            </Col>
            <Col lg={4} md={8} className="mb-3 mb-lg-0">
              <Form.Group>
                <Form.Label><FaFilter className="me-2" />Filter by Waste Type</Form.Label>
                <Form.Select
                  value={selectedWasteType}
                  onChange={(e) => setSelectedWasteType(e.target.value)}
                  disabled={loading}
                  className="py-2"
                >
                  {wasteTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={2} md={4}>
              <Button 
                variant="outline-success" 
                className="w-100 mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedWasteType("All");
                }}
                disabled={loading || (searchTerm === "" && selectedWasteType === "All")}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Loading waste management information...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <Alert variant="info">
          <FaLightbulb className="me-2" />
          {searchTerm || selectedWasteType !== "All" ? 
            "No waste management information matches your search criteria." : 
            "No waste management information available."}
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredData.map((item, index) => (
            <Col key={index}>
              <Card 
                className="h-100 shadow-sm hover-card waste-card" 
                onClick={() => handleItemClick(item)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                {item.image ? (
                  <Card.Img 
                    variant="top" 
                    src={`${getApiBaseUrl()}/${item.image}`} 
                    alt={item.title || 'Waste management'}
                    style={{ height: '180px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x180?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="placeholder-image d-flex align-items-center justify-content-center" style={{ height: '180px', backgroundColor: '#f8f9fa' }}>
                    <FaRecycle size={50} color="#6c757d" />
                  </div>
                )}
                <Card.Body>
                  <Card.Title>{item.title || 'Untitled'}</Card.Title>
                  {item.wasteType && <Badge bg="info" className="mb-2">{item.wasteType}</Badge>}
                  <Card.Text className="text-truncate">{item.description || 'No description available'}</Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {item.methods && Array.isArray(item.methods) && item.methods.length > 0 ? (
                        <span>{item.methods.length} processing method{item.methods.length !== 1 ? 's' : ''}</span>
                      ) : (
                        <span>No processing methods</span>
                      )}
                    </small>
                    {item.potentialApplications && Array.isArray(item.potentialApplications) && item.potentialApplications.length > 0 && (
                      <Badge bg="success" pill>
                        {item.potentialApplications.length} application{item.potentialApplications.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Detailed Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        {selectedItem && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="overview" title="Overview">
                  <Row>
                    {selectedItem.image && (
                      <Col md={4} className="mb-3">
                        <Image 
                          src={`${getApiBaseUrl()}/${selectedItem.image}`} 
                          alt={selectedItem.title || 'Waste management'}
                          fluid 
                          rounded 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                        />
                      </Col>
                    )}
                    <Col md={selectedItem.image ? 8 : 12}>
                      <h5>Description</h5>
                      <p>{selectedItem.description || 'No description available'}</p>
                      
                      <h5>Waste Type</h5>
                      <p><Badge bg="info">{selectedItem.wasteType || 'Other'}</Badge></p>
                      {selectedItem.methods && Array.isArray(selectedItem.methods) && selectedItem.methods.length > 0 && (
                        <>
                          <h5>Processing Methods</h5>
                          <ul>
                            {selectedItem.methods.map((method, idx) => (
                              <li key={idx}>{method}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </Col>
                  </Row>
                </Tab>
                
                <Tab eventKey="composition" title="Composition" disabled={!selectedItem.composition}>
                  {selectedItem.composition && typeof selectedItem.composition === 'object' ? (
                    <Row className="mt-3">
                      <Col>
                        <h5>Waste Composition</h5>
                        <Row xs={1} md={2} lg={3} className="g-3 mt-1">
                          {Object.entries(selectedItem.composition).map(([key, value]) => (
                            value && (
                              <Col key={key}>
                                <Card className="text-center h-100">
                                  <Card.Body>
                                    <h6>{key.charAt(0).toUpperCase() + key.slice(1)}</h6>
                                    <p className="lead">{value}{key === 'moisture' || key === 'organicMatter' || key === 'carbonContent' ? '%' : ' mg/kg'}</p>
                                  </Card.Body>
                                </Card>
                              </Col>
                            )
                          ))}
                        </Row>
                      </Col>
                    </Row>
                  ) : (
                    <Alert variant="info" className="mt-3">
                      <FaLightbulb className="me-2" />
                      No composition data available for this waste type.
                    </Alert>
                  )}
                </Tab>
                
                <Tab eventKey="applications" title="Applications" disabled={!selectedItem.potentialApplications || selectedItem.potentialApplications.length === 0}>
                  {selectedItem.potentialApplications && selectedItem.potentialApplications.length > 0 && (
                    <div className="mt-3">
                      <h5>Potential Applications</h5>
                      <Row xs={1} md={2} className="g-3">
                        {selectedItem.potentialApplications.map((app, idx) => (
                          <Col key={idx}>
                            <Card className="h-100">
                              <Card.Body>
                                <Card.Title>{app.name}</Card.Title>
                                <Card.Text>{app.description}</Card.Text>
                              </Card.Body>
                              <Card.Footer className="bg-white">
                                <div className="d-flex justify-content-between">
                                  <div>Market Value: {renderMarketValue(app.marketValue)}</div>
                                  <div>Complexity: {renderComplexity(app.implementationComplexity)}</div>
                                </div>
                              </Card.Footer>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Tab>
                
                <Tab eventKey="benefits" title="Benefits" disabled={!selectedItem.environmentalBenefits || selectedItem.environmentalBenefits.length === 0}>
                  {selectedItem.environmentalBenefits && selectedItem.environmentalBenefits.length > 0 && (
                    <div className="mt-3">
                      <h5>Environmental Benefits</h5>
                      <Row xs={1} md={2} className="g-3">
                        {selectedItem.environmentalBenefits.map((benefit, idx) => (
                          <Col key={idx}>
                            <Card className="h-100">
                              <Card.Body>
                                <Card.Title>
                                  <FaLeaf className="me-2 text-success" />
                                  {benefit.benefit}
                                </Card.Title>
                                <Card.Text>{benefit.impact}</Card.Text>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Tab>
                
                <Tab eventKey="processing" title="Processing" disabled={!selectedItem.processingMethods || selectedItem.processingMethods.length === 0}>
                  {selectedItem.processingMethods && selectedItem.processingMethods.length > 0 && (
                    <div className="mt-3">
                      <h5>Detailed Processing Methods</h5>
                      {selectedItem.processingMethods.map((method, idx) => (
                        <Card key={idx} className="mb-3">
                          <Card.Body>
                            <Card.Title>{method.method}</Card.Title>
                            <Card.Text>{method.description}</Card.Text>
                            
                            {method.requiredEquipment && method.requiredEquipment.length > 0 && (
                              <div className="mt-3">
                                <h6>Required Equipment</h6>
                                <ul>
                                  {method.requiredEquipment.map((equipment, i) => (
                                    <li key={i}>{equipment}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <Row className="mt-3">
                              {method.estimatedCost && (
                                <Col md={6}>
                                  <h6>Estimated Cost</h6>
                                  <p>${method.estimatedCost.toLocaleString()}</p>
                                </Col>
                              )}
                              {method.estimatedROI && (
                                <Col md={6}>
                                  <h6>Estimated ROI</h6>
                                  <p>{method.estimatedROI}</p>
                                </Col>
                              )}
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Tab>

                <Tab eventKey="success" title="Success Stories" disabled={!selectedItem.successStories || selectedItem.successStories.length === 0}>
                  {selectedItem.successStories && selectedItem.successStories.length > 0 && (
                    <div className="mt-3">
                      <h5>Success Stories</h5>
                      {selectedItem.successStories.map((story, idx) => (
                        <Card key={idx} className="mb-3">
                          <Card.Body>
                            <Card.Title>{story.title}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                              {story.location} ({story.yearImplemented})
                            </Card.Subtitle>
                            <Card.Text>{story.description}</Card.Text>
                            <h6>Impact</h6>
                            <p>{story.impact}</p>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Tab>
                
                <Tab eventKey="guidelines" title="Guidelines" disabled={!selectedItem.guidelines || selectedItem.guidelines.length === 0}>
                  {selectedItem.guidelines && selectedItem.guidelines.length > 0 && (
                    <div className="mt-3">
                      <h5>Implementation Guidelines</h5>
                      <div className="position-relative">
                        {selectedItem.guidelines.map((guideline, idx) => (
                          <Card key={idx} className="mb-3">
                            <Card.Body>
                              <div className="d-flex">
                                <div className="me-3">
                                  <div 
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                      backgroundColor: '#28a745',
                                      color: 'white',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {idx + 1}
                                  </div>
                                </div>
                                <div>
                                  <h5>{guideline.step}</h5>
                                  <p>{guideline.description}</p>
                                  
                                  {guideline.bestPractices && guideline.bestPractices.length > 0 && (
                                    <div>
                                      <h6>Best Practices</h6>
                                      <ul>
                                        {guideline.bestPractices.map((practice, i) => (
                                          <li key={i}>{practice}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="ai-analysis" title="AI Analysis">
                  {renderAIAnalysisTab()}
                </Tab>
              </Tabs>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default AwarenessPage;
