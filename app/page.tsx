"use client";

import React, { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files?.length) return;

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("images", file));

    const response = await fetch("http://localhost:8080/api/products/bulk-upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Uploaded:", data);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Bulk Product Upload</h1>

      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
      />

      <button 
        onClick={handleUpload}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "blue",
          color: "white",
          borderRadius: 8
        }}
      >
        Upload
      </button>
    </main>
  );
}
