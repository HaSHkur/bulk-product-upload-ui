"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/app/service/api";
import { Product, ProductsResponse } from "@/src/types/product";
import styles from "@/app/components/ProductList.module.css";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: ProductsResponse = await productService.getProducts(currentPage, PAGE_SIZE);
        setProducts(data.data);
        setTotalPages(data.totalPages);
        setTotalProducts(data.total);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load products";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Our Products</h1>
          <p>Browse our collection of {totalProducts} products</p>
        </div>
        <Link href="/add" className={styles.addProductButton}>
          + Add New Product
        </Link>
      </div>

      {error && <div className={styles.error}>Error: {error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p>No products found.</p>
          <Link href="/add">Add the first product</Link>
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrls[0]} alt={product.name} className={styles.image} />
                  ) : (
                    <div className={styles.noImage}>No Image</div>
                  )}
                  <div className={styles.imageBadge}>{product.imageUrls?.length || 0} images</div>
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>{product.description.substring(0, 80)}...</p>
                  <div className={styles.priceSection}>
                    <span className={styles.price}>${product.price.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className={styles.paginationContainer}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              ← Previous
            </button>

            <div className={styles.pageInfo}>
              Page <span className={styles.currentPage}>{currentPage}</span> of{" "}
              <span className={styles.totalPages}>{totalPages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
