import type { RepoData } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') {
      return null;
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] };
    }
    return null;
  } catch (error) {
    return null;
  }
};

const fetchGitHubApi = async (endpoint: string) => {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const fetchFileContent = async (owner: string, repo: string, path: string): Promise<string | null> => {
    try {
        const fileData = await fetchGitHubApi(`/repos/${owner}/${repo}/contents/${path}`);
        if (fileData.content && fileData.encoding === 'base64') {
            // Use atob to decode base64 content in the browser
            return atob(fileData.content);
        }
        return null;
    } catch (error) {
        console.warn(`Could not fetch content for ${path}:`, error);
        return null;
    }
};

const parseDependencies = async (owner: string, repo: string, filePaths: string[]): Promise<string[]> => {
    const dependencyFileParsers: { [key: string]: (content: string) => string[] } = {
        'package.json': (content) => {
            try {
                const json = JSON.parse(content);
                const deps = { ...(json.dependencies || {}), ...(json.devDependencies || {}) };
                return Object.keys(deps);
            } catch {
                return [];
            }
        },
        'requirements.txt': (content) => {
            return content.split('\n')
                .map(line => line.split(/==|>=|<=|>|</)[0].trim())
                .filter(line => line && !line.startsWith('#'));
        },
    };

    const detectedDependencies: Set<string> = new Set();
    const filesToParse = filePaths.filter(path => 
        Object.keys(dependencyFileParsers).some(name => path.endsWith(name))
    );
    
    for (const path of filesToParse) {
        const content = await fetchFileContent(owner, repo, path);
        if (content) {
            const fileName = path.split('/').pop();
            if (fileName && dependencyFileParsers[fileName]) {
                const deps = dependencyFileParsers[fileName](content);
                deps.forEach(dep => detectedDependencies.add(dep));
            }
        }
    }

    return Array.from(detectedDependencies);
};


export const getRepoData = async (repoUrl: string): Promise<RepoData> => {
  const repoParts = parseRepoUrl(repoUrl);
  if (!repoParts) {
    throw new Error('Invalid GitHub repository URL.');
  }
  const { owner, repo } = repoParts;

  try {
    // 1. Get repo details to find the default branch
    const repoDetails = await fetchGitHubApi(`/repos/${owner}/${repo}`);
    const defaultBranch = repoDetails.default_branch;

    // 2. Get languages
    const languages = await fetchGitHubApi(`/repos/${owner}/${repo}/languages`);
    
    // 3. Get file tree, including directories for better context
    const treeData = await fetchGitHubApi(`/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
    const filePaths = treeData.tree.map((item: any) => {
      // Append a slash to directories to distinguish them from files
      return item.type === 'tree' ? `${item.path}/` : item.path;
    });

    // 4. Find and parse dependency files from the list of all paths
    const dependencies = await parseDependencies(owner, repo, filePaths);

    return {
      languages,
      tree: filePaths,
      dependencies,
    };

  } catch (error: any) {
    console.error("Error fetching GitHub data:", error);
    if (error.message.includes('404')) {
        throw new Error('Repository not found. Please check the URL.');
    }
    throw new Error(`Failed to fetch data from GitHub: ${error.message}`);
  }
};