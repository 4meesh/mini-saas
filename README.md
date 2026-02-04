# Mini SaaS Dashboard

A modern, full-featured task management application built with React.js and Supabase, featuring secure authentication, real-time data management, and a beautiful glassmorphic UI.

![Mini SaaS Dashboard](https://img.shields.io/badge/React-18.3-blue) ![Supabase](https://img.shields.io/badge/Supabase-2.39-green) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ Features

### 🔐 Authentication
- **Email/Password Authentication** using Supabase Auth
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Session Management** - Persistent login across page refreshes
- **Sign Up/Sign In** - Seamless user registration and login flow
- **Secure Sign Out** - Clean session termination

### 📝 Task Management
- **Create Tasks** - Add new tasks with rich text content
- **View Tasks** - Display all tasks in chronological order
- **Edit Tasks** - Inline editing with save/cancel options
- **Delete Tasks** - Remove tasks with confirmation dialog
- **Complete Tasks** - Toggle completion status with visual feedback
- **Task Statistics** - Real-time counts of total, completed, and active tasks

### 🔒 Security
- **Row Level Security (RLS)** - Database-level access control
- **User Isolation** - Each user can only access their own data
- **Secure Authentication** - Password hashing via Supabase
- **Protected API Routes** - All database operations require authentication

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful frosted glass effects
- **Dark Theme** - Easy on the eyes with vibrant accents
- **Smooth Animations** - Polished micro-interactions
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Custom Components** - Styled checkboxes, buttons, and forms

## 🚀 Quick Start

### Prerequisites

- **Docker** installed on your system ([Get Docker](https://docker.com/get-started/))
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

### 1. Clone or Navigate to Project

```bash
cd "F:\Mini Saas"
```

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Set up the tasks table
- Configure Row Level Security policies
- Get your API credentials

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start with Docker

Build and start the application:

```bash
docker-compose up --build
```

The application will be available at **http://localhost:5173**

### 5. Create Your First Account

1. Open http://localhost:5173 in your browser
2. Click "Don't have an account? Sign up"
3. Enter your email and password (minimum 6 characters)
4. Sign in and start managing tasks!

## 📁 Project Structure

```
F:\Mini Saas\
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   └── TaskItem.jsx           # Individual task component
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication state management
│   ├── lib/
│   │   └── supabase.js            # Supabase client configuration
│   ├── pages/
│   │   ├── Login.jsx              # Login/Sign up page
│   │   └── Dashboard.jsx          # Main dashboard
│   ├── App.jsx                    # Main app component with routing
│   ├── main.jsx                   # Application entry point
│   ├── index.css                  # Global styles and design system
│   └── App.css                    # App-specific styles
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies and scripts
├── Dockerfile                     # Docker image configuration
├── docker-compose.yml             # Docker Compose setup
├── SUPABASE_SETUP.md             # Supabase setup guide
└── README.md                      # This file
```

## 🛠️ Development

### Running Locally (with Docker)

```bash
# Start the development server
docker-compose up

# Stop the server
docker-compose down

# Rebuild after dependency changes
docker-compose up --build
```

### Running Locally (without Docker)

If you have Node.js installed locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start Vite development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally

## 🗄️ Database Schema

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to auth.users |
| `content` | TEXT | Task content/description |
| `completed` | BOOLEAN | Completion status |
| `created_at` | TIMESTAMP | Creation timestamp (UTC) |

### Row Level Security Policies

- **SELECT**: Users can view only their own tasks
- **INSERT**: Users can create tasks for themselves
- **UPDATE**: Users can update only their own tasks
- **DELETE**: Users can delete only their own tasks

## 🎨 Design System

The application uses a modern design system with:

- **Color Palette**: Purple/indigo gradients with dark theme
- **Typography**: Inter font family from Google Fonts
- **Spacing**: Consistent spacing scale (0.5rem to 3rem)
- **Border Radius**: Rounded corners (0.375rem to 1rem)
- **Shadows**: Layered shadows with glow effects
- **Animations**: Smooth transitions (150ms to 350ms)

## 🔧 Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Remove existing containers and rebuild
docker-compose down
docker-compose up --build
```

**Port 5173 already in use:**
```bash
# Change the port in docker-compose.yml
ports:
  - "3000:5173"  # Use port 3000 instead
```

### Supabase Issues

**"Missing Supabase environment variables":**
- Ensure `.env` file exists in project root
- Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the development server

**Tasks not appearing:**
- Verify RLS policies are created correctly
- Check browser console for errors
- Ensure you're signed in with the correct user

### Authentication Issues

**Email confirmation required:**
- For development: Disable email confirmations in Supabase settings
- For production: Configure SMTP for email delivery

**Sign up not working:**
- Check browser console for detailed errors
- Verify Supabase project is active
- Ensure email provider is enabled in Supabase

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Push your code to GitHub
2. Import project in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Deploy!

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Support

If you have any questions or need help, please:
1. Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
2. Review the troubleshooting section above
3. Check browser console for error messages

## 🎯 Next Steps

- [ ] Add task categories/tags
- [ ] Implement task due dates
- [ ] Add task priority levels
- [ ] Enable task search and filtering
- [ ] Add dark/light theme toggle
- [ ] Implement task sharing between users
- [ ] Add email notifications
- [ ] Create mobile app with React Native

---

**Built with ❤️ using React, Supabase, and Docker**
