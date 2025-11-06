import { v2 as cloudinary } from "cloudinary";

export async function uploadImageToCloudinary(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const res = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "image", folder: "DevEvent" },
        (error, results) => {
          if (error) return reject(error);

          resolve(results);
        }
      )
      .end(buffer);
  });
  return (res as { secure_url: string }).secure_url;
}
