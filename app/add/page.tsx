"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { productService } from "@/app/service/api";
import styles from "@/app/components/AddProduct.module.css";

export default function AddProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);

    // Create previews for new images
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Product name is required" });
      return;
    }
    if (!formData.description.trim()) {
      setMessage({ type: "error", text: "Description is required" });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage({ type: "error", text: "Price must be greater than 0" });
      return;
    }
    if (images.length === 0) {
      setMessage({ type: "error", text: "At least one image is required" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setUploadProgress(0);

      const result = await productService.createProduct(
        {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          images,
        },
        (percent) => {
          setUploadProgress(percent);
        }
      );

      setMessage({ type: "success", text: `Product added successfully!` });
      setFormData({ name: "", description: "", price: "" });
      setImages([]);
      setImagePreviews([]);
      setUploadProgress(null);
      
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Failed to add product";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Add New Product</h1>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter product price"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="images">Upload Images * ({images.length} selected)</label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              disabled={loading}
              className={styles.fileInput}
            />
            <p className={styles.helpText}>Select one or more images for the product</p>
          </div>

          {imagePreviews.length > 0 && (
            <div className={styles.previewContainer}>
              <h3>Image Previews</h3>
              <div className={styles.previewGrid}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.previewItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    {uploadProgress !== null && (
                      <div className={styles.uploadOverlay} aria-hidden>
                        <div className={styles.progressBarContainer}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className={styles.progressPercent}>{uploadProgress}%</div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={loading}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Adding Product..." : "Add Product"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
