// API Response Validator
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function validateApiResponse<T>(
  response: Response,
  validator?: (data: any) => data is T
): Promise<T> {
  // Check if response is ok
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Parse JSON safely
  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    throw new ApiError(500, 'Invalid JSON response from server');
  }

  // Validate structure if validator provided
  if (validator && !validator(data)) {
    throw new ApiError(500, 'Invalid response structure from server');
  }

  return data as T;
}

// Type guards for common responses
export function isBlogPost(data: any): data is {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  status: 'published' | 'draft';
  createdDate: string;
  publishedDate?: string;
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.title === 'string' &&
    typeof data.slug === 'string' &&
    typeof data.content === 'string' &&
    (data.status === 'published' || data.status === 'draft')
  );
}

export function isBlogPostArray(data: any): data is { items: any[] } {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.items)
  );
}

export function isAuthResponse(data: any): data is {
  token: string;
  username: string;
  favorites: string[];
} {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.token === 'string' &&
    typeof data.username === 'string' &&
    Array.isArray(data.favorites)
  );
}
