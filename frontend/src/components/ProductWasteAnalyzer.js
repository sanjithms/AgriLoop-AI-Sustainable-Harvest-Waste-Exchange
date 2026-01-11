import React, { useState, useEffect } from 'react';
import '../styles/ProductWasteAnalyzer.css';

// This component is used for analyzing agricultural waste products

// Ensure this component can be rendered even if TensorFlow.js is not yet installed

const ProductWasteAnalyzer = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // List of common agricultural products and waste items for suggestions
  const commonItems = [
    'Rice Straw', 'Corn Husks', 'Sugarcane Bagasse', 'Coconut Shells',
    'Coffee Grounds', 'Banana Peels', 'Potato Peels', 'Tomato Waste',
    'Wheat Straw', 'Groundnut Shells', 'Mango Seeds', 'Citrus Peels',
    'Fish Waste', 'Poultry Waste', 'Dairy Waste', 'Mushroom Waste',
    'Cotton Stalks', 'Jute Waste', 'Soybean Waste', 'Palm Oil Waste',
    'Almond Hulls', 'Olive Pomace', 'Grape Pomace', 'Apple Pomace',
    'Pineapple Waste', 'Cassava Peels', 'Onion Peels', 'Garlic Skins',
    'Corn Cobs', 'Rice Husk', 'Wheat Bran', 'Sunflower Husks',
    'Bamboo Waste', 'Cocoa Pod Husks', 'Tea Waste', 'Cashew Shells',
    'Walnut Shells', 'Pistachio Shells', 'Hazelnut Shells', 'Macadamia Shells'
  ];

  // Filter suggestions based on user input
  useEffect(() => {
    if (query.length > 1) {
      const filtered = commonItems.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    analyzeItem(query);
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
    analyzeItem(suggestion);
  };

  // Analyze the product or waste item
  const analyzeItem = (itemName) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Simulate AI processing delay
    setTimeout(() => {
      try {
        // In a real application, this would be an API call to an AI service
        // For now, we'll use predefined data for demonstration
        const analysisResult = generateAnalysis(itemName);
        setResult(analysisResult);

        // Send analytics event (in a real app, this would track usage)
        if (window.gtag) {
          window.gtag('event', 'waste_analysis', {
            'event_category': 'engagement',
            'event_label': itemName
          });
        }

        setIsAnalyzing(false);
      } catch (err) {
        setError("Sorry, we couldn't analyze this item. Please try another one.");
        setIsAnalyzing(false);
      }
    }, 2000);
  };

  // Generate analysis based on item name
  // In a real app, this would be replaced with an actual AI API call
  const generateAnalysis = (itemName) => {
    const lowerCaseItem = itemName.toLowerCase();

    // Predefined analyses for common items
    const analyses = {
      'rice straw': {
        name: 'Rice Straw',
        type: 'Agricultural Waste',
        description: 'Rice straw is the vegetative part of the rice plant that remains after harvesting the grain. It is one of the most abundant agricultural residues globally.',
        composition: ['Cellulose (32-47%)', 'Hemicellulose (19-27%)', 'Lignin (5-24%)', 'Silica (13-20%)', 'Ash (10-17%)'],
        traditionalDisposal: 'Traditionally, rice straw is often burned in fields, causing significant air pollution and greenhouse gas emissions.',
        marketPrices: {
          raw: {
            price: '₹1,000-1,500 per ton',
            notes: 'Price varies by season and region; higher during fodder shortages'
          },
          processed: {
            price: '₹3,000-5,000 per ton',
            notes: 'Baled, chopped or pelletized for easier transportation and storage'
          },
          valueAdded: {
            price: '₹8,000-15,000 per ton',
            notes: 'Processed into mushroom substrate, paper pulp, or bioethanol feedstock'
          }
        },
        valueChain: [
          {
            stage: 'Collection & Preprocessing',
            description: 'Rice straw is collected after harvest, dried, and sometimes chopped or shredded to make it easier to process.',
            image: 'https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Processing',
            description: 'The straw undergoes various treatments depending on the intended end product, such as mechanical processing, chemical treatment, or biological processing.',
            image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Product Development',
            description: 'The processed straw is transformed into various value-added products.',
            image: 'https://images.unsplash.com/photo-1627634777217-c864268db30f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ],
        valueAddedProducts: [
          {
            product: 'Biofuel',
            description: 'Rice straw can be converted into bioethanol through enzymatic hydrolysis and fermentation, or into biogas through anaerobic digestion.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          },
          {
            product: 'Mushroom Cultivation',
            description: 'Rice straw serves as an excellent substrate for growing various edible mushrooms like oyster and straw mushrooms.',
            marketValue: 'Medium',
            sustainability: 'High'
          },
          {
            product: 'Paper and Packaging',
            description: 'The high cellulose content makes rice straw suitable for producing eco-friendly paper and packaging materials.',
            marketValue: 'Medium',
            sustainability: 'High'
          },
          {
            product: 'Animal Bedding',
            description: 'Processed rice straw can be used as bedding material for livestock, providing comfort and absorbing waste.',
            marketValue: 'Low to Medium',
            sustainability: 'Medium'
          },
          {
            product: 'Construction Materials',
            description: 'Rice straw can be compressed into boards or panels for construction, or used in making eco-friendly bricks.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          }
        ],
        environmentalBenefits: [
          'Reduces air pollution by preventing straw burning',
          'Decreases greenhouse gas emissions',
          'Conserves natural resources by providing alternatives to wood and plastic',
          'Improves soil health when used as compost or mulch',
          'Creates a circular economy in agricultural production'
        ],
        economicPotential: 'The global market for rice straw-based products is growing, with particular interest in biofuels, construction materials, and packaging. Value-added processing can increase farmer income by 15-30% compared to traditional disposal methods.',
        implementationChallenges: [
          'High initial investment for processing equipment',
          'Logistical challenges in collection and transportation',
          'Technical knowledge required for processing',
          'Market development for new products',
          'Quality standardization'
        ],
        successStories: [
          'In Vietnam, a company called Mekong Straw has successfully converted rice straw into biodegradable food packaging, replacing plastic containers.',
          'Indian farmers in Punjab have formed cooperatives to collect rice straw for mushroom cultivation, increasing their income while reducing air pollution.',
          'A Japanese firm has developed technology to convert rice straw into bioethanol at commercial scale, producing over 1 million liters annually.'
        ]
      },
      'coconut shells': {
        name: 'Coconut Shells',
        type: 'Agricultural Waste',
        description: 'Coconut shells are the hard, woody endocarp that protects the coconut kernel. They are a significant byproduct of the coconut industry.',
        composition: ['Lignin (29-35%)', 'Cellulose (26-33%)', 'Hemicellulose (15-28%)', 'Ash (0.6-1%)'],
        traditionalDisposal: 'Traditionally, coconut shells are often discarded as waste or burned for fuel in rural areas.',
        marketPrices: {
          raw: {
            price: '₹3,000-5,000 per ton',
            notes: 'Clean, dry shells command higher prices'
          },
          processed: {
            price: '₹8,000-12,000 per ton',
            notes: 'Crushed or ground shells for charcoal production'
          },
          valueAdded: {
            price: '₹50,000-80,000 per ton',
            notes: 'Activated carbon from coconut shells (highest value application)'
          },
          handicrafts: {
            price: '₹200-1,500 per piece',
            notes: 'Polished and crafted items like bowls, decorative pieces, and jewelry'
          }
        },
        valueChain: [
          {
            stage: 'Collection & Cleaning',
            description: 'Shells are collected from coconut processing facilities, cleaned, and sorted.',
            image: 'https://images.unsplash.com/photo-1551984427-6d77a8c80e5d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Processing',
            description: 'Shells are processed through methods like crushing, grinding, carbonization, or activation depending on the end product.',
            image: 'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Product Manufacturing',
            description: 'The processed shell material is transformed into various value-added products.',
            image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ],
        valueAddedProducts: [
          {
            product: 'Activated Carbon',
            description: 'Coconut shell-derived activated carbon is highly valued for water filtration, air purification, and industrial applications due to its high adsorption capacity.',
            marketValue: 'High',
            sustainability: 'High'
          },
          {
            product: 'Handicrafts & Decorative Items',
            description: 'Polished coconut shells are used to create bowls, cups, decorative items, musical instruments, and jewelry.',
            marketValue: 'Medium',
            sustainability: 'High'
          },
          {
            product: 'Charcoal & Briquettes',
            description: 'Coconut shell charcoal burns longer, hotter, and cleaner than wood charcoal, making it ideal for cooking, BBQ, and industrial heating.',
            marketValue: 'Medium to High',
            sustainability: 'Medium'
          },
          {
            product: 'Garden Mulch & Potting Media',
            description: 'Ground coconut shells provide excellent drainage and aeration for plants while suppressing weeds.',
            marketValue: 'Low to Medium',
            sustainability: 'High'
          },
          {
            product: 'Composite Materials',
            description: 'Coconut shell fibers and particles can be incorporated into plastics, resins, or cement to create durable composite materials for construction and manufacturing.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          }
        ],
        environmentalBenefits: [
          'Reduces waste sent to landfills',
          'Provides sustainable alternatives to plastic and synthetic materials',
          'Activated carbon from coconut shells helps in water and air purification',
          'Reduces deforestation by providing alternatives to wood products',
          'Carbon sequestration when used in long-lasting products'
        ],
        economicPotential: 'The global market for coconut shell products is valued at over $500 million, with activated carbon representing the highest value segment. The market is growing at approximately 7-8% annually.',
        implementationChallenges: [
          'Quality control in collection and processing',
          'Energy requirements for processing, especially for activated carbon',
          'Competition from synthetic alternatives',
          'Supply chain management from rural areas',
          'Technical expertise for advanced processing'
        ],
        successStories: [
          'A Philippine company has built a successful export business selling coconut shell-based activated carbon to water treatment facilities in North America and Europe.',
          'In Sri Lanka, a community cooperative employs over 200 people creating high-end coconut shell crafts for export markets.',
          'An Indonesian startup has developed biodegradable food packaging from coconut shells, securing contracts with several restaurant chains as an alternative to plastic containers.'
        ]
      },
      'sugarcane bagasse': {
        name: 'Sugarcane Bagasse',
        type: 'Agricultural Waste',
        description: 'Sugarcane bagasse is the fibrous residue that remains after sugarcane stalks are crushed to extract their juice. It is one of the most abundant agricultural residues in sugar-producing countries.',
        composition: ['Cellulose (40-45%)', 'Hemicellulose (25-35%)', 'Lignin (18-24%)', 'Ash (1-4%)', 'Wax and other compounds (2-3%)'],
        traditionalDisposal: 'Traditionally, bagasse is burned in sugar mills to generate steam and electricity, though often inefficiently. Excess bagasse may be discarded or left to decompose.',
        marketPrices: {
          raw: {
            price: '₹1,200-2,000 per ton',
            notes: 'Fresh bagasse with moderate moisture content'
          },
          processed: {
            price: '₹3,500-6,000 per ton',
            notes: 'Dried and baled bagasse for paper production or animal feed'
          },
          valueAdded: {
            price: '₹12,000-20,000 per ton',
            notes: 'Processed into fiberboard, particleboard, or packaging materials'
          },
          energy: {
            price: '₹2.5-4.0 per kWh',
            notes: 'Electricity generated from high-efficiency bagasse cogeneration'
          }
        },
        valueChain: [
          {
            stage: 'Collection & Preparation',
            description: 'Bagasse is collected directly from sugar mills, dried to reduce moisture content, and sometimes mechanically processed to improve handling.',
            image: 'https://images.unsplash.com/photo-1597528662465-55ece5734101?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Processing',
            description: 'The bagasse undergoes various treatments depending on the intended product, including mechanical refining, chemical treatment, or biological processing.',
            image: 'https://images.unsplash.com/photo-1565373987291-4d7424dd9e59?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Product Manufacturing',
            description: 'The processed bagasse is transformed into various value-added products through specialized manufacturing processes.',
            image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ],
        valueAddedProducts: [
          {
            product: 'Paper & Packaging',
            description: 'Bagasse pulp is used to produce various paper products including writing paper, tissue, cardboard, and biodegradable food containers.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          },
          {
            product: 'Bioethanol',
            description: 'Through enzymatic hydrolysis and fermentation, bagasse can be converted into second-generation bioethanol, a renewable fuel.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          },
          {
            product: 'Fiberboard & Particleboard',
            description: 'Compressed bagasse fibers can replace wood in medium-density fiberboard (MDF) and particleboard for furniture and construction.',
            marketValue: 'Medium',
            sustainability: 'High'
          },
          {
            product: 'Bioelectricity',
            description: 'Modern high-efficiency boilers and turbines can convert bagasse into electricity with much greater efficiency than traditional methods.',
            marketValue: 'Medium',
            sustainability: 'Medium to High'
          },
          {
            product: 'Bioplastics',
            description: 'The cellulose from bagasse can be extracted and processed to create biodegradable plastics for various applications.',
            marketValue: 'High',
            sustainability: 'Very High'
          },
          {
            product: 'Animal Feed',
            description: 'Treated bagasse can be used as roughage in animal feed, particularly for ruminants like cattle.',
            marketValue: 'Low to Medium',
            sustainability: 'Medium'
          }
        ],
        environmentalBenefits: [
          'Reduces waste and pollution from sugar production',
          'Decreases pressure on forests by providing alternatives to wood pulp',
          'Lowers greenhouse gas emissions when used for bioenergy',
          'Provides biodegradable alternatives to plastic products',
          'Creates a circular economy in sugar production'
        ],
        economicPotential: 'The global market for bagasse-based products is growing rapidly, particularly in packaging (15% annual growth) and bioenergy. A sugar mill processing 1 million tons of sugarcane can generate additional revenue of $5-10 million annually through optimized bagasse utilization.',
        implementationChallenges: [
          'Seasonal availability of bagasse',
          'High initial investment for processing facilities',
          'Technical expertise required for advanced processing',
          'Competition with established wood and plastic products',
          'Logistics of collection and storage'
        ],
        successStories: [
          'A Brazilian company has successfully scaled up production of bagasse-based packaging, supplying major fast-food chains as an alternative to styrofoam.',
          'In India, a sugar cooperative has installed advanced cogeneration facilities, selling excess electricity to the grid and increasing profits by 25%.',
          'A Thai manufacturer has developed premium bagasse-based paper products that are exported to over 30 countries, commanding price premiums of 20-30% over conventional paper.'
        ]
      },
      'banana peels': {
        name: 'Banana Peels',
        type: 'Food Waste',
        description: 'Banana peels constitute about 30-40% of the total weight of the fruit and are a significant waste stream from both household consumption and industrial banana processing.',
        composition: ['Moisture (80-90%)', 'Carbohydrates (6-8%)', 'Protein (0.9-1.2%)', 'Fat (0.2-0.5%)', 'Fiber (1.7-3.7%)', 'Various minerals and bioactive compounds'],
        traditionalDisposal: 'Typically discarded as waste in landfills or sometimes composted in household or municipal composting systems.',
        marketPrices: {
          raw: {
            price: '₹500-1,000 per ton',
            notes: 'Price varies based on moisture content and cleanliness'
          },
          processed: {
            price: '₹2,000-5,000 per ton',
            notes: 'Dried and ground for animal feed or fertilizer production'
          },
          valueAdded: {
            price: '₹15,000-25,000 per ton',
            notes: 'Extracted bioactive compounds for cosmetics or nutraceuticals'
          }
        },
        valueChain: [
          {
            stage: 'Collection & Sorting',
            description: 'Peels are collected from food processing facilities or through separate waste collection systems, then sorted and cleaned.',
            image: 'https://images.unsplash.com/photo-1571771826307-81e519b9a649?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Processing',
            description: 'Depending on the end product, peels may be dried, ground, extracted, fermented, or chemically treated.',
            image: 'https://images.unsplash.com/photo-1543363136-3fdb62e11be9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Product Development',
            description: 'The processed peel material is transformed into various value-added products.',
            image: 'https://images.unsplash.com/photo-1594761051656-9e5d6c080f7f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ],
        valueAddedProducts: [
          {
            product: 'Bioactive Extracts',
            description: 'Banana peels contain antioxidants, phenolic compounds, and other bioactive substances that can be extracted for use in nutraceuticals and cosmetics.',
            marketValue: 'High',
            sustainability: 'High'
          },
          {
            product: 'Organic Fertilizer',
            description: 'Rich in potassium and phosphorus, banana peel compost or extract makes an excellent fertilizer for plants.',
            marketValue: 'Low to Medium',
            sustainability: 'Very High'
          },
          {
            product: 'Animal Feed Supplement',
            description: 'Dried and processed banana peels can be incorporated into animal feed, providing nutrients and fiber.',
            marketValue: 'Low to Medium',
            sustainability: 'High'
          },
          {
            product: 'Bioethanol',
            description: 'Through fermentation, the carbohydrates in banana peels can be converted to bioethanol.',
            marketValue: 'Medium',
            sustainability: 'Medium to High'
          },
          {
            product: 'Water Purification',
            description: 'Banana peel powder has been shown to adsorb heavy metals and other contaminants from water.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          },
          {
            product: 'Natural Fabric Dye',
            description: 'Banana peels can produce a range of natural dyes from tan to dark brown for textiles.',
            marketValue: 'Low to Medium',
            sustainability: 'High'
          }
        ],
        environmentalBenefits: [
          'Reduces organic waste sent to landfills',
          'Decreases methane emissions from decomposing waste',
          'Provides natural alternatives to synthetic chemicals',
          'Creates closed-loop systems in banana production',
          'Reduces the need for chemical fertilizers when used as compost'
        ],
        economicPotential: 'While individual banana peels have low value, the scale of banana consumption globally (over 100 million tons annually) creates significant opportunity. The highest value applications are in bioactive extracts for cosmetics and nutraceuticals, with potential returns of $10-15 per kg of processed material.',
        implementationChallenges: [
          'High moisture content requiring energy for drying',
          'Rapid degradation necessitating quick processing',
          'Collection logistics, especially from dispersed sources',
          'Consistent quality control',
          'Consumer education for household-level valorization'
        ],
        successStories: [
          'A Colombian startup has developed a line of organic cosmetics using banana peel extracts, creating jobs in rural banana-growing regions.',
          'In Uganda, a community enterprise produces organic fertilizer from banana waste, increasing local farm yields by 20-30%.',
          'A Japanese company has patented a process to extract antioxidants from banana peels for use in premium anti-aging skincare products, selling at significant price premiums.'
        ]
      },
      'corn cobs': {
        name: 'Corn Cobs',
        type: 'Agricultural Waste',
        description: 'Corn cobs are the central core of maize ears after the kernels have been removed. They are a significant agricultural waste product in corn-producing regions.',
        composition: ['Cellulose (45-50%)', 'Hemicellulose (25-35%)', 'Lignin (15-20%)', 'Ash (1-2%)', 'Extractives (2-5%)'],
        traditionalDisposal: 'Traditionally, corn cobs are often left in fields, burned, or used as low-value animal bedding.',
        marketPrices: {
          raw: {
            price: '₹800-1,500 per ton',
            notes: 'Clean, dry corn cobs for industrial use'
          },
          processed: {
            price: '₹3,000-6,000 per ton',
            notes: 'Ground or pelletized corn cobs for animal bedding or mushroom substrate'
          },
          valueAdded: {
            price: '₹15,000-25,000 per ton',
            notes: 'Processed into abrasives, furfural, or xylitol production'
          },
          specialty: {
            price: '₹40,000-60,000 per ton',
            notes: 'Corn cob grit for specialized industrial cleaning applications'
          }
        },
        valueChain: [
          {
            stage: 'Collection & Preprocessing',
            description: 'Corn cobs are collected after grain harvesting, dried, and sometimes crushed or ground to facilitate handling and processing.',
            image: 'https://images.unsplash.com/photo-1598886221321-83780d1fa657?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Processing',
            description: 'The cobs undergo various treatments depending on the intended end product, such as grinding, chemical extraction, or thermal processing.',
            image: 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Product Development',
            description: 'The processed corn cob material is transformed into various value-added products.',
            image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ],
        valueAddedProducts: [
          {
            product: 'Industrial Abrasives',
            description: 'Ground corn cobs are used as a gentle abrasive for cleaning, polishing, and deburring in industries ranging from jewelry to automotive.',
            marketValue: 'High',
            sustainability: 'High'
          },
          {
            product: 'Animal Bedding',
            description: 'Processed corn cobs provide excellent absorbent bedding material for livestock and pets, with superior moisture absorption and odor control.',
            marketValue: 'Medium',
            sustainability: 'High'
          },
          {
            product: 'Furfural Production',
            description: 'Corn cobs are a rich source of pentosans, which can be converted to furfural, a valuable chemical intermediate used in various industrial applications.',
            marketValue: 'High',
            sustainability: 'Medium to High'
          },
          {
            product: 'Mushroom Cultivation',
            description: 'Corn cobs serve as an excellent substrate for growing various edible and medicinal mushrooms.',
            marketValue: 'Medium',
            sustainability: 'Very High'
          },
          {
            product: 'Biofuel',
            description: 'Through enzymatic hydrolysis and fermentation, corn cobs can be converted into bioethanol or other biofuels.',
            marketValue: 'Medium',
            sustainability: 'Medium to High'
          },
          {
            product: 'Xylitol Production',
            description: 'The xylose in corn cobs can be extracted and converted to xylitol, a valuable sugar substitute used in food products.',
            marketValue: 'Very High',
            sustainability: 'High'
          }
        ],
        environmentalBenefits: [
          'Reduces agricultural waste and field burning',
          'Decreases greenhouse gas emissions',
          'Provides sustainable alternatives to petroleum-based products',
          'Creates closed-loop systems in corn production',
          'Reduces pressure on forest resources'
        ],
        economicPotential: 'The global market for corn cob-derived products is growing at 5-7% annually, with particularly strong growth in abrasives and xylitol production. A corn farm producing 1,000 tons of corn cobs annually can generate additional revenue of ₹8-15 lakhs through basic processing, or ₹25-40 lakhs through higher-value applications.',
        implementationChallenges: [
          'Collection logistics and transportation costs',
          'Initial investment in processing equipment',
          'Technical expertise required for advanced processing',
          'Market development for new products',
          'Seasonal availability requiring storage solutions'
        ],
        successStories: [
          'A cooperative in Maharashtra has established a corn cob processing facility that supplies abrasive material to jewelry manufacturers, increasing farmer incomes by 15-20%.',
          'An agricultural startup in Karnataka has developed a mobile processing unit that converts corn cobs into animal bedding, serving poultry farms across the region.',
          'A biotech company in Gujarat has successfully scaled up xylitol production from corn cobs, creating a premium product that sells at 3-4 times the price of conventional sweeteners.'
        ]
      },
      'almond hulls': {
        name: 'Almond Hulls',
        type: 'Agricultural Waste',
        description: 'Almond hulls are the fleshy outer covering of the almond fruit that surrounds the shell. They are a major byproduct of almond processing, with approximately 1.8-2.0 kg of hulls produced for every 1 kg of almond kernels.',
        composition: ['Carbohydrates (55-65%)', 'Crude Fiber (12-15%)', 'Protein (5-7%)', 'Fat (2-3%)', 'Ash (7-9%)', 'Moisture (10-20%)'],
        traditionalDisposal: 'Traditionally, almond hulls are used as low-value cattle feed or simply discarded as waste.',
        marketPrices: {
          raw: {
            price: '₹2,000-3,500 per ton',
            notes: 'Fresh almond hulls for livestock feed'
          },
          processed: {
            price: '₹5,000-8,000 per ton',
            notes: 'Dried and processed hulls for premium animal feed'
          },
          valueAdded: {
            price: '₹20,000-35,000 per ton',
            notes: 'Extracted bioactive compounds for nutraceuticals or cosmetics'
          },
          energy: {
            price: '₹3,000-5,000 per ton',
            notes: 'Processed into biofuel pellets or briquettes'
          }
        },
        valueChain: [
          {
            stage: 'Collection & Preprocessing',
            description: 'Almond hulls are collected during almond processing, dried to reduce moisture content, and sometimes ground or pelletized.',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Processing',
            description: 'The hulls undergo various treatments depending on the intended end product, such as extraction, fermentation, or thermal processing.',
            image: 'https://images.unsplash.com/photo-1584559582128-b8be739912e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          },
          {
            stage: 'Product Development',
            description: 'The processed hull material is transformed into various value-added products.',
            image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          }
        ],
        valueAddedProducts: [
          {
            product: 'Premium Animal Feed',
            description: 'Processed almond hulls provide nutritious feed for dairy cattle and other livestock, with good digestibility and energy content.',
            marketValue: 'Medium',
            sustainability: 'High'
          },
          {
            product: 'Bioactive Extracts',
            description: 'Almond hulls contain valuable phenolic compounds and antioxidants that can be extracted for use in nutraceuticals and cosmetics.',
            marketValue: 'Very High',
            sustainability: 'High'
          },
          {
            product: 'Bioenergy',
            description: 'Through gasification or direct combustion, almond hulls can be converted into heat, electricity, or biofuels.',
            marketValue: 'Medium',
            sustainability: 'Medium to High'
          },
          {
            product: 'Organic Fertilizer',
            description: 'Composted almond hulls make excellent soil amendments, improving soil structure and providing nutrients.',
            marketValue: 'Medium',
            sustainability: 'Very High'
          },
          {
            product: 'Mushroom Substrate',
            description: 'Almond hulls can be used as a growing medium for various edible and medicinal mushrooms.',
            marketValue: 'Medium to High',
            sustainability: 'High'
          },
          {
            product: 'Biochar',
            description: 'Pyrolyzed almond hulls produce biochar that can improve soil quality and sequester carbon.',
            marketValue: 'Medium to High',
            sustainability: 'Very High'
          }
        ],
        environmentalBenefits: [
          'Reduces agricultural waste sent to landfills',
          'Decreases greenhouse gas emissions from decomposing waste',
          'Provides sustainable alternatives to synthetic products',
          'Creates closed-loop systems in almond production',
          'Reduces water pollution from improper disposal'
        ],
        economicPotential: 'The global market for almond hull-derived products is growing as sustainability concerns increase. An almond processing facility handling 10,000 tons of almonds annually can generate additional revenue of ₹40-70 lakhs from hull valorization, with the highest returns coming from bioactive compound extraction for nutraceuticals.',
        implementationChallenges: [
          'Seasonal availability requiring storage solutions',
          'Variability in hull quality and composition',
          'Initial investment in processing equipment',
          'Technical expertise for advanced processing',
          'Regulatory compliance for food and feed applications'
        ],
        successStories: [
          'A cooperative in California has developed a premium dairy feed from almond hulls that commands a 30% price premium over conventional feeds due to its nutritional profile.',
          'A biotech startup has successfully commercialized an antioxidant extract from almond hulls for use in anti-aging skincare products, creating a high-value revenue stream.',
          'An agricultural processor has implemented a closed-loop system where almond hulls are converted to biochar and returned to almond orchards, improving soil health and reducing fertilizer costs by 20%.'
        ]
      }
    };

    // Check if we have a predefined analysis for this item
    for (const key in analyses) {
      if (lowerCaseItem.includes(key)) {
        return analyses[key];
      }
    }
    
    // If no predefined analysis, generate a generic one
    return generateGenericAnalysis(itemName);
  };

  // Generate a generic analysis for items not in our predefined list
  const generateGenericAnalysis = (itemName) => {
    // Determine if it's likely a product or waste based on the name
    const isWaste = itemName.toLowerCase().includes('waste') || 
                   itemName.toLowerCase().includes('residue') ||
                   itemName.toLowerCase().includes('byproduct');
    
    return {
      name: itemName,
      type: isWaste ? 'Agricultural Waste' : 'Agricultural Product',
      description: `${itemName} is an important ${isWaste ? 'byproduct' : 'resource'} in agricultural systems that can be utilized more effectively through proper management and processing.`,
      valueChain: [
        {
          stage: 'Collection & Preprocessing',
          description: `${itemName} must be properly collected and prepared for further processing.`,
          image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          stage: 'Processing',
          description: `Various processing methods can be applied to transform ${itemName} into valuable materials.`,
          image: 'https://images.unsplash.com/photo-1581093458791-9d2b11a0c07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          stage: 'Product Development',
          description: `The processed materials from ${itemName} can be used to create various value-added products.`,
          image: 'https://images.unsplash.com/photo-1574144113084-b6f450cc5e0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ],
      valueAddedProducts: [
        {
          product: 'Organic Fertilizer',
          description: `${itemName} can be composted or processed to create nutrient-rich fertilizer for agricultural use.`,
          marketValue: 'Medium',
          sustainability: 'High'
        },
        {
          product: 'Bioenergy',
          description: `Through appropriate processing, ${itemName} can be converted into biogas, bioethanol, or solid biofuel.`,
          marketValue: 'Medium to High',
          sustainability: 'Medium to High'
        },
        {
          product: 'Animal Feed',
          description: `Properly treated ${itemName} may serve as a component in animal feed formulations.`,
          marketValue: 'Low to Medium',
          sustainability: 'Medium'
        }
      ],
      environmentalBenefits: [
        'Reduces waste sent to landfills',
        'Decreases greenhouse gas emissions',
        'Promotes circular economy principles',
        'Conserves natural resources',
        'Reduces pollution from improper disposal'
      ],
      economicPotential: `Proper utilization of ${itemName} can create new revenue streams while reducing waste management costs. The specific economic value depends on local markets and processing capabilities.`,
      implementationChallenges: [
        'Collection and transportation logistics',
        'Processing technology requirements',
        'Market development for new products',
        'Regulatory compliance',
        'Initial investment costs'
      ]
    };
  };

  return (
    <div className="product-waste-analyzer">
      <h2>AI Product & Waste Analyzer</h2>
      <p>Enter the name of any agricultural product or waste item to get detailed information about its composition, processing methods, and potential value-added products.</p>
      <div className="analyzer-info">
        <i className="bi bi-info-circle"></i>
        <span>Try searching for items like "Rice Straw", "Coconut Shells", "Sugarcane Bagasse", or "Banana Peels"</span>
      </div>
      
      <form onSubmit={handleSubmit} className="analyzer-form">
        <div className="input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter product or waste name (e.g., Rice Straw, Coconut Shells)"
            className="analyzer-input"
          />
          <button type="submit" className="analyze-btn">
            <i className="bi bi-search"></i> Analyze
          </button>
        </div>
        
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>
      
      {isAnalyzing && (
        <div className="analyzing-indicator">
          <div className="analyzer-spinner"></div>
          <p>Analyzing {query}...</p>
        </div>
      )}
      
      {error && <div className="analyzer-error">{error}</div>}
      
      {result && (
        <div className="analysis-result">
          <div className="result-header">
            <h3>{result.name}</h3>
            <span className="result-type">{result.type}</span>
          </div>
          
          <div className="result-description">
            <p>{result.description}</p>
          </div>
          
          {result.composition && (
            <div className="result-section">
              <h4>Composition</h4>
              <div className="composition-chart">
                {result.composition.map((component, index) => {
                  const percentage = parseInt(component.match(/\d+/)) || 10;
                  const name = component.replace(/\(\d+.*?\)/, '').trim();
                  return (
                    <div key={index} className="composition-item">
                      <div className="composition-bar-container">
                        <div 
                          className="composition-bar" 
                          style={{width: `${Math.min(percentage * 2, 100)}%`}}
                        ></div>
                      </div>
                      <div className="composition-label">
                        <span>{name}</span>
                        <span className="composition-percentage">{component.match(/\(.*?\)/) || ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {result.traditionalDisposal && (
            <div className="result-section">
              <h4>Traditional Disposal</h4>
              <p>{result.traditionalDisposal}</p>
            </div>
          )}
          
          <div className="result-section">
            <h4>Value Chain</h4>
            <div className="value-chain">
              {result.valueChain.map((stage, index) => (
                <div key={index} className="value-chain-stage">
                  <div className="stage-image">
                    <img src={stage.image} alt={stage.stage} />
                  </div>
                  <div className="stage-content">
                    <h5>{stage.stage}</h5>
                    <p>{stage.description}</p>
                  </div>
                  {index < result.valueChain.length - 1 && (
                    <div className="stage-arrow">
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="result-section">
            <h4>Value-Added Products</h4>
            <div className="products-grid">
              {result.valueAddedProducts.map((product, index) => (
                <div key={index} className="product-card">
                  <div className="product-header">
                    <h5>{product.product}</h5>
                    <div className="market-demand">
                      <span className="demand-label">Market Demand</span>
                      <div className="demand-dots">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const valueMap = { 'Low': 1, 'Medium': 2, 'Medium to High': 3, 'High': 4, 'Very High': 5 };
                          const value = valueMap[product.marketValue] || 0;
                          return (
                            <span
                              key={i}
                              className={`demand-dot ${i < value ? 'active' : ''}`}
                            ></span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p>{product.description}</p>
                  <div className="product-metrics">
                    <div className="metric">
                      <span className="metric-label">Market Value:</span>
                      <span className={`metric-value value-${product.marketValue.toLowerCase().replace(/\s+/g, '-')}`}>
                        {product.marketValue}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Sustainability:</span>
                      <span className={`metric-value sustainability-${product.sustainability.toLowerCase().replace(/\s+/g, '-')}`}>
                        {product.sustainability}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="result-section">
            <h4>Environmental Benefits</h4>
            <ul className="benefits-list">
              {result.environmentalBenefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
          
          {result.marketPrices && (
            <div className="result-section">
              <h4>Market Prices</h4>
              <div className="market-prices">
                {result.marketPrices.raw && (
                  <div className="price-card">
                    <div className="price-header">
                      <h5>Raw Material</h5>
                      <span className="price-tag">{result.marketPrices.raw.price}</span>
                    </div>
                    <p>{result.marketPrices.raw.notes}</p>
                  </div>
                )}

                {result.marketPrices.processed && (
                  <div className="price-card">
                    <div className="price-header">
                      <h5>Processed Material</h5>
                      <span className="price-tag">{result.marketPrices.processed.price}</span>
                    </div>
                    <p>{result.marketPrices.processed.notes}</p>
                  </div>
                )}

                {result.marketPrices.valueAdded && (
                  <div className="price-card">
                    <div className="price-header">
                      <h5>Value-Added Products</h5>
                      <span className="price-tag">{result.marketPrices.valueAdded.price}</span>
                    </div>
                    <p>{result.marketPrices.valueAdded.notes}</p>
                  </div>
                )}

                {result.marketPrices.energy && (
                  <div className="price-card">
                    <div className="price-header">
                      <h5>Energy Production</h5>
                      <span className="price-tag">{result.marketPrices.energy.price}</span>
                    </div>
                    <p>{result.marketPrices.energy.notes}</p>
                  </div>
                )}

                {result.marketPrices.handicrafts && (
                  <div className="price-card">
                    <div className="price-header">
                      <h5>Handicrafts</h5>
                      <span className="price-tag">{result.marketPrices.handicrafts.price}</span>
                    </div>
                    <p>{result.marketPrices.handicrafts.notes}</p>
                  </div>
                )}

                {result.marketPrices.specialty && (
                  <div className="price-card">
                    <div className="price-header">
                      <h5>Specialty Applications</h5>
                      <span className="price-tag">{result.marketPrices.specialty.price}</span>
                    </div>
                    <p>{result.marketPrices.specialty.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="result-section">
            <h4>Economic Potential</h4>
            <p>{result.economicPotential}</p>

            <div className="profit-potential">
              <h5>Most Profitable Applications</h5>
              <div className="profit-bars">
                {result.valueAddedProducts && result.valueAddedProducts
                  .sort((a, b) => {
                    const valueMap = { 'Low': 1, 'Medium': 2, 'Medium to High': 3, 'High': 4, 'Very High': 5 };
                    return valueMap[b.marketValue] - valueMap[a.marketValue];
                  })
                  .slice(0, 3)
                  .map((product, index) => (
                    <div key={index} className="profit-bar-item">
                      <div className="profit-bar-header">
                        <span className="profit-product">{product.product}</span>
                        <span className={`profit-value ${product.marketValue.toLowerCase().replace(/\s+/g, '-')}`}>
                          {product.marketValue}
                        </span>
                      </div>
                      <div className="profit-bar-container">
                        <div
                          className="profit-bar"
                          style={{
                            width: `${
                              product.marketValue === 'Very High' ? '100%' :
                              product.marketValue === 'High' ? '80%' :
                              product.marketValue === 'Medium to High' ? '60%' :
                              product.marketValue === 'Medium' ? '40%' : '20%'
                            }`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          
          <div className="result-section">
            <h4>Implementation Challenges</h4>
            <ul className="challenges-list">
              {result.implementationChallenges.map((challenge, index) => (
                <li key={index}>{challenge}</li>
              ))}
            </ul>
          </div>

          <div className="result-section market-connection">
            <h4>Market Connections</h4>
            <p>Connect with potential buyers and processors interested in {result.name.toLowerCase()} for various applications.</p>
            <div className="connection-buttons">
              <button className="connect-btn">
                <i className="bi bi-search"></i> Find Buyers
              </button>
              <button className="connect-btn">
                <i className="bi bi-building"></i> Connect with Processors
              </button>
              <button className="connect-btn">
                <i className="bi bi-people"></i> Join Cooperative
              </button>
            </div>
          </div>
          
          {result.successStories && (
            <div className="result-section">
              <h4>Success Stories</h4>
              <div className="success-stories">
                {result.successStories.map((story, index) => (
                  <div key={index} className="success-story">
                    <i className="bi bi-lightbulb"></i>
                    <p>{story}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductWasteAnalyzer;