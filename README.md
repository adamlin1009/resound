<div align="center">

# 🎼 Resound - Classical Instrument Rental Platform

<p>
A full-stack marketplace for renting classical instruments, built with Next.js 13, TypeScript, Tailwind CSS, Prisma, MongoDB, NextAuth, and Stripe payments. Connect musicians with quality instruments in their area.
</p>

![](https://img.shields.io/badge/Maintained-Yes-amber)
![](https://img.shields.io/badge/Next.js-15.3.3-black)
![](https://img.shields.io/badge/TypeScript-5.0.3-blue)
![](https://img.shields.io/badge/Stripe-Integrated-indigo)

</div>

## 🎵 About Resound

Resound is a specialized marketplace that connects classical musicians with instrument owners, making it easy to rent high-quality instruments for performances, practice, or learning. Whether you're a professional seeking a rare violin for a concert or a student needing a piano for lessons, Resound provides a trusted platform for instrument rentals.

### ✨ Key Features

- 🎻 **Instrument Listings** - Detailed listings with condition ratings and experience level recommendations
- 💳 **Secure Payments** - Integrated Stripe checkout with automatic reservation creation
- 📍 **Location-Based Search** - Find instruments in your area with interactive maps
- 📅 **Smart Booking** - Date-based availability with conflict prevention
- ⭐ **Favorites System** - Save instruments for later consideration
- 🔐 **Secure Authentication** - Google OAuth and email/password login
- 📱 **Responsive Design** - Optimized for all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form management

### Backend & Database
- **MongoDB** - Document database with Prisma ORM
- **NextAuth.js** - Authentication with Google OAuth
- **Stripe** - Payment processing and webhooks
- **Uploadthing** - Image uploads and management

### Additional Tools
- **Leaflet** - Interactive maps
- **React Select** - Country/location selection
- **Date-fns** - Date manipulation
- **Zustand** - State management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Stripe account for payments
- Uploadthing account for image uploads
- Google Cloud Platform for OAuth

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="your-mongodb-connection-string"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Image Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/resound.git
cd resound
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

4. **Seed the database (optional)**
```bash
npm run seed
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
npm run db:reset     # Reset and reseed database
```

## 🏗️ Project Structure

```
resound/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server actions for data fetching
│   ├── api/               # API routes
│   ├── instruments/       # User's instrument listings
│   ├── rentals/          # User's rental history
│   └── payment/          # Payment success/cancel pages
├── components/            # Reusable UI components
│   ├── inputs/           # Form input components
│   ├── listing/          # Listing-related components
│   ├── models/           # Modal components
│   └── navbar/           # Navigation components
├── hook/                 # Custom React hooks
├── lib/                  # Utility libraries
├── prisma/              # Database schema and migrations
└── styles/              # Global CSS styles
```

## 🎨 Key Features Explained

### Instrument Categories
- Guitar, Piano, Violin, Drums, Saxophone, Trumpet
- Keyboard, Bass, Flute, Microphone, DJ Equipment
- Audio Interface, Ukulele, Amplifier, and more

### Smart Search & Filtering
- Filter by instrument category
- Location-based search with maps
- Date availability checking
- Condition rating (1-10 scale)
- Experience level matching

### Secure Payment Flow
1. User selects dates and clicks "Proceed to Payment"
2. Stripe Checkout session created
3. Secure payment processing
4. Webhook confirms payment
5. Reservation automatically created
6. Confirmation and redirect to rentals

## 🔧 Development

### Database Models

- **User**: Authentication and profile data
- **Listing**: Instrument details with music-specific fields
- **Reservation**: Booking records with date ranges
- **Payment**: Payment tracking and status

### API Endpoints

- `/api/listings` - CRUD operations for instruments
- `/api/reservations` - Booking management
- `/api/create-checkout-session` - Stripe payment initiation
- `/api/webhooks/stripe` - Payment confirmation handling

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables**
4. **Deploy**

For Stripe webhooks in production, update your webhook endpoint URL to your production domain.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

<div align="center">
<p>Built with ❤️ for the classical music community</p>
<p>🎼 Resound - Where musicians find their perfect instrument</p>
</div>