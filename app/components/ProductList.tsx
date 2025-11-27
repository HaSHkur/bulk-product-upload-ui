import React, { useEffect, useState } from "react";
import api from "../service/api";

type Product = {
  productId: string;
  name?: string;
  imageUrl: string;
  createdAt?: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchProducts(page);
  }, [page]);

  async function fetchProducts(p: number) {
    try {
      const res = await api.get(`/products?page=${p}&size=${size}`);
      // adapt to your backend response shape
      setProducts(res.data.items || res.data);
      setTotal(res.data.total || null);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.productId}>
              <td>{p.productId}</td>
              <td>{p.name || "-"}</td>
              <td>
                <a href={p.imageUrl} target="_blank" rel="noreferrer">
                  View
                </a>
              </td>
              <td>{p.createdAt || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setPage((s) => Math.max(0, s - 1))} disabled={page === 0}>
          Prev
        </button>
        <span style={{ margin: "0 8px" }}>Page {page + 1}</span>
        <button onClick={() => setPage((s) => s + 1)} disabled={products.length < size}>
          Next
        </button>
      </div>
    </div>
  );
}
