import { GitHubRepo, GitHubUser } from "../types";

const BASE_URL = "https://api.github.com";

export const fetchGithubUser = async (username: string): Promise<GitHubUser | null> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${username}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const fetchGithubRepos = async (username: string, page: number = 1): Promise<GitHubRepo[]> => {
  try {
    // Fetching 100 repos per page
    const response = await fetch(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=100&page=${page}`);
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
};

export const searchGlobalRepos = async (query: string, page: number = 1): Promise<GitHubRepo[]> => {
  try {
    // Search globally for repositories matching the query, 100 per page
    const response = await fetch(`${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=100&page=${page}`);
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error searching global repos:", error);
    return [];
  }
};

export const fetchReadme = async (owner: string, repo: string, branch: string = 'main'): Promise<string> => {
  try {
    // Try main, then master
    let response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`);
    if (!response.ok && branch === 'main') {
        response = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
    }
    
    if (!response.ok) return "";
    return await response.text();
  } catch (error) {
    console.error("Error fetching readme:", error);
    return "";
  }
};