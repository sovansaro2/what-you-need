import { supabase } from '@/lib/supabase';

const BUCKET_NAME = 'business-assets';

export const storageService = {
  /**
   * Uploads business logo image to Supabase Storage inside bucket `business-assets/{userId}/logo/`
   * Returns the public URL of the uploaded asset.
   */
  async uploadBusinessLogo(userId: string, file: File): Promise<string> {
    if (!file) {
      throw new Error('សូមជ្រើសរើសរូបភាពដើម្បីអាប់ឡូត');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('ប្រភេទឯកសារមិនត្រឹមត្រូវ! សូមជ្រើសរើសរូបភាព (PNG, JPG, WEBP, SVG)');
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('ទំហំរូបភាពធំពេក! សូមជ្រើសរើសរូបភាពតូចជាង 5MB');
    }

    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/logo/${Date.now()}_${sanitizedFileName}`;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.warn('Supabase storage upload returned error, attempting fallback:', error.message);
        // Fallback to base64 Data URL if bucket does not exist or lacks upload policy
        return await this.fileToDataUrl(file);
      }

      if (data?.path) {
        const { data: publicData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      }
    } catch (err: any) {
      console.warn('Supabase storage upload exception:', err);
    }

    // Fallback if storage fails or bucket is not provisioned
    return await this.fileToDataUrl(file);
  },

  /**
   * Converts a File object to base64 Data URL as reliable local fallback
   */
  fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Attempts to delete a logo file from storage
   */
  async deleteBusinessLogo(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return !error;
    } catch {
      return false;
    }
  },
};
