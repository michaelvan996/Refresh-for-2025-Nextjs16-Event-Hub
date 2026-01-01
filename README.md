# TechHub Events 🚀

A modern, full-stack event management platform built with Next.js 16, TypeScript, MongoDB, and Cloudinary. Discover, share, and track tech events including hackathons, meetups, and conferences.

## ✨ Features

### Core Functionality

- **Event Discovery**: Browse and search through tech events with advanced filtering
- **Event Creation**: Host and share your own events with rich media support
- **Event Booking**: Simple email-based booking system with duplicate prevention
- **Real-time Updates**: Server-side rendering with optimized data fetching

### Technical Highlights

- **Next.js 16 App Router**: Latest React Server Components and Server Actions
- **TypeScript**: Full type safety across the application
- **MongoDB with Mongoose**: Robust data modeling with validation and indexes
- **Cloudinary Integration**: Optimized image uploads and CDN delivery
- **Environment Validation**: Type-safe environment variables with Zod
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Form Validation**: Client and server-side validation with Zod schemas
- **SEO Optimized**: Open Graph tags, Twitter cards, and semantic HTML
- **Analytics**: PostHog integration for user analytics and error tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.5 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB with Mongoose 8.20.1
- **Image Storage**: Cloudinary
- **Analytics**: PostHog
- **Validation**: Zod
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 20+
- MongoDB database (local or Atlas)
- Cloudinary account
- (Optional) PostHog account for analytics

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/techhub-events.git
cd techhub-events
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/techhub-events
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/techhub-events

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PostHog (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Site URL (for metadata)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
techhub-events/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── events/        # Event CRUD endpoints
│   ├── events/            # Event pages
│   │   ├── [slug]/       # Individual event page
│   │   ├── create/       # Event creation page
│   │   └── page.tsx      # Events listing
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── BookEvent.tsx    # Booking form component
│   ├── ErrorBoundary.tsx # Error handling
│   ├── EventCard.tsx    # Event card display
│   ├── LoadingSpinner.tsx # Loading states
│   └── Navbar.tsx       # Navigation component
├── database/             # MongoDB models
│   ├── event.model.ts   # Event schema
│   └── booking.model.ts # Booking schema
├── lib/                 # Utility functions
│   ├── actions/         # Server actions
│   ├── env.ts          # Environment validation
│   ├── mongodb.ts      # Database connection
│   ├── mongoErrorMapper.ts # Error handling
│   └── validations.ts  # Zod schemas
└── public/             # Static assets
```

## 🔌 API Endpoints

### GET `/api/events`

Fetch events with pagination and filtering.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 100)
- `search` (optional): Search in title, description, or tags
- `tag` (optional): Filter by tag
- `mode` (optional): Filter by mode (In-person, Online, Hybrid)

**Example:**

```bash
GET /api/events?page=1&limit=12&search=javascript&tag=ai
```

### POST `/api/events`

Create a new event.

**Request:** `multipart/form-data`

- `title` (required)
- `description` (required)
- `overview` (required)
- `venue` (required)
- `location` (required)
- `date` (required, YYYY-MM-DD)
- `time` (required, HH:MM)
- `mode` (required)
- `audience` (required)
- `organizer` (required)
- `agenda` (required, array)
- `tags` (required, array)
- `image` (required, File)

### GET `/api/events/[slug]`

Get a single event by slug.

## 🎨 Key Features Implementation

### Environment Variable Validation

All environment variables are validated at startup using Zod, ensuring type safety and early error detection.

### Database Connection Pooling

MongoDB connections are cached globally to prevent connection exhaustion during development hot reloads.

### Error Handling

- Comprehensive error boundaries for React components
- Structured error responses from API routes
- MongoDB error mapping to user-friendly messages

### Form Validation

- Client-side validation for immediate feedback
- Server-side validation for security
- Zod schemas for type-safe validation

### Image Upload

- Cloudinary integration for optimized image storage
- Automatic rollback on database errors
- Duplicate event prevention before upload

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform supporting Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

## 🔒 Security Considerations

- Input validation on both client and server
- MongoDB injection prevention via Mongoose
- Environment variable validation
- Error messages don't expose sensitive information
- Duplicate booking prevention

## 📈 Performance Optimizations

- Server-side rendering for SEO
- Image optimization via Cloudinary
- Database indexes for fast queries
- Connection pooling
- Pagination to limit data transfer

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Built with ❤️ for the tech community

---

**Note**: This is a showcase project demonstrating modern full-stack development practices. For production use, consider adding authentication, rate limiting, and additional security measures.
