export async function uploadFile(file: File, setProgress?: (progress: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const cloudName = 'ddurn2o7h'; // from Cloudinary Dashboard
      const uploadPreset = 'NeuroHub'; // from step 2
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
  
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && setProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setProgress(progress);
        }
      };
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url as string); // this is the file's public URL
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };
  
      xhr.onerror = () => reject(new Error("Upload error occurred"));
  
      xhr.send(formData);
    });
  }
  