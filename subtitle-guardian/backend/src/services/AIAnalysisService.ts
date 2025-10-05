import { ComprehendClient, DetectSentimentCommand, DetectEntitiesCommand } from '@aws-sdk/client-comprehend';
import OpenAI from 'openai';
import { TopicScore, FlaggedExcerpt, AnalysisResults, MovieSummary } from '../models/Analysis';

export class AIAnalysisService {
  private comprehendClient: ComprehendClient;
  private openai: OpenAI;

  // Predefined topic keywords and patterns
  private topicKeywords = {
    violence: [
      'kill', 'murder', 'death', 'blood', 'fight', 'gun', 'weapon', 'shoot', 'stab', 'attack',
      'war', 'battle', 'violence', 'violent', 'assault', 'abuse', 'torture', 'bomb', 'explosion'
    ],
    sexual_content: [
      'sex', 'sexual', 'naked', 'nude', 'kiss', 'romance', 'intimate', 'bedroom', 'affair',
      'seduction', 'erotic', 'passionate', 'desire', 'lust', 'breast', 'body'
    ],
    profanity: [
      'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'crap', 'piss'
    ],
    drugs_alcohol: [
      'drink', 'alcohol', 'beer', 'wine', 'drunk', 'drug', 'cocaine', 'marijuana', 'smoke',
      'cigarette', 'addiction', 'overdose', 'high', 'weed', 'pills'
    ],
    religion: [
      'god', 'jesus', 'christ', 'church', 'prayer', 'bible', 'heaven', 'hell', 'devil',
      'satan', 'religious', 'faith', 'worship', 'holy', 'sacred', 'blessed', 'sin'
    ],
    lgbtq: [
      'gay', 'lesbian', 'transgender', 'trans', 'queer', 'homosexual', 'bisexual',
      'gender identity', 'sexual orientation', 'pride', 'coming out'
    ],
    mental_health: [
      'depression', 'anxiety', 'suicide', 'self-harm', 'mental illness', 'therapy',
      'counseling', 'medication', 'bipolar', 'schizophrenia', 'ptsd'
    ],
    bullying: [
      'bully', 'bullying', 'harassment', 'intimidation', 'teasing', 'mockery',
      'humiliation', 'exclusion', 'cyberbullying', 'peer pressure'
    ]
  };

  constructor() {
    this.comprehendClient = new ComprehendClient({
      region: process.env.AWS_COMPREHEND_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Analyze subtitle content for specified topics
   */
  async analyzeContent(
    subtitleText: string,
    requestedTopics: string[],
    customKeywords: string[] = [],
    movieTitle: string
  ): Promise<AnalysisResults> {
    try {
      const startTime = Date.now();

      // Perform keyword-based analysis
      const keywordResults = await this.performKeywordAnalysis(
        subtitleText,
        requestedTopics,
        customKeywords
      );

      // Perform AI sentiment analysis
      const sentimentResults = await this.performSentimentAnalysis(subtitleText);

      // Perform entity detection
      const entityResults = await this.performEntityDetection(subtitleText);

      // Combine results and calculate overall rating
      const topicScores = this.combineAnalysisResults(
        keywordResults,
        sentimentResults,
        entityResults,
        requestedTopics
      );

      const overallRating = this.calculateOverallRating(topicScores);
      const flaggedExcerpts = this.extractFlaggedExcerpts(subtitleText, topicScores);

      const processingTime = Date.now() - startTime;

      return {
        overallRating,
        topicScores,
        flaggedExcerpts,
        statistics: {
          totalSubtitleLines: subtitleText.split('\n').length,
          totalWords: subtitleText.split(' ').length,
          processingDuration: processingTime,
          flaggedPercentage: this.calculateFlaggedPercentage(flaggedExcerpts, subtitleText)
        }
      };
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw new Error('Failed to analyze content');
    }
  }

  /**
   * Generate 1000-word discussion summary for parents
   */
  async generateMovieSummary(
    movieTitle: string,
    analysisResults: AnalysisResults,
    moviePlot: string
  ): Promise<MovieSummary> {
    try {
      const prompt = `
        As a family content advisor, create a comprehensive 1000-word discussion guide for parents about the movie "${movieTitle}".

        Movie Plot: ${moviePlot}

        Content Analysis Results:
        - Overall Rating: ${analysisResults.overallRating.score}/10
        - Age Recommendation: ${analysisResults.overallRating.ageRecommendation}
        - Key Topics Found: ${analysisResults.topicScores.map(t => `${t.topic} (${t.severity})`).join(', ')}

        Please provide:
        1. A detailed overview of themes and messages
        2. Discussion points organized by age group (6-9, 10-13, 14+)
        3. Specific considerations for parents
        4. Before, during, and after watching guidance
        5. Questions to facilitate meaningful conversations

        Focus on helping parents use this movie as a learning opportunity while being mindful of the content concerns identified.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const summaryText = response.choices[0]?.message?.content || '';

      // Parse the AI response into structured format
      return this.parseAISummaryResponse(summaryText, movieTitle, analysisResults);
    } catch (error) {
      console.error('Error generating movie summary:', error);
      throw new Error('Failed to generate movie summary');
    }
  }

  private async performKeywordAnalysis(
    text: string,
    requestedTopics: string[],
    customKeywords: string[]
  ): Promise<Map<string, { count: number; examples: string[] }>> {
    const results = new Map();
    const textLower = text.toLowerCase();

    // Analyze predefined topics
    for (const topic of requestedTopics) {
      const keywords = this.topicKeywords[topic as keyof typeof this.topicKeywords] || [];
      let count = 0;
      const examples: string[] = [];

      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          count += matches.length;
          // Extract context around the keyword
          const contextMatches = text.match(new RegExp(`.{0,30}\\b${keyword}\\b.{0,30}`, 'gi'));
          if (contextMatches) {
            examples.push(...contextMatches.slice(0, 3)); // Limit to 3 examples per keyword
          }
        }
      }

      if (count > 0) {
        results.set(topic, { count, examples: [...new Set(examples)] });
      }
    }

    // Analyze custom keywords
    if (customKeywords.length > 0) {
      let customCount = 0;
      const customExamples: string[] = [];

      for (const keyword of customKeywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = textLower.match(regex);
        if (matches) {
          customCount += matches.length;
          const contextMatches = text.match(new RegExp(`.{0,30}\\b${keyword}\\b.{0,30}`, 'gi'));
          if (contextMatches) {
            customExamples.push(...contextMatches.slice(0, 2));
          }
        }
      }

      if (customCount > 0) {
        results.set('custom_keywords', { count: customCount, examples: [...new Set(customExamples)] });
      }
    }

    return results;
  }

  private async performSentimentAnalysis(text: string): Promise<any> {
    try {
      // Split text into chunks if too long (AWS Comprehend has limits)
      const chunks = this.splitTextIntoChunks(text, 4500);
      const sentimentResults = [];

      for (const chunk of chunks) {
        const command = new DetectSentimentCommand({
          Text: chunk,
          LanguageCode: 'en'
        });

        const result = await this.comprehendClient.send(command);
        sentimentResults.push(result);
      }

      return sentimentResults;
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      return [];
    }
  }

  private async performEntityDetection(text: string): Promise<any> {
    try {
      const chunks = this.splitTextIntoChunks(text, 4500);
      const entityResults = [];

      for (const chunk of chunks) {
        const command = new DetectEntitiesCommand({
          Text: chunk,
          LanguageCode: 'en'
        });

        const result = await this.comprehendClient.send(command);
        entityResults.push(result);
      }

      return entityResults;
    } catch (error) {
      console.error('Error in entity detection:', error);
      return [];
    }
  }

  private combineAnalysisResults(
    keywordResults: Map<string, { count: number; examples: string[] }>,
    sentimentResults: any[],
    entityResults: any[],
    requestedTopics: string[]
  ): TopicScore[] {
    const topicScores: TopicScore[] = [];

    // Process keyword results
    for (const [topic, data] of keywordResults.entries()) {
      const score = Math.min(10, Math.log10(data.count + 1) * 3); // Logarithmic scaling
      const severity = score < 3 ? 'low' : score < 7 ? 'medium' : 'high';

      topicScores.push({
        topic,
        score: Math.round(score * 10) / 10,
        confidence: 0.8, // Keyword matching has high confidence
        occurrences: data.count,
        severity,
        examples: data.examples.slice(0, 5) // Limit examples
      });
    }

    // Add sentiment-based scoring
    const avgSentiment = this.calculateAverageSentiment(sentimentResults);
    if (avgSentiment.negative > 0.6) {
      topicScores.push({
        topic: 'negative_sentiment',
        score: avgSentiment.negative * 10,
        confidence: avgSentiment.confidence,
        occurrences: 1,
        severity: avgSentiment.negative > 0.8 ? 'high' : 'medium',
        examples: ['Overall negative emotional tone detected']
      });
    }

    return topicScores.sort((a, b) => b.score - a.score);
  }

  private calculateOverallRating(topicScores: TopicScore[]): AnalysisResults['overallRating'] {
    if (topicScores.length === 0) {
      return {
        score: 10,
        ageRecommendation: 'All ages',
        confidence: 0.9
      };
    }

    // Calculate weighted score based on severity and topic importance
    const weightedScore = topicScores.reduce((acc, topic) => {
      const weight = topic.severity === 'high' ? 3 : topic.severity === 'medium' ? 2 : 1;
      return acc + (topic.score * weight);
    }, 0);

    const maxPossibleScore = topicScores.length * 10 * 3; // Assuming all high severity
    const normalizedScore = Math.max(1, 10 - (weightedScore / maxPossibleScore) * 10);

    // Determine age recommendation
    let ageRecommendation = 'All ages';
    if (normalizedScore < 3) ageRecommendation = '18+';
    else if (normalizedScore < 5) ageRecommendation = '16+';
    else if (normalizedScore < 7) ageRecommendation = '13+';
    else if (normalizedScore < 9) ageRecommendation = '10+';

    return {
      score: Math.round(normalizedScore * 10) / 10,
      ageRecommendation,
      confidence: Math.min(0.95, topicScores.reduce((acc, t) => acc + t.confidence, 0) / topicScores.length)
    };
  }

  private extractFlaggedExcerpts(text: string, topicScores: TopicScore[]): FlaggedExcerpt[] {
    const excerpts: FlaggedExcerpt[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    for (const topic of topicScores) {
      if (topic.score > 5) { // Only flag significant scores
        for (const example of topic.examples.slice(0, 3)) {
          excerpts.push({
            timestamp: '00:00:00', // Would need subtitle timing for actual timestamp
            text: example.trim(),
            topics: [topic.topic],
            severity: topic.severity,
            context: this.getContextForExcerpt(example, text)
          });
        }
      }
    }

    return excerpts.slice(0, 20); // Limit to top 20 excerpts
  }

  private calculateFlaggedPercentage(excerpts: FlaggedExcerpt[], text: string): number {
    const totalWords = text.split(' ').length;
    const flaggedWords = excerpts.reduce((acc, excerpt) => acc + excerpt.text.split(' ').length, 0);
    return Math.round((flaggedWords / totalWords) * 100 * 10) / 10;
  }

  private parseAISummaryResponse(summaryText: string, movieTitle: string, analysisResults: AnalysisResults): MovieSummary {
    // This is a simplified parser - in production, you'd want more sophisticated parsing
    return {
      title: movieTitle,
      overview: summaryText,
      themes: this.extractThemes(summaryText),
      discussionPoints: this.extractDiscussionPoints(summaryText),
      ageAppropriate: {
        recommended: analysisResults.overallRating.ageRecommendation,
        considerations: analysisResults.topicScores.map(t => `${t.topic}: ${t.severity} level`)
      },
      parentalGuidance: {
        beforeWatching: ['Review content warnings', 'Discuss expectations'],
        duringWatching: ['Be available for questions', 'Monitor reactions'],
        afterWatching: ['Discuss themes and messages', 'Address any concerns']
      },
      generatedAt: new Date().toISOString()
    };
  }

  // Helper methods
  private splitTextIntoChunks(text: string, maxLength: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength));
    }
    return chunks;
  }

  private calculateAverageSentiment(sentimentResults: any[]): { negative: number; confidence: number } {
    if (sentimentResults.length === 0) return { negative: 0, confidence: 0 };

    const avgNegative = sentimentResults.reduce((acc, result) => {
      return acc + (result.SentimentScore?.Negative || 0);
    }, 0) / sentimentResults.length;

    return {
      negative: avgNegative,
      confidence: 0.7 // AWS Comprehend generally has good confidence
    };
  }

  private getContextForExcerpt(excerpt: string, fullText: string): string {
    const index = fullText.toLowerCase().indexOf(excerpt.toLowerCase());
    if (index === -1) return excerpt;

    const start = Math.max(0, index - 100);
    const end = Math.min(fullText.length, index + excerpt.length + 100);
    return fullText.substring(start, end);
  }

  private extractThemes(summaryText: string): string[] {
    // Simple theme extraction - in production, use more sophisticated NLP
    const commonThemes = ['friendship', 'family', 'love', 'courage', 'justice', 'redemption', 'growth'];
    return commonThemes.filter(theme => 
      summaryText.toLowerCase().includes(theme)
    );
  }

  private extractDiscussionPoints(summaryText: string): any[] {
    // Simplified extraction - in production, parse the structured AI response
    return [
      {
        topic: 'Main themes',
        description: 'Discuss the central messages of the movie',
        questions: ['What did you think was the main message?', 'How did the characters grow?'],
        ageGroup: '10+'
      }
    ];
  }
}

