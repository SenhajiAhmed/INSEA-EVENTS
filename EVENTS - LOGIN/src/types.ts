// This file contains shared TypeScript types for the application.

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string; // Content is required for viewing and editing.
  image_path?: string; // Optional path to the featured image
  technical_specs?: string; // Optional technical specifications
  quick_info?: string; // Optional quick information/overview
  event_program?: string; // Optional event program and schedule
  created_at: string;
  updated_at: string;
  username?: string; // Optional username for the blog page view
}

// A partial type for creating/updating posts, as not all fields are needed.
export type PostData = Pick<Post, 'title' | 'content' | 'technical_specs' | 'quick_info' | 'event_program'> & { id?: number };
