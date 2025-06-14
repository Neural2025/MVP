# AI Test Automation System

A modern, full-stack application for AI-powered code analysis and test generation using DeepSeek AI. Built with React frontend and Express.js backend with MongoDB authentication.

## 🚀 Features

### Frontend (React + TypeScript + Tailwind CSS)
- **Modern UI**: Beautiful, responsive design with dark/light theme support and smooth animations
- **Role-based Authentication**: Secure signup with email validation and role selection (Developer/Tester/Product Manager)
- **Multi-input Code Analysis**: Support for manual code input, GitHub repository URLs, and file uploads (including ZIP)
- **Real-time Analysis**: Live code analysis with detailed results and corrections
- **Test Generation**: Automated test suite generation with fixes
- **Results Dashboard**: Comprehensive analysis results with categorized issues and actionable corrections
- **Analysis History**: Automatic saving and retrieval of analysis history for authenticated users
- **Responsive Design**: Fully responsive with smooth scroll animations and micro-interactions

### Backend (Express.js + MongoDB)
- **Multi-language Support**: JavaScript, Python, Java, C++, C#, PHP, Ruby, Go, and more
- **AI-Powered Analysis**: DeepSeek API integration for intelligent code analysis with corrections
- **Advanced Authentication**: JWT-based auth with email validation, role-based access, and bcrypt hashing
- **GitHub Integration**: Direct repository analysis from GitHub URLs
- **File Upload Support**: ZIP file processing and multi-file analysis
- **Analysis History**: User-specific history tracking with pagination
- **Rate Limiting**: User-specific rate limiting and request tracking
- **Security**: Helmet.js, CORS, input validation, and sanitization
- **Logging**: Comprehensive Winston logging system
- **Database**: MongoDB with Mongoose ODM and user analytics

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom animations
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **React Query** for state management
- **Sonner** for notifications

### Backend
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **AdmZip** for ZIP file processing
- **Axios** for GitHub API integration
- **Winston** for logging
- **Helmet** for security
- **CORS** for cross-origin requests
- **Express Rate Limit** for rate limiting

## 📦 Installation

### Prerequisites
- **Node.js 18+** 
- **MongoDB** (local or cloud)
- **DeepSeek API key**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/test-automation
   JWT_SECRET=your-super-secret-jwt-key
   DEEPSEEK_API_KEY=your-deepseek-api-key
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Usage

1. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

2. **Create an account**
   - Click "Sign up" and create your account
   - Select your role (Developer/Tester/Product Manager)
   - Email validation ensures real email addresses

3. **Analyze code using multiple methods**
   - **Manual Input**: Enter code directly in the editor
   - **GitHub Integration**: Paste GitHub repository URLs for automatic analysis
   - **File Upload**: Upload individual files or ZIP archives

4. **View comprehensive results**
   - Security vulnerabilities with specific fixes
   - Performance optimizations
   - Code improvements and corrections
   - Functionality assessment
   - Generated test suites with fixes

5. **Access your history**
   - All analyses are automatically saved
   - View past analyses and test generations
   - Copy results and corrections easily

## 🎨 New Features

### Enhanced Authentication
- Real-time email validation
- Role-based user registration
- Professional email verification

### Multi-Source Code Analysis
- **GitHub Integration**: Analyze entire repositories or specific files
- **File Upload**: Support for ZIP files and multiple file formats
- **Smart Detection**: Automatic language detection and framework suggestions

### Advanced Results
- **Corrections Tab**: Specific, actionable code improvements
- **Source Information**: Track analysis source (manual/GitHub/upload)
- **Copy Functionality**: Easy copying of results and corrections

### Smooth Animations
- Slide-in animations for components
- Hover effects and micro-interactions
- Responsive scaling and transitions
- Staggered animations for lists

### History Management
- Automatic saving of all analyses
- Paginated history viewing
- User-specific analytics tracking

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account with role and email validation
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user

### Code Analysis
- `POST /api/analyze` - Analyze code (supports files, GitHub URLs, manual input)
- `POST /api/generate-tests` - Generate test suites (supports files, GitHub URLs, manual input)

### History
- `GET /api/history/analysis` - Get analysis history
- `GET /api/history/tests` - Get test generation history

## 🔒 Security Features

- **JWT Authentication** with role-based access
- **Email Validation** with domain verification
- **Password Hashing** with bcrypt salt rounds
- **Input Validation** and sanitization
- **File Upload Security** with type validation
- **Rate Limiting** per user and IP
- **CORS Protection** with configurable origins

## 🎨 UI/UX Features

- **Dark/Light Theme** with system preference detection
- **Responsive Design** for all screen sizes
- **Smooth Animations** and micro-interactions
- **Loading States** with skeleton screens
- **Error Handling** with user-friendly messages
- **Toast Notifications** for real-time feedback
- **Progressive Enhancement** for better accessibility

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 for process management
3. Configure reverse proxy (nginx)
4. Set up MongoDB Atlas for cloud database

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Configure environment variables

## 📄 License

MIT License

## 🆘 Support

For support, please open an issue on GitHub.

---

**Built with ❤️ using modern web technologies and AI-powered analysis**
