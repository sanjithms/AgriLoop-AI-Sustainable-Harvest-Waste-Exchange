// This data is kept for reference but is no longer used in the application
// It has been replaced by the ChatbotAI component's responses
const awarenessData = [
    {
      category: "Crop Waste Management",
      title: "Biochar from Agricultural Waste",
      content: "Biochar is produced by burning agricultural waste in a controlled environment. It improves soil fertility and captures carbon.",
      imageUrl: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Crop Waste Management",
      title: "Compost from Groundnut Shells",
      content: "Groundnut shells can be converted into compost through microbial decomposition, enriching the soil with nutrients.",
      imageUrl: "https://images.unsplash.com/photo-1580412581600-9b22e636d6b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Horticultural Waste Management",
      title: "Alcoholic Beverage from Kinnow Peels",
      content: "Kinnow peels are fermented to produce alcoholic beverages, reducing waste and generating revenue.",
      imageUrl: "https://images.unsplash.com/photo-1596392301391-8a9b1c77f5b9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Horticultural Waste Management",
      title: "Animal Feed from Potato Waste",
      content: "Potato processing waste can be converted into animal feed, providing a cost-effective solution for livestock nutrition.",
      imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Animal Waste Management",
      title: "Organic Manure from Fish Waste",
      content: "Fish processing waste is converted into organic manure, enhancing soil fertility and reducing environmental pollution.",
      imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Agro-Industry Waste",
      title: "Handmade Paper from Jute Waste",
      content: "Jute waste can be recycled to create eco-friendly handmade paper products.",
      imageUrl: "https://images.unsplash.com/photo-1598620617148-c9e8ddee6711?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Fisheries Waste Management",
      title: "Chitin and Chitosan from Prawn Shells",
      content: "Prawn shells are processed to extract chitin and chitosan, which are used in pharmaceuticals and biodegradable plastics.",
      imageUrl: "https://images.unsplash.com/photo-1565280654386-466aaf482d66?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Food Waste Management",
      title: "Bioreactor for Composting Food Waste",
      content: "Food waste is decomposed in bioreactors to produce high-quality organic compost.",
      imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Agricultural Waste",
      title: "Briquettes from Paddy Straw",
      content: "Paddy straw is compressed into briquettes, which are used as an eco-friendly fuel source.",
      imageUrl: "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Horticultural Waste",
      title: "Essential Oil from Citrus Peels",
      content: "Citrus peels are used to extract essential oils for aromatherapy and cosmetic applications.",
      imageUrl: "https://images.unsplash.com/photo-1576089073624-b5f8bec2a276?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Animal Waste",
      title: "Biogas from Cow Dung",
      content: "Cow dung is fermented in biogas plants to produce methane gas for cooking and electricity generation.",
      imageUrl: "https://images.unsplash.com/photo-1620236104164-d2e71398f8b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Agricultural Waste",
      title: "Vermicomposting with Crop Residues",
      content: "Earthworms are used to break down crop residues and produce nutrient-rich vermicompost.",
      imageUrl: "https://images.unsplash.com/photo-1591634616938-1dfa7ee2e617?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Agro-Industry Waste",
      title: "Cashew Apple Powder Production",
      content: "Cashew apple waste is processed to make powder used in bakery and beverages.",
      imageUrl: "https://images.unsplash.com/photo-1583227061267-8428fb76fb2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Agricultural Waste",
      title: "Fertilizer from Sugarcane Bagasse",
      content: "Sugarcane bagasse is composted to produce organic fertilizer for crops.",
      imageUrl: "https://images.unsplash.com/photo-1591634616938-1dfa7ee2e617?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Horticultural Waste",
      title: "Natural Dye from Onion Peels",
      content: "Onion peels are processed to extract natural dye for textiles and fabrics.",
      imageUrl: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Animal Waste",
      title: "Protein from Fish Waste",
      content: "Fish waste is processed to extract protein for animal feed and pet food.",
      imageUrl: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Fisheries Waste Management",
      title: "Calcium Powder from Eggshell Waste",
      content: "Eggshells are crushed to produce calcium powder for poultry feed and dietary supplements.",
      imageUrl: "https://images.unsplash.com/photo-1551292831-023188e78222?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Food Processing Waste",
      title: "Tomato Paste from Damaged Tomatoes",
      content: "Damaged tomatoes are processed into tomato paste and ketchup.",
      imageUrl: "https://images.unsplash.com/photo-1594170524133-76db6b9c6440?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Agro-Industry Waste",
      title: "Natural Fiber from Banana Stems",
      content: "Banana stems are processed to extract fibers used in textiles and handicrafts.",
      imageUrl: "https://images.unsplash.com/photo-1566274360936-69fae8dc1d95?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Food Waste Management",
      title: "Bio-Ethanol from Spoiled Fruits",
      content: "Spoiled fruits are fermented to produce bio-ethanol used as a fuel alternative.",
      imageUrl: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Agro-Industry Waste",
      title: "Mushroom Cultivation from Paddy Straw",
      content: "Paddy straw is used as a substrate for growing mushrooms.",
      imageUrl: "https://images.unsplash.com/photo-1607877742574-a7253426f5af?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Animal Waste",
      title: "Gelatin from Animal Bones",
      content: "Animal bones are processed to extract gelatin used in food and pharmaceuticals.",
      imageUrl: "https://images.unsplash.com/photo-1562707666-0ef82e5c1e29?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Fisheries Waste Management",
      title: "Fish Oil from Fish Waste",
      content: "Fish waste is processed to extract omega-3-rich fish oil.",
      imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Agricultural Waste",
      title: "Paper Pulp from Sugarcane Bagasse",
      content: "Sugarcane bagasse is used to produce paper pulp for making eco-friendly paper.",
      imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
    {
      category: "Horticultural Waste",
      title: "Fruit Pectin from Citrus Waste",
      content: "Citrus waste is processed to extract pectin used in jams and jellies.",
      imageUrl: "https://images.unsplash.com/photo-1597714026720-8f74c62310ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "product"
    },
    {
      category: "Animal Waste",
      title: "Collagen from Animal Skin",
      content: "Animal skin is processed to extract collagen used in cosmetics and food supplements.",
      imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      type: "waste"
    },
  ];
  
  export default awarenessData;
  