import React, { useState } from "react";
import api from "../service/api";
import { AxiosError, AxiosProgressEvent } from 'axios';

export default function UploadForm() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files);
  }

  async function handleUpload() {
    if (!files || files.length === 0) return setMessage("Select files first.");
    setLoading(true);
    setProgress(0);
    setMessage("");

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
    await api.post("/products/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e: AxiosProgressEvent) => {
        if (!e.total) return;
        const percent = Math.round((e.loaded * 100) / e.total);
        setProgress(percent);
        },
    });

    setMessage("Upload completed.");
    } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(error);

    setMessage("Upload failed: " + (error.response?.data || error.message));
    } finally {
    setLoading(false);
    setTimeout(() => setProgress(0), 1000);
    }
}

  return (
    <div>
      <h2>Upload Products (images)</h2>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      <div style={{ width: 300, marginTop: 12, border: "1px solid #ddd" }}>
        <div
          style={{
            width: `${progress}%`,
            height: 12,
            background: "#4caf50",
            transition: "width 200ms",
          }}
        />
      </div>
      <div style={{ marginTop: 8 }}>{progress}%</div>
      <div style={{ marginTop: 8 }}>{message}</div>
    </div>
  );
}
