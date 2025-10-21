import axios from 'axios';

interface MediaUploadResponseData {
    id: string;
    url: string;
    type: 'image' | 'video';
}

interface MediaUploadResult {
    success: boolean;
    data: MediaUploadResponseData;
}

type ProgressCallback = (progress: number) => void;

export const uploadMediaToServer = async (
    file: File,
    token: string,
    onProgress: ProgressCallback
): Promise<MediaUploadResponseData> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post<MediaUploadResult>(
            'http://localhost:3000/api/project/media/upload',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            }
        );

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error( 'Server upload failed');
        }
    } catch (error) {
        throw new Error('Upload failed due to network or server error.');
    }
};