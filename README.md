# E-Commerce Web App

A modern, full-featured e-commerce web application built with **Next.js** and **Tailwind CSS**, designed to connect seamlessly with a Spring Boot backend API. This application provides a complete shopping experience for customers and comprehensive administration tools for managing orders, products, users, and categories.

## 🎯 Project Overview

**E-Commerce Web App** is a production-ready frontend solution for e-commerce platforms. It offers a responsive, user-friendly interface for customers to browse products, manage their cart, complete purchases, and maintain their profiles. Additionally, it includes powerful admin dashboards for business management and operational oversight.

**Tech Stack:**
- **Framework:** Next.js 16.1.6 with React 19.2.3
- **Styling:** Tailwind CSS 4
- **Form Management:** React Hook Form with Zod validation
- **State Management & API:** TanStack React Query with Axios
- **Authentication:** JWT-based auth with jwt-decode
- **Language:** TypeScript 5
- **UI Components:** Lucide React icons

---

## ✨ Key Features

### Customer Features
- 🛍️ **Product Catalog** - Browse products with advanced filters and search functionality
- 🛒 **Shopping Cart** - Add/remove items, view cart, manage quantities
- 💳 **Payment Management** - Multiple saved payment methods with default selection
- ✅ **Secure Checkout** - Complete order flow with CVV verification
- 📦 **Order History** - View all orders with detailed payment attempt tracking
- 👤 **Customer Profile** - Update personal information (name, email, phone, address)
- 💰 **Payment Methods** - Add new payment methods, enable/disable existing ones

### Admin Features
- 📊 **Order Dashboard** - Comprehensive view and management of all orders
- 👥 **User Management** - Monitor and manage customer accounts
- 📦 **Product Management** - Create, update, and organize products
- 🏷️ **Category Management** - Organize products by categories
- 💹 **Analytics Overview** - Track key metrics and business KPIs

### Payment Processing
- ✅ **Approve/Decline Handling** - Automatic payment status updates
- 🔄 **Retry Logic** - Customers can retry declined payments
- 📋 **Payment Attempt Logging** - Complete history of all payment transactions
- 🔒 **Secure Payment Flow** - CVV entry, payment method selection, validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager
- Spring Boot e-commerce API running (default: `http://localhost:8080/api/v1`)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jackson951/e-commerce-we-app.git
cd e-commerce-we-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
```

### Running the Application

**Development mode:**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

**Production build:**
```bash
npm run build
npm run start
```

**Linting:**
```bash
npm run lint
```

---

## 📱 User Flows

### Customer Checkout Flow
1. **Browse & Add to Cart** - Customer explores the product catalog and adds items to cart
2. **Initiate Checkout** - Click "Checkout" button on cart page to create an order
3. **Payment Page** - Redirected to `/checkout/payment?orderId={id}`
4. **Select Payment Method** - Choose saved payment method or add a new one inline
5. **Enter Security Code** - Provide CVV for verification
6. **Complete Payment** - Submit payment
7. **Order Confirmation** - If approved, order status changes to `PAID`
8. **Retry on Decline** - If declined, payment attempt is logged and customer can retry

### Customer Profile Management
Access profile at `/profile` to:
- Update personal information (name, email, phone, address)
- Add new payment methods
- Set a default payment method
- Enable/disable existing payment methods
- View payment method details

### Admin Dashboard Access
- `/admin/orders` - Order management and monitoring
- `/admin/users` - User account management
- `/admin/products` - Product inventory management
- `/admin/categories` - Category organization

---

## 🏗️ Project Structure

```
e-commerce-we-app/
├── src/
│   ├── app/                    # Next.js app directory
│   ├── components/             # Reusable React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility functions and helpers
│   ├── types/                  # TypeScript type definitions
│   └── services/               # API service layer
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── postcss.config.mjs         # PostCSS configuration
└── eslint.config.mjs          # ESLint configuration
```

---

## 📦 Dependencies

### Core Dependencies
- **next** (16.1.6) - React framework for production
- **react** (19.2.3) - UI library
- **react-dom** (19.2.3) - React DOM rendering
- **@tanstack/react-query** (5.90.21) - Server state management and caching
- **axios** (1.13.5) - HTTP client for API requests
- **react-hook-form** (7.71.2) - Efficient form state management
- **zod** (4.3.6) - TypeScript-first schema validation
- **@hookform/resolvers** (5.2.2) - Form validation integration
- **jwt-decode** (4.0.0) - JWT token decoding
- **lucide-react** (0.575.0) - Modern icon library

### Development Dependencies
- **typescript** (5) - Static type checking
- **tailwindcss** (4) - Utility-first CSS framework
- **@tailwindcss/postcss** (4) - PostCSS plugin for Tailwind
- **eslint** (9) - Code quality and style linting
- **babel-plugin-react-compiler** (1.0.0) - React compiler optimization

---

## 🔐 Authentication & Security

- **JWT Tokens** - Used for authentication with the Spring Boot API
- **Secure Token Storage** - Tokens stored securely (implementation varies by deployment)
- **CVV Validation** - Payment CVV never stored on client; validated server-side
- **HTTPS Recommended** - Use HTTPS in production for secure data transmission
- **CORS Configuration** - Configured for secure cross-origin requests to backend

---

## 🛠️ Development Guide

### Adding New Features

1. **Create components** in `src/components/` with TypeScript
2. **Define types** in `src/types/` for type safety
3. **Use React Hook Form** for form inputs with Zod validation
4. **Manage server state** with TanStack React Query
5. **Style with Tailwind CSS** for consistent design
6. **Add API calls** through the service layer

### Code Quality
- Run ESLint regularly: `npm run lint`
- Use TypeScript for type safety
- Follow React 19 best practices
- Optimize with React Compiler plugin

---

## 🔄 API Integration

The application connects to a Spring Boot e-commerce API. Key endpoints:

```
Base URL: http://localhost:8080/api/v1

Authentication:
  POST   /auth/login              - User login
  POST   /auth/refresh            - Refresh JWT token

Products:
  GET    /products                - List products with filters
  GET    /products/:id            - Get product details
  GET    /categories              - List categories

Shopping:
  GET    /cart                    - Get user cart
  POST   /cart                    - Add to cart
  DELETE /cart/:itemId            - Remove from cart

Orders:
  POST   /orders                  - Create order
  GET    /orders                  - List user orders
  GET    /orders/:id              - Get order details

Payments:
  POST   /payments                - Process payment
  GET    /payments/:orderId       - Get payment history

Profile:
  GET    /profile                 - Get user profile
  PUT    /profile                 - Update profile
  POST   /payment-methods         - Add payment method
  GET    /payment-methods         - List payment methods
  DELETE /payment-methods/:id     - Remove payment method
```

---

## 📋 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |

**Note:** Any variable prefixed with `NEXT_PUBLIC_` is exposed to the browser; keep sensitive data server-side.

---

## 🧪 Testing

The project uses TypeScript for type safety. Add unit and integration tests as follows:

```bash
# Future: Add test scripts when test framework is integrated
# npm run test
# npm run test:coverage
```

---

## 📈 Performance Optimization

- **Next.js Image Optimization** - Built-in image optimization
- **Code Splitting** - Automatic route-based code splitting
- **React Compiler** - Babel plugin for automatic memoization
- **Query Caching** - TanStack React Query for intelligent caching
- **Tailwind CSS Purging** - Automatic unused CSS removal

---

## 🚢 Deployment

### Vercel (Recommended for Next.js)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional Server
```bash
npm run build
npm run start
```

---

## 🐛 Troubleshooting

### API Connection Issues
- Verify Spring Boot backend is running
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Confirm CORS headers are properly configured

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Payment Flow Issues
- Verify payment method validation schema
- Check JWT token expiration
- Ensure order ID is valid before payment attempt

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod Validation](https://zod.dev)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team
- Check existing documentation

---

**Happy coding! 🎉**