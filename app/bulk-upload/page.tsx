"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/components/BulkUpload.module.css";
import { productService } from "@/app/service/api";
import { BulkProductInput } from "@/src/types/product";

type Row = {
  id: string;
  data: BulkProductInput;
  file?: File | null;
  preview?: string | null;
};

function makeEmptyRow(): Row {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    data: { name: "", description: "", price: 0 },
    file: null,
    preview: null,
  };
}

export default function BulkUploadPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([makeEmptyRow()]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleFile = (id: string, file?: File) => {
    if (!file) return updateRow(id, { file: null, preview: null });
    const reader = new FileReader();
    reader.onloadend = () => {
      updateRow(id, { file, preview: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addRow = () => setRows((r) => [...r, makeEmptyRow()]);
  const removeRow = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const handleUpload = async () => {
    // prepare products & files
    const products: BulkProductInput[] = [];
    const files: File[] = [];

    for (const row of rows) {
      if (!row.data.name || !row.file) continue; // skip incomplete entries
      products.push({ ...row.data });
      files.push(row.file as File);
    }

    if (products.length === 0) {
      setMessage("Add at least one product with image before uploading.");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setMessage(null);

      await productService.bulkUpload(
        { products, files },
        (percent) => {
          setProgress(percent);
        }
      );

      setMessage("Bulk upload successful");
      setRows([makeEmptyRow()]);
      setProgress(null);
      
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backButton} type="button" onClick={() => router.back()} disabled={uploading}>
              ← Back
            </button>
            <h2>Bulk Upload Products</h2>
          </div>
          <div>
            <button className={styles.addButton} type="button" onClick={addRow} disabled={uploading}>
              + Add Row
            </button>
          </div>
        </div>

        <div className={styles.smallNote}>Each row is one product — attach a single image per product.</div>

        <div className={styles.grid}>
          {rows.map((row) => (
            <div key={row.id} className={styles.card}>
              <button className={styles.removeButton} type="button" onClick={() => removeRow(row.id)}>
                ×
              </button>
              <div className={styles.preview}>
                {row.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.preview} alt="preview" />
                ) : (
                  <div className={styles.smallNote}>No image</div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(row.id, e.target.files?.[0])}
                disabled={uploading}
              />

              <input
                placeholder="Name"
                value={row.data.name}
                onChange={(e) => updateRow(row.id, { data: { ...row.data, name: e.target.value } })}
                disabled={uploading}
              />

              <textarea
                placeholder="Description"
                rows={3}
                value={row.data.description}
                onChange={(e) => updateRow(row.id, { data: { ...row.data, description: e.target.value } })}
                disabled={uploading}
              />

              <input
                type="number"
                placeholder="Price"
                value={row.data.price}
                onChange={(e) => updateRow(row.id, { data: { ...row.data, price: parseFloat(e.target.value || "0") } })}
                disabled={uploading}
                step="0.01"
                min="0"
              />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.uploadButton} type="button" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload All"}
          </button>
          {progress !== null && (
            <div className={styles.progressWrap} aria-hidden>
              <div className={styles.progressBarOuter}>
                <div className={styles.progressBarInner} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.status}>{progress}%</span>
            </div>
          )}
        </div>

        {message && <div style={{ marginTop: 12 }}>{message}</div>}
      </div>
    </div>
  );
}
