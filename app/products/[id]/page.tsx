"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { productService } from "@/app/service/api";
import { Product } from "@/src/types/product";
import styles from "@/app/components/ProductDetail.module.css";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(productId);
        setProduct(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load product";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Product Not Found</h2>
          <p>{error || "The product you are looking for does not exist."}</p>
          <Link href="/" className={styles.backLink}>
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = product.imageUrls[currentImageIndex];

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        ← Back to Products
      </Link>

      <div className={styles.productContainer}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            {currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentImage} alt={product.name} className={styles.mainImage} />
            ) : (
              <div className={styles.noImage}>No image available</div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.imageUrls.length > 1 && (
            <div className={styles.thumbnailGallery}>
              {product.imageUrls.map((imageUrl, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className={styles.detailsSection}>
          <h1 className={styles.productName}>{product.name}</h1>

          <div className={styles.priceSection}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
          </div>

          <div className={styles.descriptionSection}>
            <h3>Description</h3>
            <p className={styles.description}>{product.description}</p>
          </div>

          <div className={styles.productMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Product ID:</span>
              <span className={styles.metaValue}>{product.id}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Images:</span>
              <span className={styles.metaValue}>{product.imageUrls.length}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.addToCartButton} onClick={() => alert("Add to cart functionality coming soon!")}>
              Add to Cart
            </button>
            <button className={styles.contactButton} onClick={() => alert("Contact seller coming soon!")}>
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
