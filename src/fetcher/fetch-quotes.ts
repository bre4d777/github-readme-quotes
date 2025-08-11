import axios from 'axios';

interface ApiQuoteData {
  _id: string;
  character: string;
  show: string;
  quote: string;
}

interface ParsedQuote {
  quote: string;
  author: string;
}

const parseData = (data: ApiQuoteData): ParsedQuote => {
  return {
    quote: data.quote,
    author: data.character
  };
};

// Get a random quote from the array
const getRandomQuote = (data: ApiQuoteData[]): ApiQuoteData => {
  // Filter out invalid entries
  const validQuotes = data.filter(quote => 
    quote && 
    typeof quote.quote === 'string' && 
    quote.quote.trim().length > 0 &&
    typeof quote.character === 'string' &&
    typeof quote.show === 'string'
  );
  
  // If no valid quotes exist, throw an error
  if (validQuotes.length === 0) {
    throw new Error('No valid quotes found in the data.');
  }
  
  // Get a random quote
  const randomIndex = Math.floor(Math.random() * validQuotes.length);
  let randomQuote = validQuotes[randomIndex];
  
  // If quote is too long (over 220 characters), try to find a shorter one
  // But limit attempts to avoid infinite recursion
  let attempts = 0;
  const maxAttempts = 10;
  
  while (randomQuote.quote.length > 220 && attempts < maxAttempts) {
    const shorterQuotes = validQuotes.filter(q => q.quote.length <= 220);
    if (shorterQuotes.length > 0) {
      randomQuote = shorterQuotes[Math.floor(Math.random() * shorterQuotes.length)];
      break;
    }
    attempts++;
    // If no shorter quotes available, just use a random one
    randomQuote = validQuotes[Math.floor(Math.random() * validQuotes.length)];
  }
  
  return randomQuote;
};

export async function fetchQuotes(): Promise<ParsedQuote> {
  try {
    const response = await axios.get<ApiQuoteData[]>(
      'https://yurippe.vercel.app/api/quotes'
    );
    
    const data: ApiQuoteData[] = response.data;
    
    // Validate the fetched data
    if (!Array.isArray(data)) {
      throw new Error('Fetched data is not an array.');
    }
    
    if (data.length === 0) {
      throw new Error('No quotes available from the API.');
    }
    
    // Get a random quote
    const randomQuote = getRandomQuote(data);
    
    // Parse the data and return it
    return parseData(randomQuote);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch quotes: ${error.message}`);
    }
    throw error;
  }
}
