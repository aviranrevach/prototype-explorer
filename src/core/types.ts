export interface ProtoExplorerConfig {
  version: string;
  projectName: string;
  trackedPaths: string[];
  defaultAuthor: string;
}

export interface Prototype {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface VersionGroup {
  id: string;
  prototypeId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrototypeVersion {
  id: string;
  prototypeId: string;
  groupId: string;
  category: string;
  name: string;
  description?: string;
  tags: string[];
  starred: boolean;
  notes?: string;
  author: string;
  timestamp: string;
  fileCount: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreatePrototypeRequest {
  name: string;
  description?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface CreateVersionRequest {
  name: string;
  groupId: string;
  category?: string;
  description?: string;
  tags?: string[];
  author?: string;
}

export interface UpdateVersionRequest {
  tags?: string[];
  starred?: boolean;
  notes?: string;
  description?: string;
  category?: string;
}
