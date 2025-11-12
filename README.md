# Study Coach - AI-Powered Learning Companion

An intelligent study coaching platform that provides personalized learning assistance, homework help, executive function coaching, and test preparation using AI technology.

## 🚀 Features

- **Subject-Specialized Tutoring**: Interactive AI tutors for Math, Science, Writing, and more
- **Homework Assistance**: Upload homework images and get guided feedback
- **Homework Planning**: Create structured study plans with time management
- **Personalized Learning Paths**: Data-driven adaptive learning recommendations
- **Executive Function Coaching**: Performance monitoring and intervention triggers
- **Test Preparation**: Generate quizzes and flashcards on any topic
- **LaTeX Math Support**: Beautiful mathematical equation rendering
- **SVG Diagrams**: Auto-generated visual aids for better understanding

## 📋 Prerequisites

- Node.js 18+ and npm
- A [DeepSeek API key](https://platform.deepseek.com/)
- An [OpenAI API key](https://platform.openai.com/) (for text-to-speech)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd supertutor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# DeepSeek API Configuration (for AI tutoring)
DEEPSEEK_API_KEY=your-deepseek-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com

# OpenAI API Configuration (for Text-to-Speech)
OPENAI_API_KEY=your-openai-api-key-here
```

> **Security Note**: Never commit your `.env.local` file with real API keys to version control!

#### Getting Your DeepSeek API Key

1. Visit [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

#### Getting Your OpenAI API Key

1. Visit [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🏗️ Project Structure

```
supertutor/
├── src/
│   ├── ai/
│   │   ├── genkit.ts                 # DeepSeek AI client setup
│   │   ├── helpers.ts                # AI utility functions
│   │   ├── prompts.ts                # Centralized system prompts (optimized for caching)
│   │   └── flows/                    # AI-powered features
│   │       ├── subject-specialized-tutor.ts
│   │       ├── homework-feedback-flow.ts
│   │       ├── homework-planner-flow.ts
│   │       ├── test-prep-flow.ts
│   │       ├── generate-personalized-learning-path.ts
│   │       ├── data-driven-executive-function-coaching.ts
│   │       └── joke-teller-flow.ts
│   ├── app/                          # Next.js pages and routes
│   ├── components/                   # React components
│   ├── lib/                          # Utilities and Firebase config
│   └── context/                      # React context providers
├── .env.local                        # Environment variables (create this)
├── package.json
└── README.md
```

## 💡 DeepSeek Context Caching

This application is optimized to take advantage of DeepSeek's **automatic context caching** feature, which significantly reduces API costs:

### How It Works

- **Automatic**: Caching is enabled by default, no code changes needed
- **Prefix Matching**: When message prefixes match between requests, they're served from cache
- **Storage Unit**: Uses 64-token cache units
- **Cost Savings**: Cache hits cost 0.1¥ per million tokens vs 1¥ for cache misses

### Our Optimization Strategy

We've centralized all system prompts in `src/ai/prompts.ts` to maximize cache hits:

```typescript
// Same system prompt across all tutoring requests = high cache hit rate!
export const TUTOR_SYSTEM_PROMPT = `You are an AI educational assistant...`;
```

**Example**: When multiple students ask math questions, the system prompt gets cached:

```typescript
// Request 1
messages: [
  { role: "system", content: TUTOR_SYSTEM_PROMPT + "\nSubject: Math" },
  { role: "user", content: "Explain Pythagorean theorem" }
]

// Request 2 - System prompt is cached! ✅
messages: [
  { role: "system", content: TUTOR_SYSTEM_PROMPT + "\nSubject: Math" },
  { role: "user", content: "Help with quadratic equations" }
]
```

### Monitoring Cache Performance

Check API response for cache statistics:

```json
{
  "usage": {
    "prompt_cache_hit_tokens": 1500,    // Tokens served from cache (cheap!)
    "prompt_cache_miss_tokens": 100     // Tokens computed (normal cost)
  }
}
```

## 🔧 Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

## 🎨 Tech Stack

- **Framework**: Next.js 15 (React 18)
- **AI - Tutoring**: DeepSeek API (OpenAI-compatible, cost-effective)
- **AI - Text-to-Speech**: OpenAI TTS API
- **Authentication**: To be implemented (Firebase removed)
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Math Rendering**: KaTeX + react-katex

## 📝 Key Features Implementation

### Subject-Specialized Tutor

Located in `src/ai/flows/subject-specialized-tutor.ts`:
- Supports multiple subjects with specialized personas
- Math tutor includes SVG diagram generation
- LaTeX formula rendering
- Image-based homework analysis

### Homework Feedback

Located in `src/ai/flows/homework-feedback-flow.ts`:
- Upload images of homework
- Socratic questioning approach
- Suggests visual illustrations when helpful
- Subject-specific feedback

### Test Preparation

Located in `src/ai/flows/test-prep-flow.ts`:
- Generate multiple-choice quizzes
- Create flashcards
- Customizable topic and difficulty

## 🚧 Known Limitations

The following features require additional services (not implemented with DeepSeek):

1. **Text-to-Speech**: Requires OpenAI TTS API or similar service
2. **Speech-to-Text**: Requires OpenAI Whisper API or similar service
3. **Illustration Generation**: Requires DALL-E or Stable Diffusion

See individual flow files for implementation guidance.

## 🔐 Security Notes

- **Never commit `.env.local` to version control** (protected by `.gitignore`)
- Keep all API keys secure and rotate them regularly
- Use different keys for development and production
- See `SECURITY.md` for detailed security guidelines
- Use `env.example` as a template for setting up your environment

## 📖 API Documentation

### DeepSeek API

- **Docs**: [https://api-docs.deepseek.com/](https://api-docs.deepseek.com/)
- **Models**: 
  - `deepseek-chat` - Fast, general-purpose (default)
  - `deepseek-reasoner` - Advanced reasoning mode
- **Pricing**: See [DeepSeek Pricing](https://platform.deepseek.com/pricing)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Powered by [DeepSeek AI](https://www.deepseek.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Built with [Next.js](https://nextjs.org/)

## 📞 Support

For issues and questions:
- Check the [Issues](https://github.com/your-repo/issues) page
- Review [DeepSeek Documentation](https://api-docs.deepseek.com/)
- Contact support at your-email@example.com

---

Made with ❤️ for students and educators
