export interface Folder {
  id: number;
  name: string;
  createdAt: string;
  files?: FileEntity[];
}

export interface FileEntity {
  id: number;
  name: string;
  path: string;
  uploadedAt: string;
  folderId: number | null;
}

export interface FileMutation {
  name: string;
  folderId: number;
  file: File | null;
}
