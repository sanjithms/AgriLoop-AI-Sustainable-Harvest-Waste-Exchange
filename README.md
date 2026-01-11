# AgriLoop AI: Smart Agricultural Product & Waste Management System 🌾♻️

**AgriLoop AI** is a comprehensive full-stack web platform designed to bridge the gap between farmers, buyers, and waste recyclers. By integrating **Hugging Face AI**, the system creates a sustainable ecosystem that facilitates the sale of fresh produce, transforms agricultural waste into valuable resources, and provides intelligent farming advice.
This project integrates Hugging Face AI capabilities into a Smart Agriculture System to provide intelligent features like crop recommendations, disease diagnosis, and agricultural question answering.

## Features

- **AI Crop Recommendations**: Get personalized crop recommendations based on soil type, climate, and region
- **Crop Disease Analysis**: Diagnose plant diseases from symptom descriptions
- **Agricultural Question Answering**: Get answers to farming and agricultural questions
- **Market Sentiment Analysis**: Analyze agricultural market reports for sentiment
- **News Summarization**: Summarize agricultural news articles
- ---

## 📸 Output Screenshots

| **Home & Dashboard** | **Product Marketplace** |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/d29b1c5d-3a62-4cdd-8c2d-40068d828d94" width="100%" alt="Home & Dashboard" /> | <img src="https://github.com/user-attachments/assets/9e7eaf2f-768d-41c7-bd24-85e1602e069a" width="100%" alt="Product Marketplace" /> |
| *Central hub for products and tools* | *Fresh produce listings with filters* |

| **Waste Exchange** | **AI Analysis Tool** |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/8129397c-f9c2-4ff9-8d50-9e061a72766a" width="100%" alt="Waste Exchange" /> | <img src="https://github.com/user-attachments/assets/775d5391-c541-46cc-9bb6-008c05610527" width="100%" alt="AI Analysis Tool" /> |
| *Trading platform for agri-waste* | *Disease diagnosis and crop advice* |

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Hugging Face account and API token

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-agri-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file and add your Hugging Face API token
# Edit the .env file and replace "your_hugging_face_api_token_here" with your actual token

# Start the server
npm run dev
```

The backend server will start on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend development server will start on http://localhost:3000

## How to Use the AI Features

1. **Crop Recommendations**:
   - Navigate to the AI Dashboard
   - Fill in the soil type, climate, region, and previous crops
   - Click "Get Recommendations" to receive AI-generated crop suggestions

2. **Crop Disease Analysis**:
   - Navigate to the AI Dashboard
   - Describe the symptoms you observe in your crops
   - Specify the crop type (optional)
   - Click "Analyze Disease" to get a diagnosis and treatment recommendations

3. **Agricultural Question Answering**:
   - Navigate to the AI Dashboard
   - Enter your agricultural question
   - Click "Get Answer" to receive an AI-generated response

## How Hugging Face AI Works

The system uses various pre-trained models from Hugging Face:

1. **Text Generation** (gpt2-xl): Used for generating crop recommendations and treatment advice
2. **Question Answering** (deepset/roberta-base-squad2): Used for answering agricultural questions
3. **Text Classification** (facebook/bart-large-mnli): Used for disease classification
4. **Sentiment Analysis** (distilbert-base-uncased-finetuned-sst-2-english): Used for market sentiment analysis
5. **Summarization** (facebook/bart-large-cnn): Used for summarizing news articles

## Troubleshooting

- **Model Loading Time**: Some models may take time to load on first request. If you get a timeout error, try again after a few seconds.
- **API Token Issues**: Ensure your Hugging Face API token is correctly set in the .env file.
- **CORS Errors**: If you encounter CORS errors, ensure the backend CORS settings are correctly configured.

## License

[Add your license information here]# Smart Agricultural Product and Waste Management System

A comprehensive platform connecting farmers, buyers, and waste processors for sustainable agricultural practices.

## Features

- **Multi-role User System**: Support for Buyers, Farmers, Industry users, and Admins
- **Product Management**: List, browse, and purchase agricultural products
- **Waste Management**: List and find agricultural waste products for recycling and reuse
- **Order Management**: Complete order lifecycle from checkout to delivery
- **User Profiles**: Customized profiles based on user roles
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, Bootstrap, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Processing**: Stripe

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/smart-agri-system.git
   cd smart-agri-system
   ```

2. **Backend Setup**
   ```
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

3. **Frontend Setup**
   ```
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

### Running the Application

1. **Start the Backend Server**
   ```
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```
   cd frontend
   npm start
   ```

3. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## User Roles

1. **Buyer**
   - Browse and purchase agricultural products
   - View order history
   - Manage profile

2. **Farmer**
   - List agricultural products for sale
   - List agricultural waste products
   - Manage orders and inventory
   - Manage farm profile

3. **Industry**
   - Browse and purchase waste products
   - List processed products
   - Manage industry profile

4. **Admin**
   - Manage all users, products, and orders
   - View sales analytics
   - Manage platform settings

## Directory Structure

```
smart-agri-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── App.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Stripe](https://stripe.com/)
