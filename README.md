# Arty Affairs - Premium E-commerce Art Platform

A modern, responsive e-commerce website where artists can showcase and sell their artworks, featuring a clean Forest Green and White theme with elegant design.

## Features

### 🎨 **Core Functionality**
- **Landing Page** with video background and hero section
- **Shop Page** with filtering and sorting capabilities
- **Category Pages**: Originals, Resin Art, Giftables, Bouquets
- **Workshops Page** with upcoming and previous workshops
- **Interior Design Services** with project showcases
- **Artwork Upload System** for artists to add their work

### 🛠 **Technical Features**
- **Responsive Design** optimized for desktop and mobile
- **Modern UI/UX** with smooth animations and hover effects
- **Image Optimization** with lazy loading
- **SEO-friendly** with proper meta tags
- **Accessibility Features** for better user experience
- **Performance Optimized** with efficient code structure

### 🎯 **Design System**
- **Color Scheme**: Forest Green (#228B22) and White (#FFFFFF)
- **Typography**: Inter font family with clean, modern styling
- **Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions and hover effects

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Backend**: Supabase (Database & Storage)
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify ready

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arty-affairs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase project:

   **artworks table:**
   ```sql
   CREATE TABLE artworks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     artist_name TEXT NOT NULL,
     title TEXT NOT NULL,
     category TEXT NOT NULL CHECK (category IN ('original', 'resin_art', 'giftable', 'bouquet')),
     description TEXT NOT NULL,
     price DECIMAL(10,2) NOT NULL,
     image_url TEXT,
     availability_status TEXT NOT NULL CHECK (availability_status IN ('available', 'sold')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **workshops table:**
   ```sql
   CREATE TABLE workshops (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT NOT NULL,
     date TIMESTAMP WITH TIME ZONE NOT NULL,
     is_upcoming BOOLEAN DEFAULT true,
     image_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **interior_design_projects table:**
   ```sql
   CREATE TABLE interior_design_projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT NOT NULL,
     case_study TEXT NOT NULL,
     image_urls TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **Create storage bucket for images:**
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('artwork-images', 'artwork-images', true);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout with navigation
│   ├── ArtworkCard.jsx # Artwork display component
│   └── FilterBar.jsx   # Filtering and sorting
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── ShopPage.jsx
│   ├── OriginalsPage.jsx
│   ├── ResinArtPage.jsx
│   ├── GiftablesPage.jsx
│   ├── BouquetsPage.jsx
│   ├── WorkshopsPage.jsx
│   ├── InteriorDesignPage.jsx
│   └── UploadArtworkPage.jsx
├── lib/                # Utility functions
│   └── supabase.js     # Supabase configuration
├── App.jsx             # Main app component
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## Features Overview

### 🏠 **Landing Page**
- Full-screen video background
- Hero section with call-to-action buttons
- Feature highlights section
- Responsive design for all devices

### 🛍️ **Shop Page**
- Grid/list view toggle
- Category filtering
- Price and date sorting
- Search functionality
- Product cards with hover effects

### 📱 **Responsive Design**
- Mobile-first approach
- Optimized for tablets and desktops
- Touch-friendly interface
- Fast loading times

### 🎨 **Artist Features**
- Easy artwork upload with image preview
- Category selection (Original, Resin Art, Giftable, Bouquet)
- Price and availability management
- Image optimization and storage

### 🎓 **Workshop Management**
- Upcoming workshops display
- Previous workshops gallery
- Registration functionality
- Workshop details and scheduling

## Customization

### Colors
The theme uses Forest Green (#228B22) and White (#FFFFFF). To change colors:

1. Update `tailwind.config.js`:
   ```js
   colors: {
     'forest-green': '#your-color',
     'white': '#your-color',
   }
   ```

2. Update CSS variables in `src/index.css`

### Content
- Replace placeholder images with your own
- Update artist information and descriptions
- Customize workshop schedules and content
- Modify interior design project showcases

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## Support

For support and questions:
- Create an issue in the repository
- Contact: info@artyaffairs.com

## License

This project is licensed under the MIT License.

---

**Arty Affairs** - Where Art Meets Passion 🎨
