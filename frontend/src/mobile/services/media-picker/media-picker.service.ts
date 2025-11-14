import { Injectable } from '@angular/core';
import { FilePicker, PickedFile, PickMediaResult } from '@capawesome/capacitor-file-picker';

export interface MediaFile {
  path: string;
  webPath: string;
  name: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  modifiedAt?: number;
}

export interface PermissionStatus {
  granted: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaPickerService {
  constructor() {}

  /**
   * Check if storage permissions are granted
   */
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      const status = await FilePicker.checkPermissions();
      const granted = status.readExternalStorage === 'granted';

      return {
        granted,
        message: granted ? undefined : 'Storage permission not granted',
      };
    } catch (error) {
      return {
        granted: false,
        message: error instanceof Error ? error.message : 'Error checking permissions',
      };
    }
  }

  /**
   * Request storage permissions from the user
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      const result = await FilePicker.requestPermissions();
      const granted = result.readExternalStorage === 'granted';

      return {
        granted,
        message: granted ? undefined : 'Storage permission denied by user',
      };
    } catch (error) {
      return {
        granted: false,
        message: error instanceof Error ? error.message : 'Error requesting permissions',
      };
    }
  }

  /**
   * Pick images and videos from device gallery
   * @param multiple - Allow multiple file selection (default: true)
   * @returns Array of selected media files
   */
  async pickMedia(multiple = true): Promise<MediaFile[]> {
    const hasPermission = await this.ensurePermissions();
    if (!hasPermission) {
      throw new Error('Storage permission not granted');
    }

    try {
      const result: PickMediaResult = await FilePicker.pickMedia({
        limit: multiple ? 0 : 1,
      });

      return result.files.map((file: PickedFile) => this.convertPickedFileToMediaFile(file));
    } catch (error) {
      if (error instanceof Error && error.message.includes('User cancelled')) {
        // User cancelled the picker, return empty array
        return [];
      }
      throw error;
    }
  }

  /**
   * Get a web-usable URL for displaying media preview
   * @param file - Media file to get preview for
   */
  getFilePreview(file: MediaFile): string {
    return file.webPath;
  }

  /**
   * Format file size to human-readable string
   * @param bytes - File size in bytes
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if file is an image
   */
  isImage(file: MediaFile): boolean {
    return file.mimeType.startsWith('image/');
  }

  /**
   * Check if file is a video
   */
  isVideo(file: MediaFile): boolean {
    return file.mimeType.startsWith('video/');
  }

  /**
   * Ensure storage permissions are granted, request if not
   */
  private async ensurePermissions(): Promise<boolean> {
    const check = await this.checkPermissions();
    if (!check.granted) {
      const request = await this.requestPermissions();
      return request.granted;
    }
    return true;
  }

  /**
   * Convert PickedFile from plugin to MediaFile interface
   */
  private convertPickedFileToMediaFile(file: PickedFile): MediaFile {
    // Convert path to web-usable URL (file:// protocol)
    const webPath = file.path?.startsWith('file://') ? file.path : `file://${file.path}`;

    return {
      path: file.path || '',
      webPath,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      width: file.width,
      height: file.height,
      duration: file.duration,
      modifiedAt: file.modifiedAt,
    };
  }
}
