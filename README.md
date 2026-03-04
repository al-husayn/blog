# Learn. Build. Share.

A modern, responsive blog built with Next.js 15, Fumadocs MDX, and Tailwind CSS. Beautiful interface for displaying articles, tutorials, and insights about React and modern web development.

## ✨ Features

- 🎨 **Modern Design** - Clean, responsive interface
- 📝 **MDX Support** - Write blog posts in MDX with full component support
- 🌙 **Dark Mode** - Built-in dark/light theme toggle
- 🏷️ **Tags & Categories** - Organize content with tags
- ⭐ **Featured Posts** - Highlight your best articles
- 📱 **Mobile Responsive** - Perfect on all devices
- 🚀 **Fast Performance** - Optimized with Next.js 15
- 🤖 **Post AI Assistant** - Ask context-aware questions inside each article

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/al-husayn/blog
cd blog

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🤖 AI Assistant Setup

The blog includes an embedded assistant on each post page. It is grounded in the active article and tailored to the current reader's question.

1. Use a cloud inference provider that serves open-source models (default config uses OpenRouter).
2. Add env variables:

```bash
AI_API_BASE_URL=https://openrouter.ai/api/v1
AI_API_KEY=your_cloud_api_key_here
AI_MODEL=openrouter/free
```

3. Restart the dev server after updating env values.

You can swap to any OpenAI-compatible cloud endpoint and open-source model by changing `AI_API_BASE_URL` and `AI_MODEL`.  
If a specific free model route is temporarily unavailable, keep `AI_MODEL=openrouter/free` for automatic free-endpoint routing.

## ✍️ Adding Blog Posts

Create a new MDX file in `blog/content/` with format `your-post-title.mdx`:

````mdx
---
title: "Your Blog Post Title"
description: "A brief description of your post"
date: "2024-12-01"
tags: ["React", "Next.js", "Tutorial"]
featured: true
readTime: "10 min read"
author: "Your Name"
---

Your blog post content here...

## Markdown Support

You can use all standard Markdown features plus MDX components.

```tsx
// Code syntax highlighting works great!
export default function Component() {
  return <div>Hello World!</div>;
}
```
````

## 🎨 Customization

### Adding New Tags/Categories

Simply add them to your blog post frontmatter. The system automatically generates tag pages.

### Featured Posts

Set `featured: true` in your blog post frontmatter to highlight it on the homepage (you can create a dedicated feature section in the home page).

### Styling

The project uses Tailwind CSS with a custom design system. Modify styles in:

- `app/globals.css` - Global styles
- Individual component files - Component-specific styles

### For Authors

Add your author details to the `lib/authors.ts` file.

```tsx
// lib/authors.ts
export const authors: Record<string, Author> = {
  al: {
    name: "Al-Hussein A.",
    position: "Software Engineer",
    avatar: "/authors/AL.png",
  },
  hamdan: {
    name: "AL Drake",
    position: "Design System Engineer",
    avatar: "/authors/Hamdan.jpeg",
  },
  // Add your author details here
  yourname: {
    name: "Your Full Name",
    position: "Your Position/Title",
    avatar: "/authors/your-avatar.png",
  },
} as const;
```

Then reference your author in blog posts using the key (e.g., `author: "yourname"`).

## 📖 Technologies Used

- **Next.js 15** - React framework with App Router
- **Fumadocs MDX** - MDX processing and components
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Geist Font** - Modern typography

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
