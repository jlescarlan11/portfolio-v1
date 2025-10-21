import type { ProjectWithDetails } from '../types/project';

export const projectsData: ProjectWithDetails[] = [
  {
    id: 'project-1',
    title: 'E-Commerce Platform',
    category: 'Web Development',
    description: 'A modern e-commerce solution with seamless user experience across all devices.',
    fullDescription: 'This comprehensive e-commerce platform was built with modern web technologies to provide a seamless shopping experience. The project focuses on performance, accessibility, and user experience across all device sizes.',
    logo: '/hero-image.svg',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    year: '2024',
    client: 'Tech Startup Inc.',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/ecommerce',
    githubUrl: 'https://github.com/yourname/ecommerce'
  },
  {
    id: 'project-2',
    title: 'Portfolio Dashboard',
    category: 'UI/UX Design',
    description: 'Analytics dashboard with real-time data visualization and responsive design.',
    fullDescription: 'A comprehensive analytics dashboard that provides real-time insights through beautiful data visualizations. Designed with a focus on usability and information hierarchy.',
    logo: '/hero-image.svg',
    technologies: ['React', 'D3.js', 'TypeScript', 'Node.js'],
    year: '2024',
    client: 'Finance Corp',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/dashboard',
    githubUrl: 'https://github.com/yourname/dashboard'
  },
  {
    id: 'project-3',
    title: 'Mobile Banking App',
    category: 'Mobile Development',
    description: 'Secure and intuitive banking application with focus on accessibility.',
    fullDescription: 'A secure mobile banking application built with accessibility and security at its core. Features include biometric authentication, real-time transactions, and comprehensive account management.',
    logo: '/hero-image.svg',
    technologies: ['React Native', 'TypeScript', 'Firebase', 'Plaid API'],
    year: '2023',
    client: 'National Bank',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/mobile-banking',
    githubUrl: 'https://github.com/yourname/mobile-banking'
  },
  {
    id: 'project-4',
    title: 'AI Content Generator',
    category: 'Artificial Intelligence',
    description: 'Revolutionary AI-powered content creation tool for marketers and writers.',
    fullDescription: 'An advanced AI content generation platform that helps content creators produce high-quality articles, social media posts, and marketing copy using state-of-the-art language models.',
    logo: '/hero-image.svg',
    technologies: ['Python', 'GPT-4', 'FastAPI', 'React', 'PostgreSQL'],
    year: '2024',
    client: 'ContentAI Labs',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/ai-content',
    githubUrl: 'https://github.com/yourname/ai-content'
  },
  {
    id: 'project-5',
    title: 'Fitness Tracking Platform',
    category: 'Health & Wellness',
    description: 'Comprehensive fitness tracking solution with personalized workout plans.',
    fullDescription: 'A complete fitness ecosystem featuring workout tracking, nutrition planning, and social features to help users achieve their health goals. Includes integration with popular wearable devices.',
    logo: '/hero-image.svg',
    technologies: ['Vue.js', 'Node.js', 'MongoDB', 'TensorFlow', 'AWS'],
    year: '2024',
    client: 'FitLife Inc.',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/fitness',
    githubUrl: 'https://github.com/yourname/fitness'
  },
  {
    id: 'project-6',
    title: 'Smart Home Dashboard',
    category: 'IoT',
    description: 'Unified control center for all your smart home devices and automations.',
    fullDescription: 'An intuitive dashboard that brings together all smart home devices into a single, easy-to-use interface. Features include automation rules, energy monitoring, and voice control integration.',
    logo: '/hero-image.svg',
    technologies: ['React Native', 'IoT Core', 'GraphQL', 'Redis', 'MQTT'],
    year: '2023',
    client: 'SmartHome Solutions',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/smart-home',
    githubUrl: 'https://github.com/yourname/smart-home'
  },
  {
    id: 'project-7',
    title: 'Virtual Event Platform',
    category: 'Event Management',
    description: 'Professional virtual event hosting with interactive features and networking.',
    fullDescription: 'A comprehensive platform for hosting virtual conferences, webinars, and networking events. Features include breakout rooms, live Q&A, virtual booths, and advanced analytics.',
    logo: '/hero-image.svg',
    technologies: ['WebRTC', 'Socket.io', 'Next.js', 'Docker', 'Kubernetes'],
    year: '2024',
    client: 'EventHub Global',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/virtual-events',
    githubUrl: 'https://github.com/yourname/virtual-events'
  },
  {
    id: 'project-8',
    title: 'Restaurant Management System',
    category: 'Hospitality',
    description: 'All-in-one solution for restaurant operations, from orders to inventory.',
    fullDescription: 'Complete restaurant management system featuring POS, inventory management, staff scheduling, and customer relationship tools. Includes mobile apps for both staff and customers.',
    logo: '/hero-image.svg',
    technologies: ['Angular', 'NestJS', 'MySQL', 'Stripe', 'Twilio'],
    year: '2023',
    client: 'RestaurantTech Co.',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/restaurant',
    githubUrl: 'https://github.com/yourname/restaurant'
  },
  {
    id: 'project-9',
    title: 'Learning Management System',
    category: 'Education',
    description: 'Modern LMS with interactive courses, quizzes, and progress tracking.',
    fullDescription: 'An engaging learning management system designed for online education. Features interactive video lessons, gamification, peer collaboration, and comprehensive analytics for educators.',
    logo: '/hero-image.svg',
    technologies: ['React', 'Django', 'PostgreSQL', 'S3', 'CloudFront'],
    year: '2024',
    client: 'EduTech Academy',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/lms',
    githubUrl: 'https://github.com/yourname/lms'
  },
  {
    id: 'project-10',
    title: 'Social Media Analytics',
    category: 'Marketing',
    description: 'Advanced analytics platform for social media performance tracking.',
    fullDescription: 'Comprehensive social media analytics tool that tracks performance across multiple platforms. Includes sentiment analysis, competitor tracking, and automated reporting features.',
    logo: '/hero-image.svg',
    technologies: ['Python', 'React', 'Elasticsearch', 'Kafka', 'Docker'],
    year: '2024',
    client: 'SocialMetrics Pro',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/social-analytics',
    githubUrl: 'https://github.com/yourname/social-analytics'
  },
  {
    id: 'project-11',
    title: 'Real Estate Marketplace',
    category: 'Real Estate',
    description: 'Modern property listing platform with virtual tours and AI recommendations.',
    fullDescription: 'A cutting-edge real estate marketplace featuring 3D virtual tours, AI-powered property recommendations, mortgage calculators, and integrated communication tools for buyers and agents.',
    logo: '/hero-image.svg',
    technologies: ['Next.js', 'Three.js', 'MongoDB', 'Stripe', 'MapBox'],
    year: '2023',
    client: 'PropertyHub Inc.',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/real-estate',
    githubUrl: 'https://github.com/yourname/real-estate'
  },
  {
    id: 'project-12',
    title: 'Blockchain Wallet',
    category: 'Cryptocurrency',
    description: 'Secure multi-currency cryptocurrency wallet with DeFi integration.',
    fullDescription: 'A secure, user-friendly cryptocurrency wallet supporting multiple blockchains. Features include DeFi protocol integration, NFT management, and advanced security measures.',
    logo: '/hero-image.svg',
    technologies: ['React', 'Web3.js', 'Solidity', 'IPFS', 'Hardhat'],
    year: '2024',
    client: 'CryptoVault Labs',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/wallet',
    githubUrl: 'https://github.com/yourname/wallet'
  },
  {
    id: 'project-13',
    title: 'Project Management Tool',
    category: 'Productivity',
    description: 'Collaborative project management with Kanban boards and time tracking.',
    fullDescription: 'A modern project management platform featuring Kanban boards, Gantt charts, time tracking, resource allocation, and team collaboration tools. Perfect for agile teams.',
    logo: '/hero-image.svg',
    technologies: ['Vue.js', 'Express', 'PostgreSQL', 'WebSocket', 'Redis'],
    year: '2023',
    client: 'TaskFlow Systems',
    images: {
      desktop: '/hero-image.svg',
      tablet: '/hero-image.svg',
      mobile: '/hero-image.svg',
    },
    additionalImages: [
      '/hero-image.svg',
      '/hero-image.svg',
    ],
    liveUrl: 'https://example.com/pm-tool',
    githubUrl: 'https://github.com/yourname/pm-tool'
  },
];

