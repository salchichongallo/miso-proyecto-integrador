import { v4 as uuid } from 'uuid';
import { Injectable } from '@angular/core';
import { uploadData } from 'aws-amplify/storage';
import { MEDIA_BUCKET_ALIAS } from '../../constants/storage.constant';
import { environment } from '../../../environments/environment';

export interface UploadResult {
  /**
   * Path of the uploaded file in the S3 bucket.
   *
   * @example media/xxx-xxxx-filename.ext
   */
  path: string;
  fullUrl: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  async upload(file: File): Promise<UploadResult> {
    const fileName = this.generateFileName(file);
    const task = uploadData({
      data: file,
      path: `media/${fileName}`,
      options: { bucket: MEDIA_BUCKET_ALIAS },
    });
    const item = await task.result;
    const fullUrl = `${environment.baseUrl}/${item.path}`;
    return { path: item.path, fullUrl, name: file.name };
  }

  private generateFileName(file: File) {
    return `${uuid()}-${file.name}`;
  }
}
