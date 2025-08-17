# FindMySpot Frontend

React + Vite frontend application for FindMySpot parking space finder. A single representative screenshot is available in the root project `README.md` (others removed to keep docs lean).

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   ├── assets/             # Static assets
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Entry point
├── public/                 # Public assets
├── index.html              # HTML template
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Setup

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=FindMySpot
```

For production:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=FindMySpot
```

## Components

### Main Components
- `LandingPage` - Homepage with search functionality
- `LoginPage` / `SignupPage` - User authentication
- `UserDashboard` - User booking management
- `ListerDashboard` - Parking space owner interface
- `AdminDashboard` - Administrative interface
- `ParkingFinderPage` - Search and booking interface

### Utility Components
- `AutoCompleteSearch` - Location search with suggestions
- `ParkingAnimation` - Loading animations
- `LogoutConfirmationModal` - User session management

## Styling

CSS files are organized in `src/components/CSS/`:
- Component-specific styles
- Responsive design
- Modern CSS features

## Features

### For Users
- Search parking spaces by location
- Real-time availability checking
- Booking management
- Payment integration
- Support query system

### For Listers
- Parking space management
- Booking oversight
- Revenue tracking
- Customer communication

### For Admins
- User and lister management
- Query resolution
- System analytics
- Content moderation

## Development

### Adding New Components

1. Create component file in `src/components/`
2. Add corresponding CSS file in `src/components/CSS/`
3. Import and use in parent components
4. Update routing if needed

### API Integration

Components use fetch or axios to communicate with the backend:

```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

### Deploy to Render/Netlify/Vercel

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Set `VITE_API_URL` to your backend URL

### Environment Variables

Make sure to set:
- `VITE_API_URL` - Backend API URL
- Any other `VITE_` prefixed variables needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React lazy loading
- Image optimization
- Bundle size optimization with Vite
- Caching strategies for API calls

## Contributing

1. Follow existing code structure
2. Add CSS classes for new components
3. Test responsive design
4. Ensure accessibility compliance
5. Update documentation for new features
