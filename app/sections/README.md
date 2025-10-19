# Projects Section Documentation

## Overview

The Projects Section displays a grid of project cards, each showing Desktop (D), Tablet (T), and Mobile (M) views in a unified, clickable card. When clicked, users are redirected to a detailed project page at `/project/[id]`.

## Layout Structure

Each project card follows this layout:

```
       Title 
[         D         ]
[ M ] [     T     ]
```

- **Desktop (D)**: Full-width image at the top (16:9 aspect ratio)
- **Mobile (M)**: Left side, smaller view (9:16 aspect ratio)
- **Tablet (T)**: Right side, larger than mobile (4:3 aspect ratio)

## Usage

### 1. Define Your Projects Data

In your page component (e.g., `app/page.tsx`), create an array of projects:

```typescript
const projectsData = [
  {
    id: 'unique-project-id',
    title: 'Project Title',
    category: 'Category Name',
    description: 'Short description of the project',
    images: {
      desktop: '/path/to/desktop-image.jpg',
      tablet: '/path/to/tablet-image.jpg',
      mobile: '/path/to/mobile-image.jpg',
    }
  },
  // ... more projects
];
```

### 2. Import and Use the Component

```typescript
import ProjectsSection from './sections/ProjectsSection';

export default function Home() {
  return (
    <>
      <ProjectsSection projects={projectsData} />
    </>
  );
}
```

## Project Detail Page

The project detail page is automatically created at `/project/[id]`. It displays:

- Full project information
- All three device views (Desktop, Tablet, Mobile)
- Technologies used
- Client information
- Additional project images

### Customizing Project Details

Edit `app/project/[id]/page.tsx` to modify the project detail page. You can:

1. Connect to a real database/API
2. Add more fields to the project data
3. Customize the layout and design
4. Add more sections (e.g., testimonials, process, etc.)

## Styling

The component follows the Yohji Yamamoto-inspired design guide:

- **Colors**: Pure black background with white text
- **Borders**: Gray borders that turn white on hover
- **Images**: Grayscale by default, color on hover
- **Typography**: Light font weights, tight tracking
- **Animations**: Smooth fade-in and scale effects using Motion One

## Features

### Interactive Elements

- ✅ Hover effects on cards (border color, image scale, grayscale removal)
- ✅ Smooth animations on page load
- ✅ Responsive grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- ✅ Device view labels (D, T, M) for clarity
- ✅ Clickable entire card area

### Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigable links
- Alt text for all images
- High contrast text

## Adding New Projects

1. **Add images**: Place your project images in the `public` folder
2. **Create project data**: Add a new object to the `projectsData` array
3. **Add detail page data**: Update the `projectsData` in `app/project/[id]/page.tsx`

Example:

```typescript
{
  id: 'my-new-project',
  title: 'My New Project',
  category: 'Web Development',
  description: 'A brief description',
  images: {
    desktop: '/projects/my-project-desktop.jpg',
    tablet: '/projects/my-project-tablet.jpg',
    mobile: '/projects/my-project-mobile.jpg',
  }
}
```

## Future Enhancements

Consider adding:

- [ ] Filter/sort functionality by category
- [ ] Search feature
- [ ] Pagination for many projects
- [ ] Image lightbox/gallery
- [ ] Case study content with rich text
- [ ] Related projects section
- [ ] Social sharing buttons
- [ ] Live project links
- [ ] GitHub repository links

## Tips

1. **Image Optimization**: Use Next.js Image component for automatic optimization
2. **Consistent Aspect Ratios**: Keep device screenshots at the specified ratios for best results
3. **Loading States**: Consider adding skeleton loaders for better UX
4. **Error Handling**: The detail page already handles missing projects gracefully
5. **SEO**: Add metadata to the project detail pages for better search visibility

## File Structure

```
app/
├── sections/
│   ├── ProjectsSection.tsx      # Main projects grid component
│   └── README.md                # This file
└── project/
    └── [id]/
        └── page.tsx             # Dynamic project detail page
```

