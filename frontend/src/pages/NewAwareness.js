import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col, Badge, Accordion, Alert } from 'react-bootstrap';
import '../styles/NewAwareness.css';

const NewAwareness = () => {
  const [showAlert, setShowAlert] = useState(true);
  
  // Enhanced awareness content
  const awarenessTopics = [
    {
      id: 1,
      title: 'Composting Basics',
      description: 'Learn the fundamentals of composting agricultural waste to create nutrient-rich soil amendments',
      icon: 'bi-recycle',
      link: '/waste'
    },
    {
      id: 2,
      title: 'Biogas Production',
      description: 'Convert organic waste to energy through biogas generation, reducing methane emissions',
      icon: 'bi-lightning-charge',
      link: '/waste'
    },
    {
      id: 3,
      title: 'Waste to Crafts',
      description: 'Transform agricultural waste into handcrafted products, creating additional revenue streams',
      icon: 'bi-palette',
      link: '/waste'
    },
    {
      id: 4,
      title: 'Sustainable Farming',
      description: 'Implement circular economy principles in farming to minimize waste and maximize resource efficiency',
      icon: 'bi-tree',
      link: '/waste'
    },
    {
      id: 5,
      title: 'Bioplastic Production',
      description: 'Convert agricultural residues into biodegradable plastics for packaging and consumer products',
      icon: 'bi-box-seam',
      link: '/waste'
    }
  ];

  const wasteStatistics = [
    { stat: '30%', description: 'of all food produced globally is wasted annually' },
    { stat: '1.3B', description: 'tons of food waste is generated worldwide each year' },
    { stat: '8%', description: 'of global greenhouse gas emissions come from food waste' },
    { stat: '70%', description: 'of agricultural waste can be repurposed or recycled' },
    { stat: '$65B', description: 'potential global market value of recycled agricultural waste by 2025' },
    { stat: '200%', description: 'average ROI for agricultural waste recycling initiatives' },
    { stat: '40%', description: 'potential increase in farm profitability through waste monetization' },
    { stat: '15M', description: 'jobs could be created globally in agricultural waste recycling' }
  ];

  const successStories = [
    {
      title: 'Rice Husk to Energy',
      description: 'A cooperative of rice farmers converted rice husks into biofuel, reducing waste by 90% and generating electricity for local communities. They sell excess energy back to the grid, earning $15,000 monthly.',
      impact: 'Reduced CO2 emissions by 5,000 tons annually'
    },
    {
      title: 'Banana Stem Textiles',
      description: 'Farmers transformed banana stems into sustainable textiles, creating a new revenue stream while eliminating waste. Each ton of banana stems generates $800 in textile products.',
      impact: 'Created jobs for 200+ local artisans'
    },
    {
      title: 'Mushroom Cultivation on Crop Residue',
      description: 'Instead of burning crop residue, farmers used it as substrate for growing gourmet mushrooms. A single acre of crop residue can produce up to 5,000 pounds of mushrooms worth $25,000.',
      impact: 'Increased farm income by 40%'
    },
    {
      title: 'Coconut Waste to Coir Products',
      description: 'Coconut farmers process husks into coir fiber for erosion control mats, growing media, and household products. Each ton of coconut waste generates $1,200 in finished products.',
      impact: 'Diverted 2,000 tons of waste from landfills annually'
    },
    {
      title: 'Sugarcane Bagasse Packaging',
      description: 'A sugar mill converted leftover bagasse into biodegradable food containers, replacing styrofoam. The operation generates $350,000 in annual revenue from waste that was previously discarded.',
      impact: 'Eliminated 120 tons of plastic waste yearly'
    }
  ];

  const faqItems = [
    {
      question: 'What types of agricultural waste can be recycled?',
      answer: 'Almost all agricultural waste has recycling potential. This includes crop residues (stalks, stems, leaves), livestock waste, processing byproducts, and packaging materials. Each type has specific recycling methods and potential applications. High-value opportunities include converting rice husks to silica for industrial applications, transforming nut shells into activated carbon, and processing fruit waste into pectin for food industries.'
    },
    {
      question: 'How can I start composting on my farm?',
      answer: 'Start by designating a composting area, collecting organic waste materials (crop residues, manure, food scraps), layering green and brown materials, maintaining proper moisture, and turning the pile regularly. Basic composting can begin with minimal investment. For commercial-scale operations, consider windrow systems with temperature monitoring to ensure proper decomposition and product quality. Premium compost can sell for $40-75 per cubic yard.'
    },
    {
      question: 'What are the economic benefits of waste management?',
      answer: 'Proper waste management can create new revenue streams through selling compost, recycled materials, or upcycled products. It also reduces disposal costs, improves soil health (reducing fertilizer needs), and can qualify for environmental incentives or carbon credits. Many farmers report ROI of 150-300% on waste recycling investments within 2-3 years. Additionally, waste-derived products often command premium prices in environmentally conscious markets.'
    },
    {
      question: 'Are there regulations I need to follow?',
      answer: 'Regulations vary by location but typically address storage, handling, and processing of agricultural waste. Check with local environmental agencies and agricultural extension offices for specific requirements in your area. Many regions offer regulatory exemptions and streamlined permitting for agricultural waste recycling operations, especially those that reduce environmental impacts.'
    },
    {
      question: 'What equipment do I need to recycle agricultural waste?',
      answer: 'Equipment needs vary based on the recycling method. Basic composting requires minimal equipment (front-end loader, thermometer, screening equipment). More advanced processing might require shredders, pelletizers, dryers, or specialized extraction equipment. Many regions have equipment-sharing programs or subsidies for waste processing technology. Start with equipment that handles your most abundant waste stream and expand as operations grow profitable.'
    },
    {
      question: 'How do I find buyers for my recycled agricultural products?',
      answer: 'Market opportunities include direct sales to other farmers, garden centers, landscapers, food producers, and industrial users. Online marketplaces specifically for agricultural byproducts are growing. Consider contacting local organic farms, nurseries, and sustainability-focused businesses. Agricultural extension offices often maintain lists of potential buyers and can help with market connections. Value-added certification (organic, sustainably produced) can open premium markets.'
    }
  ];

  return (
    <Container className="py-4">
      {showAlert && (
        <Alert variant="success" dismissible onClose={() => setShowAlert(false)} className="mb-4">
          <Alert.Heading><i className="bi bi-info-circle-fill me-2"></i>New Resource Available!</Alert.Heading>
          <p>
            Our waste management guide has been updated with the latest sustainable practices and technologies.
            Explore new ways to transform agricultural waste into valuable resources!
          </p>
        </Alert>
      )}
      
      <Row className="mb-5">
        <Col>
          <div className="awareness-hero">
            <h1 className="display-5 fw-bold mb-3">
              <i className="bi bi-recycle me-2"></i>
              Agricultural Waste Management Awareness
            </h1>
            <p className="lead mb-4">
              Transform agricultural waste into valuable resources with our innovative solutions. 
              Learn sustainable practices, discover new revenue streams, and contribute to a greener future.
            </p>
            <div className="d-flex flex-wrap gap-3 mb-4">
              <Badge bg="light" text="dark" className="p-2 fs-6">Reduce Environmental Impact</Badge>
              <Badge bg="light" text="dark" className="p-2 fs-6">Create New Revenue</Badge>
              <Badge bg="light" text="dark" className="p-2 fs-6">Sustainable Agriculture</Badge>
              <Badge bg="light" text="dark" className="p-2 fs-6">Circular Economy</Badge>
            </div>
            <Link to="/waste-analyzer" className="btn btn-light awareness-ai-button btn-lg">
              <i className="bi bi-search me-2"></i>
              Analyze Your Waste
            </Link>
          </div>
        </Col>
      </Row>

      {/* Key Statistics Section */}
      <Row className="mb-5 awareness-section">
        <Col xs={12}>
          <h2 className="awareness-section-title mb-4">The Impact of Agricultural Waste</h2>
        </Col>
        {wasteStatistics.map((item, index) => (
          <Col md={3} sm={6} className="mb-4" key={index}>
            <Card className="text-center h-100 awareness-card">
              <Card.Body>
                <h2 className="display-4 fw-bold text-success">{item.stat}</h2>
                <p className="card-text">{item.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Key Topics Section */}
      <Row className="mb-5 awareness-section">
        <Col xs={12}>
          <h2 className="awareness-section-title mb-4">Key Waste Management Solutions</h2>
        </Col>
        {awarenessTopics.map(topic => (
          <Col md={6} lg={3} className="mb-4" key={topic.id}>
            <Card className="h-100 awareness-card">
              <Card.Body className="text-center">
                <i className={`bi ${topic.icon} awareness-icon`}></i>
                <h5 className="awareness-topic-title">{topic.title}</h5>
                <p className="card-text">{topic.description}</p>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <Link to={topic.link} className="btn btn-outline-success w-100">
                  Learn More
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Success Stories Section */}
      <Row className="mb-5 awareness-section">
        <Col xs={12}>
          <h2 className="awareness-section-title mb-4">Success Stories</h2>
        </Col>
        {successStories.map((story, index) => (
          <Col md={4} className="mb-4" key={index}>
            <Card className="h-100 awareness-card">
              <Card.Body>
                <h5 className="awareness-topic-title">{story.title}</h5>
                <p className="card-text">{story.description}</p>
                <Badge bg="success" className="p-2">{story.impact}</Badge>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Benefits and Resources Section */}
      <Row className="mb-5 awareness-section">
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h4 className="awareness-section-title">Why Waste Management Matters</h4>
              <ul className="list-group list-group-flush">
                <li className="awareness-list-item">Reduces environmental pollution and soil contamination</li>
                <li className="awareness-list-item">Creates additional income streams through value-added products</li>
                <li className="awareness-list-item">Conserves natural resources and improves soil health</li>
                <li className="awareness-list-item">Minimizes greenhouse gas emissions and carbon footprint</li>
                <li className="awareness-list-item">Promotes circular economy principles in agriculture</li>
                <li className="awareness-list-item">Enhances farm sustainability and resilience</li>
                <li className="awareness-list-item">Reduces disposal costs and regulatory compliance issues</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <h4 className="awareness-section-title">Get Personalized Solutions</h4>
              <p className="card-text">
                Not sure what to do with your agricultural waste? Our tools can help you
                identify the best solutions based on your specific situation.
              </p>
              <p className="card-text">
                Get information about:
              </p>
              <ul className="mb-4">
                <li>Optimal processing methods for your waste type</li>
                <li>Potential market opportunities and value-added products</li>
                <li>Environmental impact assessment</li>
                <li>Cost-benefit analysis of different solutions</li>
              </ul>
              <div className="d-grid gap-2">
                <Link to="/waste-analyzer" className="btn awareness-ai-button">
                  <i className="bi bi-robot me-2"></i>
                  Use Waste Analyzer
                </Link>
                <Link to="/waste" className="btn btn-outline-success">
                  <i className="bi bi-search me-2"></i>
                  Explore Waste Products
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monetization Opportunities Section */}
      <Row className="mb-5 awareness-section">
        <Col xs={12}>
          <h2 className="awareness-section-title mb-4">Turning Agricultural Waste into Profit</h2>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-3">High-Value Recycling Opportunities</h5>
              <Row>
                <Col md={4} className="mb-3">
                  <div className="p-3 border rounded h-100">
                    <h6><i className="bi bi-currency-dollar me-2 text-success"></i>Compost & Soil Amendments</h6>
                    <p className="small mb-2">Market Value: $200-500 per ton</p>
                    <p className="small">Convert crop residues, manure, and processing waste into premium compost and soil amendments. Specialized formulations for organic farming can command premium prices.</p>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="p-3 border rounded h-100">
                    <h6><i className="bi bi-currency-dollar me-2 text-success"></i>Biochar Production</h6>
                    <p className="small mb-2">Market Value: $500-2,500 per ton</p>
                    <p className="small">Convert woody agricultural waste into biochar through pyrolysis. Biochar improves soil health, sequesters carbon, and can be sold to farmers, gardeners, and carbon offset programs.</p>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="p-3 border rounded h-100">
                    <h6><i className="bi bi-currency-dollar me-2 text-success"></i>Animal Feed Ingredients</h6>
                    <p className="small mb-2">Market Value: $150-600 per ton</p>
                    <p className="small">Process suitable crop residues into animal feed ingredients. Treated rice straw, corn stover, and other residues can replace more expensive feed components.</p>
                  </div>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={4} className="mb-3">
                  <div className="p-3 border rounded h-100">
                    <h6><i className="bi bi-currency-dollar me-2 text-success"></i>Bioplastic Feedstock</h6>
                    <p className="small mb-2">Market Value: $800-3,000 per ton</p>
                    <p className="small">Starch-rich and cellulosic agricultural waste can be processed into raw materials for biodegradable plastics, meeting growing demand for sustainable packaging.</p>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="p-3 border rounded h-100">
                    <h6><i className="bi bi-currency-dollar me-2 text-success"></i>Essential Oils & Extracts</h6>
                    <p className="small mb-2">Market Value: $50-500 per liter</p>
                    <p className="small">Citrus peels, herb residues, and other aromatic crop waste can be distilled into essential oils for food, cosmetic, and pharmaceutical industries.</p>
                  </div>
                </Col>
                <Col md={4} className="mb-3">
                  <div className="p-3 border rounded h-100">
                    <h6><i className="bi bi-currency-dollar me-2 text-success"></i>Mushroom Substrate</h6>
                    <p className="small mb-2">Market Value: $300-800 per ton</p>
                    <p className="small">Prepare and sell specialized growing media from agricultural waste for gourmet and medicinal mushroom producers, or start your own mushroom operation.</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Steps to Monetize Your Agricultural Waste</h5>
              <ol className="mb-0">
                <li className="mb-2"><strong>Assess Your Waste Stream:</strong> Identify types, quantities, and seasonal availability of your agricultural waste.</li>
                <li className="mb-2"><strong>Research Local Markets:</strong> Determine which recycled products have demand in your region.</li>
                <li className="mb-2"><strong>Start Small:</strong> Begin with pilot projects to test processing methods and product quality.</li>
                <li className="mb-2"><strong>Build Partnerships:</strong> Connect with other producers to aggregate waste streams or share processing equipment.</li>
                <li className="mb-2"><strong>Seek Certification:</strong> Obtain organic or other certifications to access premium markets.</li>
                <li><strong>Explore Grants:</strong> Many regions offer financial support for agricultural waste recycling initiatives.</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* FAQ Section */}
      <Row className="mb-5 awareness-section">
        <Col xs={12}>
          <h2 className="awareness-section-title mb-4">Frequently Asked Questions</h2>
          <Accordion>
            {faqItems.map((item, index) => (
              <Accordion.Item eventKey={index.toString()} key={index}>
                <Accordion.Header>
                  <span className="fw-bold">{item.question}</span>
                </Accordion.Header>
                <Accordion.Body>
                  {item.answer}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row className="mb-4">
        <Col xs={12}>
          <div className="awareness-cta">
            <div className="text-center">
              <h3 className="awareness-cta-title mb-3">Ready to Transform Your Agricultural Waste?</h3>
              <p className="mb-4">
                Join our community of farmers, processors, and experts committed to sustainable agriculture.
                Share knowledge, find solutions, and contribute to a greener future.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/waste-analyzer" className="btn btn-light awareness-ai-button btn-lg">
                  <i className="bi bi-search me-2"></i>
                  Analyze Your Waste
                </Link>
                <Link to="/waste" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-arrow-right me-2"></i>
                  Explore Solutions
                </Link>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NewAwareness;