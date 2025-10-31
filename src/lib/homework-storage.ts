/**
 * @fileOverview Supabase Storage integration for homework image persistence
 * 
 * Stores homework images uploaded by students for later retrieval and analysis.
 */

import { supabase } from "@/lib/supabase-client";
import { createClient } from "@/lib/supabase-server";
import { logger } from "@/lib/logger";

const HOMEWORK_BUCKET = "homework-uploads";

/**
 * Upload homework image to Supabase Storage
 * @param imageDataUri - Base64 data URI of the image
 * @param userId - User ID to associate with the upload
 * @param subject - Subject of the homework (for organization)
 * @returns Public URL of the uploaded image or null if failed
 */
export async function uploadHomeworkImage(
  imageDataUri: string,
  userId: string,
  subject?: string
): Promise<string | null> {
  try {
    // Convert data URI to blob
    const base64Data = imageDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data URI format');
    }
    const mimeType = imageDataUri.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${userId}/${subject || 'homework'}/${timestamp}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(HOMEWORK_BUCKET)
      .upload(fileName, bytes, {
        contentType: mimeType,
        upsert: false,
      });
    
    if (error) {
      logger.error('Homework image upload failed', new Error(error.message), {
        userId,
        subject,
        fileName,
      });
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(HOMEWORK_BUCKET)
      .getPublicUrl(fileName);
    
    logger.info('Homework image uploaded successfully', {
      userId,
      subject,
      fileName,
      url: urlData.publicUrl,
    });
    
    return urlData.publicUrl;
  } catch (error) {
    logger.error('Homework image upload error', error instanceof Error ? error : new Error(String(error)), {
      userId,
      subject,
    });
    return null;
  }
}

/**
 * Upload homework image from server-side (for API routes)
 */
export async function uploadHomeworkImageServer(
  imageDataUri: string,
  userId: string,
  subject?: string
): Promise<string | null> {
  try {
    const supabaseServer = await createClient();
    
    // Convert data URI to blob
    const base64Data = imageDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid image data URI format');
    }
    const mimeType = imageDataUri.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = mimeType.includes('png') ? 'png' : 'jpg';
    const fileName = `${userId}/${subject || 'homework'}/${timestamp}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from(HOMEWORK_BUCKET)
      .upload(fileName, bytes, {
        contentType: mimeType,
        upsert: false,
      });
    
    if (error) {
      logger.error('Homework image upload failed (server)', new Error(error.message), {
        userId,
        subject,
        fileName,
      });
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabaseServer.storage
      .from(HOMEWORK_BUCKET)
      .getPublicUrl(fileName);
    
    logger.info('Homework image uploaded successfully (server)', {
      userId,
      subject,
      fileName,
      url: urlData.publicUrl,
    });
    
    return urlData.publicUrl;
  } catch (error) {
    logger.error('Homework image upload error (server)', error instanceof Error ? error : new Error(String(error)), {
      userId,
      subject,
    });
    return null;
  }
}

/**
 * Delete homework image from storage
 */
export async function deleteHomeworkImage(fileUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts.slice(urlParts.indexOf(HOMEWORK_BUCKET) + 1).join('/');
    
    const { error } = await supabase.storage
      .from(HOMEWORK_BUCKET)
      .remove([fileName]);
    
    if (error) {
      logger.error('Homework image deletion failed', new Error(error.message), { fileUrl, fileName });
      return false;
    }
    
    logger.info('Homework image deleted', { fileUrl, fileName });
    return true;
  } catch (error) {
    logger.error('Homework image deletion error', error instanceof Error ? error : new Error(String(error)), {
      fileUrl,
    });
    return false;
  }
}

