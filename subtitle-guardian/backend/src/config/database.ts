import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Create document client for easier operations
export const dynamoDb = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: process.env.USERS_TABLE || 'subtitle-guardian-users',
  MOVIES: process.env.MOVIES_TABLE || 'subtitle-guardian-movies',
  SUBSCRIPTIONS: process.env.SUBSCRIPTIONS_TABLE || 'subtitle-guardian-subscriptions',
  ANALYSIS: process.env.ANALYSIS_TABLE || 'subtitle-guardian-analysis',
};

// Database utility functions
export const createTableParams = {
  users: {
    TableName: TABLES.USERS,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  movies: {
    TableName: TABLES.MOVIES,
    KeySchema: [
      { AttributeName: 'movieId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'movieId', AttributeType: 'S' },
      { AttributeName: 'imdbId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ImdbIndex',
        KeySchema: [
          { AttributeName: 'imdbId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  subscriptions: {
    TableName: TABLES.SUBSCRIPTIONS,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'stripeCustomerId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StripeCustomerIndex',
        KeySchema: [
          { AttributeName: 'stripeCustomerId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  analysis: {
    TableName: TABLES.ANALYSIS,
    KeySchema: [
      { AttributeName: 'analysisId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'analysisId', AttributeType: 'S' },
      { AttributeName: 'movieId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'MovieIndex',
        KeySchema: [
          { AttributeName: 'movieId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      },
      {
        IndexName: 'UserIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST'
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
};

