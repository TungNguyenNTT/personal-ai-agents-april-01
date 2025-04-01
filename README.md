# Agent Hub - AI Agent Management Platform

## Overview

Agent Hub is a comprehensive platform for managing and monitoring AI agents. This application provides a centralized interface for users to:

- **Monitor agent activities** in real-time through a streamlined activity feed
- **Manage multiple AI agents** from a single dashboard
- **Track performance** with detailed analytics and statistics
- **Configure agent settings** and integrations with external services
- **Secure access** with user authentication and permission management

## Features

### Dashboard

The Dashboard provides an overview of your AI ecosystem with:

- **Agent Cards**: Quick access to each agent with status indicators and recent activity summaries
- **Performance Stats**: Visual analytics showing key metrics across all your agents
- **Activity Summary**: Recent events across all your agents in one consolidated view

### Activities Center

The Activities page offers a comprehensive feed of all agent interactions:

- **Real-time Activity Feed**: Chronological list of agent activities with type indicators
- **Filtering Options**: Filter activities by agent or activity type
- **Priority Levels**: Visual indicators for high-priority items that need attention
- **Status Tracking**: See completion status for tasks and automated processes
- **Activity Details**: Expand any activity to see complete details and context
- **Command Interface**: Issue instructions directly to specific agents or broadcast to all

### Agents Management

The Agents section lets you manage your AI assistants with:

- **Agent Configuration**: Customize each agent's settings, behavior, and capabilities
- **Integration Management**: Connect agents with third-party services and APIs
- **Testing Interface**: Try commands and see responses in a sandbox environment
- **Agent-specific Activity Logs**: View activity history filtered by agent
- **Coordination Settings**: Configure how agents communicate with each other

### Settings

The Settings page provides application-wide configuration:

- **User Preferences**: Customize the application to match your workflow
- **Notification Settings**: Configure how you want to be alerted about important events
- **API Connections**: Manage external service integrations and API keys
- **Display Options**: Adjust the interface layout, density, and appearance

### Profile

The Profile section contains user-specific information:

- **Account Details**: Manage your personal account information
- **Authentication**: Change password and security settings
- **Personal Preferences**: Set user-specific defaults for the application

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd agent-hub

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

### Authentication

The application uses Supabase for secure authentication. Users can:

1. Create an account using the sign-up form with email validation
2. Login with existing credentials
3. Reset password via email if forgotten
4. Maintain secure sessions across devices

## Technical Architecture

Agent Hub is built with modern web technologies:

- **Frontend Framework**: React with TypeScript for type safety and better developer experience
- **UI Components**: shadcn/ui for consistent, accessible interface elements with a clean design
- **Styling**: Tailwind CSS for responsive design and efficient styling
- **State Management**: React Context API for application state organization
- **Routing**: React Router for navigation and URL management
- **Authentication**: Supabase authentication services for secure user management
- **Data Visualization**: Recharts for analytics display and data representation
- **Date Handling**: date-fns for consistent date formatting and manipulation

## UI/UX Design Principles

The application follows several key design principles:

- **Responsive Design**: Optimized for all device sizes from mobile to desktop
- **Compact Layout**: Efficient use of screen space with minimal padding and margins
- **Consistent Visual Language**: Uniform styling, spacing, and interaction patterns
- **Clear Information Hierarchy**: Important information is visually prioritized
- **Accessibility**: Support for keyboard navigation, screen readers, and color contrast
- **Contextual Actions**: Relevant actions are presented at the point of need

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Project Structure

- `/src` - Source code
  - `/components` - UI components
    - `/activity` - Activity feed related components
    - `/agent` - Agent management components
    - `/dashboard` - Dashboard components
    - `/layout` - Layout components like Sidebar and PageTitle
    - `/ui` - Base UI components from shadcn/ui
  - `/contexts` - React contexts for state management
  - `/hooks` - Custom React hooks for shared functionality
  - `/integrations` - External service integrations
  - `/lib` - Utility functions and shared code
  - `/pages` - Main application pages and routes

## Deployment

To deploy your project:

1. Open [Lovable](https://lovable.dev/projects/7d0f9b25-a1f2-4cb2-bc0f-95dd659d8896)
2. Click on Share -> Publish

### Custom Domain

For using a custom domain with your Agent Hub application:

1. **Project Publishing**: First publish your project through the Lovable platform
2. **Domain Settings**: Navigate to Project > Settings > Domains
3. **Add Custom Domain**: Follow the instructions to add your own domain name
   - You'll need to update DNS records at your domain registrar
   - Typically requires adding a CNAME record pointing to the Lovable platform
4. **Domain Verification**: Wait for domain verification to complete (may take up to 24 hours)
5. **SSL Certificate**: SSL certificate will be automatically provisioned for your domain

#### Domain Management Notes

- **Default Domain**: Your application will always maintain a Lovable-provided subdomain (e.g., your-app.lovable.app) alongside your custom domain
- **Primary Domain**: You can set your custom domain as the primary domain for all communications
- **Badge Removal**: To remove the Lovable badge from your application, navigate to Project Settings and disable the "Show Lovable Badge" option (requires a paid plan)

## Performance Considerations

To ensure optimal performance:

- **Code Splitting**: The application uses dynamic imports to reduce initial load time
- **Efficient Rendering**: Components are optimized to prevent unnecessary re-renders
- **Compact UI**: Reduced padding and margins to maximize screen real estate
- **Responsive Images**: Images are optimized for different screen sizes
- **Caching Strategy**: API responses are cached to reduce redundant network requests

## Security Features

The application includes several security features:

- **Authentication**: Email and password authentication with Supabase
- **Password Reset**: Secure password reset flow via email
- **Session Management**: Secure session handling with automatic expiration
- **Data Validation**: Input validation on both client and server side
- **Environment Variables**: Sensitive configuration is stored in environment variables

## Troubleshooting

Common issues and solutions:

- **Authentication Problems**: Make sure your Supabase configuration is correct
- **Missing Activity Updates**: Check your activity feed filters
- **UI Responsiveness Issues**: Ensure all viewport sizes are being tested
- **Agent Connection Failures**: Verify API keys and connection settings
- **Domain Configuration**: If your custom domain isn't working properly:
  - Verify DNS records are correctly configured
  - Check that SSL certificate has been provisioned
  - Ensure domain verification has completed

## License

This project is licensed under the MIT License.

## Versioning

The project follows semantic versioning (SemVer) for release management.

## Recent Updates

- **UI Optimization**: Reduced padding and margins throughout the application to create a more compact interface that maximizes screen real estate
- **Card Components**: Optimized card layouts with tighter spacing and reduced padding for more efficient information display
- **Page Headers**: Streamlined page title components to take minimal vertical space
- **Layout Efficiency**: Improved overall layout density to show more content without scrolling
- **Component Spacing**: Adjusted spacing between components for a more cohesive, space-efficient design

## Documentation

For detailed documentation about specific features, please refer to:

- [Activity Flow](docs/activity-flow.md): Comprehensive guide about the activity creation and processing flow
- [API Reference](docs/api-reference.md): API endpoints and usage
- [Component Guide](docs/component-guide.md): UI components and their usage
