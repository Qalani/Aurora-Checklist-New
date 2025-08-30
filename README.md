# Aurora Checklist App ✨

A beautiful, aurora-themed checklist application built with Next.js, TypeScript, and Tailwind CSS. Features include task management, drag-and-drop reordering, color-coded categories, priority levels, progress tracking, and analytics.

## Features 🌟

- **Aurora Theme**: Beautiful gradient backgrounds with animated aurora effects
- **Task Management**: Create, edit, delete, and complete tasks
- **Drag & Drop**: Reorder tasks with smooth animations
- **Categories**: Color-coded task categories with custom colors
- **Priority Levels**: Low, medium, and high priority tasks
- **Progress Tracking**: Real-time progress statistics and analytics
- **Responsive Design**: Works perfectly on all devices
- **Modern UI**: Smooth animations and transitions with Framer Motion

## Tech Stack 🛠️

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom aurora gradients
- **Animations**: Framer Motion for smooth interactions
- **Drag & Drop**: @dnd-kit for task reordering
- **Icons**: Lucide React for beautiful icons
- **Database**: Supabase (PostgreSQL) for data persistence
- **Deployment**: Vercel-ready

## Getting Started 🚀

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd aurora-checklist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup 🗄️

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the API settings
3. Create the following tables in your Supabase database:

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  category TEXT NOT NULL,
  category_color TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deployment 🚀

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 - `SERVICE_ROLE_KEY`

## Project Structure 📁

```
src/
├── app/                 # Next.js app directory
│   └── page.tsx        # Main page component
├── components/          # React components
│   ├── TaskList.tsx    # Task list with drag & drop
│   ├── TaskForm.tsx    # Task creation/editing form
│   ├── CategoryManager.tsx # Category management
│   └── ProgressStats.tsx   # Analytics and statistics
├── lib/                 # Utility libraries
│   └── supabase.ts     # Supabase client configuration
└── types/               # TypeScript type definitions
    └── index.ts        # App types and interfaces
```

## Features in Detail 🔍

### Task Management
- Create tasks with title, description, priority, and category
- Mark tasks as complete/incomplete
- Delete tasks with confirmation
- Drag and drop to reorder tasks

### Categories
- Create custom categories with unique colors
- Edit existing categories
- Delete categories (with task reassignment)

### Priority System
- Three priority levels: Low, Medium, High
- Color-coded priority indicators
- Priority-based task filtering

### Progress Tracking
- Real-time completion statistics
- Category breakdown charts
- Priority distribution analysis
- Recent activity timeline

### Aurora Theme
- Beautiful gradient backgrounds
- Animated aurora effects
- Glassmorphism UI elements
- Smooth transitions and animations

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

This project is licensed under the MIT License.

## Support 💬

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ by Ben Millward-Sadler
# Aurora-Checklist-New
