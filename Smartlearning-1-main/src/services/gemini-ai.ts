// Google Gemini AI Service for Education Platform
const GEMINI_API_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiRequest {
  prompt: string;
  context?: string;
  userType: 'student' | 'teacher';
  feature: 'summarize' | 'quiz' | 'explain' | 'translate' | 'lesson' | 'practice' | 'insights' | 'general' | 'tutor' | 'quiz-generation';
  subject?: string;
  grade?: string;
  // Optional: request specific MIME type for responses (e.g., 'application/json')
  responseMimeType?: string;
}

export interface GeminiResponse {
  content: string;
  success: boolean;
  error?: string;
}

class GeminiAIService {
  private async makeRequest(prompt: string, opts?: { responseMimeType?: string }): Promise<GeminiResponse> {
    try {
      if (!GEMINI_API_KEY) {
        return {
          content: '',
          success: false,
          error: 'Missing VITE_GEMINI_API_KEY'
        };
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 2048,
            ...(opts?.responseMimeType ? { responseMimeType: opts.responseMimeType } : {})
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const parts = data.candidates[0].content.parts || [];
        const text = parts.map((p: any) => p.text).filter(Boolean).join('\n');
        return { content: text || '', success: true };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        content: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private buildPrompt(request: GeminiRequest): string {
    const gradeLevel = this.getGradeLevel(request.grade);
    const baseContext = `You are an advanced AI tutor integrated inside an educational platform. 
Your role is to adapt your explanations, quizzes, simulations, and voice narrations to the student's grade level, subject, and topic. 
You must always be age-appropriate, curriculum-aligned, and interactive.

User type: ${request.userType}. Subject: ${request.subject || 'General'}. Grade: ${request.grade || 'Not specified'} (${gradeLevel} level).

CORE BEHAVIORS:
${this.getGradeLevelInstructions(gradeLevel)}

SUBJECT-SPECIFIC FUNCTIONS:
- Mathematics: Generate age-appropriate practice questions. Create detailed step-by-step solutions.
- Science: Provide simulations and experiments with clear explanations and formulas.
- Chemistry: Show reactions, test tubes, colors, mixing, and final products with narration.
- Physics: Create simulations for pendulum, circuits, motion with formulas and outcomes.
- Biology: Animate cells, body systems, and processes with synchronized explanations.
- Humanities: Generate summaries, timelines, and quiz questions based on content.

INTERACTION RULES:
- Always explain in the clearest possible way for the target age group
- Always align to curriculum standards when available
- Provide structured, well-presented responses
- Keep tone supportive, encouraging, and educational`;
    
    let featureContext = '';
    
    switch (request.feature) {
      case 'summarize':
        featureContext = `Provide a ${gradeLevel === 'primary' ? 'very simple' : gradeLevel === 'middle' ? 'clear and engaging' : 'comprehensive'} summary that captures the key points. ${gradeLevel === 'primary' ? 'Use very simple words and short sentences.' : 'Use bullet points when appropriate.'}`;
        break;
      case 'quiz':
        featureContext = request.userType === 'teacher' 
          ? `Generate adaptive quiz questions appropriate for ${gradeLevel} level. Support multiple-choice, open-ended, and true/false formats. Include correct answers and ${gradeLevel === 'primary' ? 'simple' : 'detailed'} explanations.`
          : `Generate ${gradeLevel === 'primary' ? '3' : gradeLevel === 'middle' ? '4' : '5'} practice questions with ${gradeLevel === 'primary' ? 'very simple' : 'step-by-step'} explanations to help learning.`;
        break;
      case 'explain':
        featureContext = `Break down concepts into ${gradeLevel === 'primary' ? 'very simple, playful steps using colorful examples' : gradeLevel === 'middle' ? 'clear steps with relatable examples' : 'academic steps with real-world applications and critical thinking'}. ${gradeLevel === 'primary' ? 'Use a playful, encouraging tone.' : gradeLevel === 'high' ? 'Include formulas and prepare for exams.' : 'Encourage curiosity and discovery.'}`;
        break;
      case 'translate':
        featureContext = `Translate the content while maintaining educational context and age-appropriate language for ${gradeLevel} level students.`;
        break;
      case 'lesson':
        featureContext = `Create a structured lesson plan appropriate for ${gradeLevel} level with objectives, activities, and assessments. Include ${gradeLevel === 'primary' ? 'interactive and playful' : gradeLevel === 'middle' ? 'engaging and discovery-based' : 'analytical and exam-focused'} activities.`;
        break;
      case 'practice':
        featureContext = `Generate practice problems with ${gradeLevel === 'primary' ? 'very simple, step-by-step' : gradeLevel === 'middle' ? 'clear, encouraging' : 'detailed, analytical'} solutions and explanations appropriate for ${gradeLevel} level.`;
        break;
      case 'insights':
        featureContext = `Analyze the educational content and provide insights about learning patterns, common mistakes, and improvement suggestions tailored to ${gradeLevel} level students.`;
        break;
      default:
        featureContext = `Provide helpful, educational assistance tailored to ${gradeLevel} level students' needs. Always adapt your response depth and complexity to be age-appropriate.`;
    }

    return `${baseContext}\n\n${featureContext}\n\n${request.context ? `Context: ${request.context}\n\n` : ''}User request: ${request.prompt}`;
  }

  private getGradeLevel(grade?: string): 'primary' | 'middle' | 'high' {
    if (!grade) return 'middle';
    
    const gradeNumber = parseInt(grade);
    if (gradeNumber <= 5) return 'primary';
    if (gradeNumber <= 8) return 'middle';
    return 'high';
  }

  private getGradeLevelInstructions(level: 'primary' | 'middle' | 'high'): string {
    switch (level) {
      case 'primary':
        return `- Primary (ages 6–11): Use very simple words, short sentences, colorful examples, and playful tone. Explain slowly and step by step. Make learning fun and interactive.`;
      case 'middle':
        return `- Middle School (ages 11–15): Use clear but not overly advanced explanations. Provide relatable examples and slightly more detail. Encourage curiosity and discovery.`;
      case 'high':
        return `- High School (ages 15–18): Use academic tone, include formulas, real-world applications, and prepare for exams. Encourage critical thinking and analysis.`;
      default:
        return `- Adapt explanations to be clear, engaging, and age-appropriate for the student's level.`;
    }
  }

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    const fullPrompt = this.buildPrompt(request);
    return await this.makeRequest(fullPrompt, { responseMimeType: request.responseMimeType });
  }

  // Specific methods for different AI features
  async summarizeContent(content: string, subject?: string, grade?: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Summarize this educational content: ${content}`,
      userType: 'student',
      feature: 'summarize',
      subject,
      grade
    });
  }

  async generateQuiz(topic: string, userType: 'student' | 'teacher', subject?: string, grade?: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Create quiz questions about: ${topic}`,
      userType,
      feature: 'quiz',
      subject,
      grade
    });
  }

  async generateStructuredQuiz(
    subject: string, 
    difficulty: 'easy' | 'medium' | 'hard', 
    questionCount: number, 
    source: string,
    grade?: string,
    questionTypes?: string
  ): Promise<GeminiResponse> {
    const structuredPrompt = `You are an AI quiz generator for teachers.  
Always return your output in JSON format with this schema:

{
  "quiz": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string"
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "string",
      "correctAnswer": "True"
    },
    {
      "id": 3,
      "type": "short-answer",
      "question": "string",
      "suggestedAnswer": "string",
      "rubric": "string"
    },
    {
      "id": 4,
      "type": "essay",
      "question": "string",
      "suggestedAnswer": "string",
      "rubric": "string"
    },
    {
      "id": 5,
      "type": "open-ended",
      "question": "string",
      "suggestedAnswer": "string",
      "rubric": "string"
    }
  ]
}

Rules:
1. Support five types of questions: "multiple-choice", "true-false", "short-answer", "essay", and "open-ended".
2. For multiple-choice → Always provide 4 options (A–D) and mark the correct answer.
3. For true-false → Only provide question and correctAnswer ("True" or "False").
4. For short-answer → Provide suggestedAnswer (1-2 sentences) and grading rubric.
5. For essay → Provide comprehensive suggestedAnswer and detailed rubric.
6. For open-ended → Provide creative suggestedAnswer and flexible rubric.
7. Follow the teacher's input: subject, difficulty (easy/medium/hard), number of questions, question types, and source content.
8. Do not include explanations outside JSON.
9. Make sure all text is clear, editable, and teacher-friendly.
10. Age-appropriate language for ${grade || 'middle'} school students.

Generate ${questionCount} ${difficulty}-difficulty ${subject} questions about ${source} for ${grade || 'middle'} grade students. ${questionTypes ? `Focus on these question types: ${questionTypes}.` : 'Mix different question types appropriately.'} Return only valid JSON.`;

    return await this.makeRequest(structuredPrompt, { responseMimeType: 'application/json' });
  }

  async explainConcept(concept: string, subject?: string, grade?: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Explain this concept in simple terms: ${concept}`,
      userType: 'student',
      feature: 'explain',
      subject,
      grade
    });
  }

  async generateLesson(topic: string, subject?: string, grade?: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Create a comprehensive lesson plan for: ${topic}`,
      userType: 'teacher',
      feature: 'lesson',
      subject,
      grade
    });
  }

  async generatePractice(topic: string, subject?: string, grade?: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Create practice problems and exercises for: ${topic}`,
      userType: 'student',
      feature: 'practice',
      subject,
      grade
    });
  }

  async translateContent(content: string, targetLanguage: string): Promise<GeminiResponse> {
    return this.generateContent({
      prompt: `Translate this educational content to ${targetLanguage}: ${content}`,
      userType: 'student',
      feature: 'translate'
    });
  }
}

export const geminiAI = new GeminiAIService();