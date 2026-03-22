import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { config } from '../../config';

export interface StorageResult {
  url: string;
  fileName: string;
}

export interface StorageBackend {
  save(file: Express.Multer.File, folder: string): Promise<StorageResult>;
  delete(url: string): Promise<void>;
}

// ── Local Storage (dev/MVP) ──────────────────────────

class LocalStorage implements StorageBackend {
  private basePath: string;

  constructor() {
    this.basePath = config.STORAGE_LOCAL_PATH;
  }

  async save(file: Express.Multer.File, folder: string): Promise<StorageResult> {
    const dir = path.join(this.basePath, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const fileName = `${uuid()}${ext}`;
    const filePath = path.join(dir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${folder}/${fileName}`,
      fileName,
    };
  }

  async delete(url: string): Promise<void> {
    const filePath = path.join(this.basePath, url.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// ── S3 Storage (production — placeholder, requires aws-sdk) ──

class S3Storage implements StorageBackend {
  async save(_file: Express.Multer.File, _folder: string): Promise<StorageResult> {
    // TODO: Sprint 2 — implement with @aws-sdk/client-s3
    throw new Error('S3 storage not yet implemented. Use STORAGE_BACKEND=local for now.');
  }

  async delete(_url: string): Promise<void> {
    throw new Error('S3 storage not yet implemented.');
  }
}

// ── Factory ──────────────────────────────────────────

export function createStorageBackend(): StorageBackend {
  switch (config.STORAGE_BACKEND) {
    case 'local':
      return new LocalStorage();
    case 's3':
      return new S3Storage();
    default:
      return new LocalStorage();
  }
}

export const storage = createStorageBackend();
