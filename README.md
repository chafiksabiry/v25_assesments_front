# HARX Assessment Microfrontend

This is a standalone microfrontend that handles assessments for language skills and contact center skills. The application allows users to take individual assessments and save their results.

## Features

- **Language Assessments**: Take assessments to evaluate language skills
- **Contact Center Skill Assessments**: Evaluate skills related to contact center operations
- **Independent Assessment Flow**: Users can choose which assessments to take and complete them one by one
- **Result Tracking**: Assessment results are stored and can be viewed at completion

## Project Structure

```
/src
  /components          # UI components
  /context             # React context for state management
  /lib                 # API and utility functions
  /hooks               # Custom React hooks
  App.jsx              # Main application component
  main.jsx             # Entry point
```

## Technology Stack

- React 18
- React Router v6
- Tailwind CSS for styling
- OpenAI API for assessment analysis

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

```bash
# Create a production build
npm run build
```

The build output will be in the `dist` directory.

## Assessment Flow

1. User selects an assessment type (language or contact center skill)
2. User completes the assessment:
   - For languages: Reading a passage and recording their voice
   - For contact center skills: Responding to a scenario
3. Assessment is analyzed and scored
4. User receives feedback and performance metrics
5. User can choose to try again, take another assessment, or complete the process

## Integration

This microfrontend is designed to be used as a standalone application accessible through specific routes:

- `/assessment/language/:languageId` - For language assessments
- `/assessment/contact-center/:skillId` - For contact center skill assessments

## License

This project is proprietary and belongs to HARX.
