# Pak-Exporters B2B Marketplace

Pakistan's First Export Marketplace - Connecting exporters with global buyers since 2019.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or higher
- **npm** 9.0 or higher (or **yarn** / **pnpm**)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pak-exporters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   # Add other environment variables as needed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3001](http://localhost:3001)

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[API Documentation](docs/API.md)** - API endpoints and data types
- **[Component Documentation](docs/COMPONENTS.md)** - Reusable components guide
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture overview
- **[Contributing](docs/CONTRIBUTING.md)** - Contribution guidelines
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Deployment Options](docs/DEPLOYMENT_OPTIONS.md)** - Deployment platform comparison

## 📁 Project Structure

```
pak-exporters/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (public)/          # Public pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components (Header, Footer)
│   ├── cards/             # Card components
│   ├── forms/             # Form components
│   ├── filters/           # Filter components
│   └── placeholders/      # AI placeholder components
├── lib/                    # Utility functions
│   ├── constants.ts       # App constants
│   ├── utils.ts           # Utility functions
│   ├── seo.ts             # SEO helpers
│   └── validations/       # Zod schemas
├── services/              # API services
│   ├── api/               # API service layer
│   └── mocks/             # Mock data
├── types/                 # TypeScript type definitions
├── store/                 # Zustand stores
└── public/                # Static assets
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server (port 3001)
- `npm run dev:port` - Start dev server on custom port

### Production
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run start:port` - Start production server on custom port

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm test` - Run tests in watch mode
- `npm test -- --run` - Run tests once
- `npm test -- --coverage` - Run tests with coverage
- `npm test -- --ui` - Run tests with Vitest UI

### Server Management (Windows PowerShell)
- `npm run server:start` - Start frontend and backend servers
- `npm run server:stop` - Stop all servers
- `npm run server:restart` - Restart all servers
- `npm run server:status` - Check server status

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **TypeScript**: Strict mode enabled
- **Styling**: TailwindCSS v4 with shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React

## 🔑 Key Features

### For Suppliers
- **Product Management**: Upload, edit, and manage product listings
- **Company Profiles**: Create and manage company profiles
- **Membership Tiers**: Starter, Silver, Gold, and Platinum tiers
- **SEO Automation**: Automatic SEO optimization for Platinum/Gold members
- **RFQ Management**: View and respond to buyer requests
- **Dashboard**: Track products, views, inquiries, and RFQs

### For Buyers
- **Product Discovery**: Browse products by category, search, and filters
- **Supplier Search**: Find verified suppliers by location, tier, and category
- **RFQ Submission**: Submit requests for quotations
- **Company Profiles**: View detailed supplier information
- **Dashboard**: Manage RFQs, orders, and supplier connections

### Platform Features
- **AI Placeholders**: AI Product Description Generator, AI Search Assistant, AI Trust Score
- **Advanced Search**: Filter by category, price, membership tier, location
- **Responsive Design**: Mobile-first, works on all devices
- **SEO Optimized**: Meta tags, structured data (JSON-LD), sitemaps
- **Geo-Targeting**: Pakistan-focused SEO and geo tags

## 📝 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3001

# API (when backend is implemented)
NEXT_PUBLIC_API_URL=http://localhost:8001

# Authentication (when implemented)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001
```

## 🧪 Testing

The project uses Vitest for unit testing and React Testing Library for component testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests once
npm test -- --run

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- Header.test.tsx
```

### Test Coverage

Current test coverage includes:
- ✅ Form validation tests
- ✅ API service tests
- ✅ Component tests (ProductCard, CategoryCard, ProductForm, etc.)
- ✅ Utility function tests
- ✅ SEO automation tests

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
# Build the project
npm run build

# Start production server
npm run start
```

## 📚 Documentation

- **Component Documentation**: See component files for JSDoc comments
- **API Documentation**: See `services/api/` for API service documentation
- **Type Definitions**: See `types/` directory for TypeScript interfaces

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

© 2024 PAK EXPORTERS REGISTERED TRADEMARK. All rights reserved.

## 📞 Support

- **Email**: support@pak-exporters.com
- **Phone**: +92 321 9555507
- **Address**: 18 Level 1, I 8, Islamabad, Pakistan
- **Working Hours**: Mon - Sat / 9:00 AM - 8:00 PM

## 🔗 Links

- **Website**: [https://pak-exporters.com](https://pak-exporters.com)
- **FAQ**: [/faq](/faq)
- **Terms of Service**: [/terms](/terms)
- **Privacy Policy**: [/privacy](/privacy)

---

**Built with ❤️ for Pakistani Exporters**
