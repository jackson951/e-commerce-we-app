# StreetLuxCity - Modern E-Commerce Platform

A premium, full-featured e-commerce web and mobile application built with **Next.js**, **Tailwind CSS**, and **Capacitor**. StreetLuxCity delivers an exceptional shopping experience across web browsers and native Android/iOS apps from a single codebase.

---

## 🎯 Project Overview

**StreetLuxCity** is a production-ready e-commerce platform that provides a complete shopping ecosystem for customers and comprehensive business management tools for administrators. The application features a responsive, intuitive interface with advanced functionality including real-time cart management, secure payment processing, order tracking, and powerful administrative capabilities.

The app is available as:
- 🌐 **Web App** — hosted on Vercel at `https://e-commerce-web-app-neon.vercel.app`
- 📱 **Android App** — built with Capacitor, installable as a native APK
- 🍎 **iOS App** — built with Capacitor, deployable via Xcode

**Tech Stack:**
- **Framework:** Next.js 16.1.6 with React 19.2.3
- **Styling:** Tailwind CSS 4 with custom design system
- **Mobile:** Capacitor 7 (Android + iOS native wrapper)
- **Form Management:** React Hook Form with Zod validation
- **State Management & API:** TanStack React Query with custom HTTP client
- **Authentication:** JWT-based auth with role-based access control
- **Language:** TypeScript 5 with strict type safety
- **UI Components:** Lucide React icons with custom components
- **Additional:** React Hot Toast for notifications, Google Maps integration

---

## ✨ Key Features

### Customer Features
- 🛍️ **Advanced Product Catalog** — Browse products with intelligent search, category filtering, price range sliders, and real-time availability indicators
- 🛒 **Smart Shopping Cart** — Real-time cart updates, quantity management, instant price calculations, and guest cart support with automatic merge on login
- 💳 **Multi-Payment Support** — Save multiple payment methods, set defaults, enable/disable cards, and secure CVV entry
- ✅ **Streamlined Checkout** — Two-step checkout process with delivery/collection options, address validation, and order summary
- 📦 **Complete Order Tracking** — View order history with real-time status updates, payment history, and delivery tracking timeline
- 👤 **Comprehensive Profile** — Update personal information, manage delivery addresses, and track order preferences
- 🎯 **Personalized Experience** — Remembered preferences, saved payment methods, and full order history for returning customers

### Admin Features
- 📊 **Real-Time Order Management** — Live order dashboard with status tracking, bulk operations, and detailed order analytics
- 👥 **Advanced User Management** — Complete user oversight with role management, account activation/deactivation, and activity monitoring
- 📦 **Intelligent Product Management** — Create/edit products with image uploads, inventory tracking, category assignment, and availability controls
- 🏷️ **Dynamic Category Management** — Create, edit, and organize product categories with descriptions and metadata
- 💹 **Business Analytics** — Revenue tracking, order volume metrics, user engagement statistics, and inventory insights
- 🔐 **Role-Based Access Control** — Admin and customer role management with granular permissions

### Payment & Security Features
- ✅ **Multi-Gateway Support** — Robust payment processing with automatic approval/decline handling and retry mechanisms
- 🔄 **Smart Payment Retry** — Customers can retry declined payments with different methods or updated CVV
- 📋 **Complete Payment Audit** — Full transaction history with gateway responses, timestamps, and status changes
- 🔒 **Bank-Level Security** — Encrypted payment data, CVV validation, secure token-based authentication
- 🛡️ **Fraud Prevention** — Rate limiting, input validation, and secure session management

### Mobile App Features (Android & iOS)
- 📱 **Native Bottom Navigation** — Tab bar with Home, Products, Categories, Cart, Orders (logged in) / Login (logged out), and Profile
- 🔙 **Android Back Button** — Hardware back button navigates through history; double-press on home to exit
- 🚫 **No Cookie Consent** — Suppressed on native apps (not required)
- 🚫 **No Footer** — Replaced by native bottom navigation bar
- 🚫 **No WhatsApp Chat** — Hidden on native apps for a clean mobile experience
- 📶 **Offline Support** — Service worker caching for browsing without internet
- 🔔 **Push Notifications** — Native push notification support via Capacitor
- 🔒 **Secure Native Scheme** — App uses `https` Android scheme for secure Capacitor communication

### Web App Features
- 🌐 **Full Footer** — Links, legal info, and contact details
- 💬 **WhatsApp Chat** — Floating chat button for customer support
- 🍪 **Cookie Consent** — GDPR-compliant cookie consent banner
- 📣 **Vercel Analytics** — Page view and performance tracking

### Advanced Features
- 📍 **Google Maps Integration** — Real-time address validation and location-based delivery options
- ⚡ **Real-Time Updates** — Live cart totals, inventory status, and order notifications
- 🎨 **Modern UI/UX** — Beautiful, intuitive interface with smooth animations and micro-interactions
- 🌐 **Multi-Currency Support** — Automatic currency conversion and localized pricing display

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm package manager
- Spring Boot e-commerce API running (default: `http://localhost:8080/api/v1`)
- Google Maps API key (optional, for address validation)
- **For Android builds:** Java JDK 21, Android SDK
- **For iOS builds:** macOS with Xcode

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/jackson951/streetluxcity-shop.git
cd streetluxcity-shop
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables** — create `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_USD_TO_ZAR=18.5
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
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

**Type checking:**
```bash
npm run type-check
```

---

## 📱 Mobile App (Android & iOS)

### Environment Setup

**Required for Android:**
- Java JDK 21 (Eclipse Adoptium recommended)
- Android SDK (`C:\Android`)
- ADB platform tools

**`android/local.properties`:**
```
sdk.dir=C:/Android
```

**`android/gradle.properties`:**
```
org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-21.0.10.7-hotspot
android.useAndroidX=true
```

### Building & Installing the Android APK

Run the full pipeline every time you make changes:

```bash
# 1. Build the web app (static export)
npm run build

# 2. Sync web assets to native projects
npx cap sync

# 3. Build the Android APK
cd android
.\gradlew assembleDebug

# 4. Install on connected Android device
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

**APK output path:**
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Capacitor Configuration

**`capacitor.config.ts`:**
```typescript
const config: CapacitorConfig = {
  appId: 'com.streetluxcity.mobile',
  appName: 'StreetLuxCity Mobile',
  webDir: 'out',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: { ... },
    PushNotifications: { ... }
  }
};
```

### Installed Capacitor Plugins
- `@capacitor/app` — Back button handling and app lifecycle
- `@capacitor/toast` — Native toast messages
- `@capacitor/network` — Network status detection
- `@capacitor/push-notifications` — Push notification support

### Mobile vs Web UI Differences

| Feature | Web | Native App |
|---|---|---|
| Navigation | Top navbar + footer | Top navbar + bottom tab bar |
| Footer | ✅ Shown | ❌ Hidden |
| WhatsApp Chat | ✅ Shown | ❌ Hidden |
| Cookie Consent | ✅ Shown | ❌ Hidden |
| Bottom Nav Bar | ❌ | ✅ Home, Products, Categories, Cart, Orders/Login, Profile |
| Cart badge | In navbar | On bottom nav Cart tab |
| Android back button | N/A | Navigates back; double-press home to exit |
| Auth pages in back stack | Normal | Replaced with home (won't navigate back to login) |
| Main content padding | Normal | Extra bottom padding to clear bottom nav |

### Bottom Navigation Behaviour

**Logged out:** Home · Products · Categories · Cart · Login

**Logged in:** Home · Products · Categories · Cart · Orders · Profile

---

## 👤 User Experience

### Customer Journey

1. **Explore Products** — Browse categorized products with advanced filtering
2. **Smart Search** — Use intelligent search to find specific items quickly
3. **Product Details** — View detailed product information with high-quality images
4. **Add to Cart** — Instantly add items with real-time cart updates (guest cart supported)
5. **Cart Management** — Modify quantities, remove items, and see live price calculations
6. **Delivery Options** — Choose between delivery (with Google Maps address validation) or collection
7. **Secure Payment** — Two-step payment with saved cards or new payment methods
8. **Order Tracking** — Real-time order status with delivery progress timeline
9. **Payment History** — Complete transaction history with gateway responses

### Admin Journey

1. **Dashboard Overview** — Live metrics on orders, revenue, and user activity
2. **Order Management** — Real-time order feed with status management and bulk operations
3. **Product Catalog** — Intuitive product management with image uploads and inventory control
4. **User Management** — Comprehensive user analytics and role assignment
5. **Category Management** — Create and organize product categories

---

## 🏗️ Project Architecture

### Application Structure
```
streetluxcity-shop/
├── src/
│   ├── app/                        # Next.js 16 App Router pages
│   │   ├── layout.tsx              # Root layout with all providers
│   │   ├── page.tsx                # Homepage (web + mobile differentiated UI)
│   │   ├── login/                  # Authentication
│   │   ├── register/               # User registration
│   │   ├── cart/                   # Shopping cart
│   │   ├── checkout/               # Payment flow
│   │   ├── products/               # Product catalog + [id] detail
│   │   ├── categories/             # Category listing + [id] detail
│   │   ├── profile/                # User account
│   │   ├── orders/                 # Order history + detail view
│   │   └── admin/                  # Admin dashboard
│   ├── components/
│   │   ├── navbar.tsx              # Top navigation
│   │   ├── footer.tsx              # Web-only footer
│   │   ├── MobileBottomNav.tsx     # Native app bottom tab bar
│   │   ├── NativeAwareFooter.tsx   # Shows footer on web, hides on native
│   │   ├── NativeAwareWhatsApp.tsx # Shows WhatsApp on web, hides on native
│   │   ├── NativeAwareCookieConsent.tsx # Shows cookie banner on web only
│   │   ├── NativeMain.tsx          # Adds bottom padding on native for tab bar
│   │   ├── AndroidBackHandler.tsx  # Mounts hardware back button listener
│   │   ├── product-card.tsx        # Product display component
│   │   ├── route-guards.tsx        # Authentication route protection
│   │   ├── whatsapp-chat.tsx       # Floating WhatsApp button (web only)
│   │   ├── cookie-consent.tsx      # GDPR cookie banner (web only)
│   │   └── service-worker-registration.tsx
│   ├── contexts/
│   │   ├── auth-context.tsx        # Authentication state + JWT
│   │   └── cart-context.tsx        # Shopping cart state (guest + auth)
│   ├── hooks/
│   │   ├── useNative.ts            # Detects if running in Capacitor native app
│   │   └── useAndroidBackButton.ts # Android hardware back button handler
│   ├── lib/
│   │   ├── api.ts                  # API service layer
│   │   ├── types.ts                # TypeScript interfaces
│   │   ├── utils.ts                # Helper functions
│   │   ├── validation.ts           # Zod form validation schemas
│   │   └── order-tracking.ts      # Order status management
│   └── providers.tsx               # App providers wrapper
├── android/                        # Capacitor Android project
│   ├── app/
│   │   └── build/outputs/apk/     # Built APK output
│   ├── local.properties            # Android SDK path
│   └── gradle.properties           # JDK + build config
├── ios/                            # Capacitor iOS project
├── public/                         # Static assets + PWA manifest
├── capacitor.config.ts             # Capacitor app configuration
├── next.config.ts                  # Next.js config (output: export)
└── package.json
```

### Key Architecture Decisions

#### Next.js Static Export
`output: 'export'` is set in `next.config.ts` so Next.js generates a static `out/` directory. This is required for Capacitor — it copies the static files into the native Android/iOS project. All dynamic routes declare `generateStaticParams()` to pre-render at build time.

#### Native Detection
A `useIsNative` hook (`hooks/useNative.ts`) uses `@capacitor/core` to detect whether the app is running inside a native Capacitor container. This drives all platform-specific UI differences — bottom nav, footer visibility, WhatsApp chat, cookie consent, and content padding.

#### State Management
- **React Context** — global auth and cart state
- **TanStack Query** — server state and caching
- **Optimistic updates** — cart mutations update UI before server confirms

#### Guest Cart
Unauthenticated users can add items to a localStorage-based guest cart. On login, the guest cart is automatically merged into the authenticated server cart.

#### Security & Authentication
- JWT-based authentication with role-based access (admin/customer)
- Route protection via `RequireAuth` and `RequireAdmin` guards
- Auth pages removed from navigation history on native (back button goes home, not to login)

---

## 📦 Technology Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.1.6 + React 19.2.3 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Mobile | Capacitor 7 (Android + iOS) |
| State | TanStack React Query 5 + React Context |
| Forms | React Hook Form 7 + Zod 4 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Analytics | Vercel Analytics |
| Maps | Google Maps API |
| Native Plugins | @capacitor/app, @capacitor/toast, @capacitor/network |

---

## 🔐 Authentication & Security

- **JWT Tokens** — used for all authenticated API requests
- **Role-Based Access** — admin and customer roles with separate dashboards
- **Secure Token Storage** — tokens stored securely per deployment
- **CVV Validation** — payment CVV never stored on client; validated server-side
- **CORS Configuration** — backend allows web origin, Capacitor origins (`capacitor://localhost`, `http://localhost`, `ionic://localhost`)
- **HTTPS** — Android app uses `androidScheme: 'https'` for secure Capacitor communication

---

## 🔄 API Integration

The application connects to a Spring Boot e-commerce API.

**Production API:** `https://api-streetluxciry.onrender.com/api/v1`

```
Authentication:
  POST   /auth/login              - User login
  POST   /auth/refresh            - Refresh JWT token

Products:
  GET    /products                - List all products (fetched at build time)
  GET    /products/:id            - Get product details
  GET    /categories              - List all categories (fetched at build time)

Shopping:
  GET    /cart                    - Get user cart
  POST   /cart                    - Add item to cart
  PUT    /cart/:itemId            - Update cart item quantity
  DELETE /cart/:itemId            - Remove item from cart
  DELETE /cart                    - Clear cart

Orders:
  POST   /orders                  - Create order
  GET    /orders                  - List user orders
  GET    /orders/:id              - Get order details
  PUT    /orders/:id/cancel       - Cancel an order
  GET    /orders/:id/tracking     - Get order tracking stages

Payments:
  POST   /payments                - Process payment
  GET    /payments/:orderId       - Get payment history for order

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
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://api-streetluxciry.onrender.com/api/v1` |
| `NEXT_PUBLIC_USD_TO_ZAR` | Currency conversion rate | `18.5` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | `AIza...` |

---

## 🛠️ Development Guide

### Adding New Pages
1. Create page in `src/app/your-page/page.tsx`
2. If it has dynamic segments, add `generateStaticParams()` for static export compatibility
3. Add route to `MobileBottomNav` if it should be a primary navigation destination
4. Protect with `<RequireAuth>` or `<RequireAdmin>` if authentication is required

### Adding Native-Only or Web-Only Components
Use the `useIsNative` hook:
```typescript
import { useIsNative } from '@/hooks/useNative';

export function MyComponent() {
  const isNative = useIsNative();
  if (isNative) return <NativeVersion />;
  return <WebVersion />;
}
```

Or create a `NativeAware` wrapper component that returns null on the unwanted platform.

### Code Quality
```bash
npm run lint          # ESLint
npm run type-check    # TypeScript strict check
npm run build         # Full production build + static export
```

---

## 🚢 Deployment

### Web — Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploys automatically on push to main

### Android APK
```bash
npm run build         # Next.js static export → out/
npx cap sync          # Copy out/ into android project
cd android
.\gradlew assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

### iOS
```bash
npm run build
npx cap sync
npx cap open ios      # Opens Xcode
# Build and run from Xcode
```

---

## 🐛 Troubleshooting

### Web Build Issues
```bash
# Clear all caches
rm -rf .next out node_modules
npm install
npm run build
```

### Android Build Issues
```bash
# Stop Gradle daemon (fixes locked APK file)
cd android
.\gradlew --stop

# Then rebuild
.\gradlew assembleDebug
```

### ADB / Device Issues
```bash
# Check device is connected and authorized
adb devices

# If APK file not found — you must build first
cd android && .\gradlew assembleDebug
```

### Native Features Not Working
- Open `chrome://inspect` on desktop while app is open on phone
- Click **inspect** on your app to open DevTools
- Check the Console for Capacitor detection logs

### Back Button Exits App Immediately
- Ensure `@capacitor/app` is installed: `npm install @capacitor/app`
- Run `npx cap sync` after installing
- Rebuild the APK

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com)
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
- Check existing documentation above
- Use `chrome://inspect` for mobile debugging

---

**Happy coding! 🎉**
