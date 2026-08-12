/**
 * Types mirroring the Instagram profile dump in `public/data/profiles.json`.
 * The file maps `username -> Profile`.
 */

export interface Comment {
  commenter: string;
  text: string;
  likes: number;
  timestamp: string;
}

export interface Post {
  post_id: string;
  url: string;
  post_type: "GraphImage" | "GraphVideo" | "GraphSidecar" | string;
  caption: string | null;
  likes: number;
  comments_count: number;
  video_view_count: number | null;
  is_video: boolean;
  timestamp: string;
  location: string | null;
  hashtags: string[];
  mentioned_users: string[];
  tagged_users: string[];
  accessibility_caption: string | null;
  comments: Comment[];
}

export interface Profile {
  username: string;
  full_name: string;
  biography: string | null;
  external_url: string | null;
  followers: number;
  following: number;
  total_posts: number;
  is_verified: boolean;
  is_private: boolean;
  is_business: boolean;
  profile_pic_url: string | null;
  posts: Post[];
}

export type ProfileMap = Record<string, Profile>;
