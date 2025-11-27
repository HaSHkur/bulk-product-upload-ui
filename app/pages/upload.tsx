import dynamic from "next/dynamic";
import UploadForm from "../components/UploadForm";

export default function UploadPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Product Bulk Upload</h1>
      <UploadForm />
    </div>
  );
}
