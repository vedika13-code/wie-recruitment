import "server-only";
import fs from "fs/promises";
import path from "path";

// Storage abstraction so the disk-backed default (below) can be swapped for an
// object-storage-backed implementation later without touching schema or callers —
// Submission.artifactUrl just stores a URL either way. Needed because the deployment
// target for this app isn't decided yet, and serverless hosts don't reliably persist
// local disk writes (see docs/ARCHITECTURE.md's open infra question).
export interface ArtifactStorage {
  save(file: File): Promise<string>; // returns a URL path to store in Submission.artifactUrl
}

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

class DiskArtifactStorage implements ArtifactStorage {
  async save(file: File): Promise<string> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${unique}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
    return `/api/recruitment/uploads/${filename}`;
  }
}

export const artifactStorage: ArtifactStorage = new DiskArtifactStorage();
export { UPLOADS_DIR };
