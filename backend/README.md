<h1>
  <img src="doc/logo.png" alt="Aipha" width="30" style="vertical-align: bottom"/> AIPHA
</h1>

<p align="center">
  <img src="doc/aipha.png" alt="Aipha Logo" width="100%" />
</p>
<div align="center">

[English](README.md) | [中文说明](doc/README_CN.md)

</div>

## Social Links
- Twitter: [aiphago](https://x.com/aiphaofficial)
- Website: [aiphago.com](https://aiphago.com)

A Twitter-based search and analysis service for obtaining and analyzing information related to cryptocurrency projects.

## Main Features

- Twitter account management and auto-login
- Twitter search and data crawling
- User profile analysis
- Token information retrieval
- Cache management

## Core Modules

### TwitterSearchService
Handles core Twitter search functionality:
- Contract address search
- User information search
- Tweet retrieval
- Data caching

### UserProfileAnalyzer 
Analyzes user profiles and project information:
- GPT analysis integration
- Bilingual (Chinese/English) analysis results
- Intelligent data cleaning

### TokenInfoService
Retrieves token-related information:
- DexScreener integration
- Pump.fun API integration
- Multi-chain support

### TwitterAccountPool
Twitter account pool management:
- Account rotation
- Timeout handling
- Cookie management

## Requirements

- Node.js
- MongoDB
- Redis
- GPT API key

## Configuration File Details

### constants.js
Main configuration file includes the following key settings:

#### Twitter Configuration (TWITTER_CONFIG)
- **Search Related**
  - `MIN_RESULTS_FOR_CACHE`: Minimum search results required for caching (30)
  - `MAX_TWEETS_PER_SEARCH`: Maximum tweets per search (30)
  - `SAMPLE_SEARCH_RESULTS`: Sample size for search results analysis (30)
  - `MAX_USER_TWEETS`: Maximum number of user tweets to fetch (20)
  - `SAMPLE_TWEETS`: Sample size for tweet analysis (10)

- **Timeout Settings**
  - `REQUEST`: Request timeout (12000ms)
  - `ACCOUNT`: Account timeout cycle (24 hours)

- **Cache Settings**
  - `DEFAULT_EXPIRE`: Default cache expiration time (1 hour)
  - `USER_PROFILE`: User profile cache duration (1 hour)
  - `SHORT_EXPIRE`: Short-term cache duration (5 minutes)
  - `SINGLE_TWEET`: Single tweet cache duration (1 week)

- **GPT API Configuration**
  - `API_URL`: API endpoint URL
  - `API_KEY`: API key
  - `MODEL`: Model name to use

## Main Dependencies

- express
- mongoose (not required for testing)
- redis
- axios
- agent-twitter-client

## API Endpoints

- `GET /api/token/info/:address` - Get token information
- `GET /api/twitter/search/stream` - Search Twitter data stream
- `GET /api/pump/dev-tokens/:creator` - Get developer token list

## Running Analysis Service Tests
- `cd backend/test`
- `npm install`
- `node analysisService.js`

## Running Frontend Development Server
- `cd frontend`
- `npm install`
- `npm run dev`

## Running Server (Docker Deployment)
### Build and Start Services
- `docker-compose -f docker-compose.tweet-scheduler.yml up -d --build`

### Stop Services
- `docker-compose -f docker-compose.tweet-scheduler.yml down`


