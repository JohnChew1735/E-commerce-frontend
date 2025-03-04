import { useState } from "react";

export function UploadComponents() {
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size too large");
      return;
    }

    const validType = ["image/jpeg", "image/jpg", "image/png"];
    if (!validType.includes(file.type)) {
      setError("File type is incorrect");
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ecommerce");

    try {
      const response = await fetch(
        "http://api.cloudinary.com/v1_1/dz6b6ajwi/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        setError("Error uploading image");
      }
    } catch (error) {
      console.error("Error");
      setError("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} accept="image"></input>
      {loading && <p>Uploading...</p>}
      {error && <p sytle={{ color: "red" }}>{error}</p>}
      <p></p>
      {imageUrl && <img src={imageUrl} alt="Uploaded" width="300px"></img>}
    </div>
  );
}
