export interface IStorageProvider {
  uploadThumbnail(file: File, courseId: string): Promise<string | null>;
}
