import React, { useEffect, useState, useRef } from "react";
import api from "../utils/api";

type VerificationStatus = "unsubmitted" | "pending_review" | "approved" | "rejected";

interface StatusInfo {
  verificationStatus: VerificationStatus;
  verificationNotes: string | null;
  submittedAt: string | null;
}

const STATUS_UI: Record<VerificationStatus, { label: string; color: string; description: string }> = {
  unsubmitted: {
    label: "Not started",
    color: "bg-gray-100 text-gray-600",
    description: "Fill in the form below and submit your documents to begin the verification process.",
  },
  pending_review: {
    label: "Under review",
    color: "bg-yellow-100 text-yellow-700",
    description: "Your documents have been submitted and are being reviewed by Astercart. You'll be notified by email when a decision is made. This usually takes 1–2 business days.",
  },
  approved: {
    label: "Verified ✓",
    color: "bg-green-100 text-green-700",
    description: "Your store is verified. You can now add products and import inventory.",
  },
  rejected: {
    label: "Not approved",
    color: "bg-red-100 text-red-700",
    description: "Your verification was not approved. Please read the feedback below, make the necessary corrections, and resubmit.",
  },
};

const Verification: React.FC = () => {
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    cacNumber: "", businessEmail: "", businessPhone: "",
    exactAddress: "", landmark: "",
    cacCertificateUrl: "", ownerIdDocumentUrl: "",
    storePhotoUrls: [] as string[],
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const cacInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<StatusInfo>("/store/verification/status");
        setStatusInfo(data);
      } catch {
        setStatusInfo({ verificationStatus: "unsubmitted", verificationNotes: null, submittedAt: null });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const uploadFile = async (file: File, field: string): Promise<string | null> => {
    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post<{ url: string }>("/upload/product-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.url;
    } catch {
      setError(`Failed to upload ${field}. Please try again.`);
      return null;
    } finally {
      setUploadingField(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "cac" | "id" | "photos") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (field === "photos") {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 3)) {
        const url = await uploadFile(file, "store photo");
        if (url) urls.push(url);
      }
      setForm(prev => ({ ...prev, storePhotoUrls: urls }));
    } else {
      const url = await uploadFile(files[0], field === "cac" ? "CAC certificate" : "ID document");
      if (url) {
        setForm(prev => ({
          ...prev,
          [field === "cac" ? "cacCertificateUrl" : "ownerIdDocumentUrl"]: url,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.cacNumber || !form.businessEmail || !form.businessPhone || !form.exactAddress) {
      setError("CAC number, business email, phone, and address are all required.");
      return;
    }
    if (!form.cacCertificateUrl) {
      setError("Please upload your CAC certificate before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/store/verification/submit", form);
      setSuccess("Verification submitted successfully. We'll review your details and notify you within 1–2 business days.");
      setStatusInfo(prev => prev ? { ...prev, verificationStatus: "pending_review", submittedAt: new Date().toISOString() } : prev);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading verification status...</div>;

  const status = statusInfo?.verificationStatus || "unsubmitted";
  const ui = STATUS_UI[status];
  const canEdit = status === "unsubmitted" || status === "rejected";

  return (
    <div className="p-6 max-w-2xl font-inter">
      <h1 className="text-xl font-semibold mb-1">Store Verification</h1>
      <p className="text-sm text-gray-500 mb-6">
        Complete this once. After approval, you can add products and import your inventory.
      </p>

      {/* Current status banner */}
      <div className={`rounded-xl p-4 mb-6 ${ui.color}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{ui.label}</span>
          {statusInfo?.submittedAt && (
            <span className="text-xs opacity-70">
              · Submitted {new Date(statusInfo.submittedAt).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>
        <p className="text-xs">{ui.description}</p>
        {status === "rejected" && statusInfo?.verificationNotes && (
          <div className="mt-3 bg-white bg-opacity-60 rounded-lg p-3">
            <p className="text-xs font-semibold mb-1">Feedback from admin:</p>
            <p className="text-xs">{statusInfo.verificationNotes}</p>
          </div>
        )}
      </div>

      {status === "approved" && (
        <div className="text-center py-12 text-green-600">
          <p className="text-5xl mb-4">✓</p>
          <p className="font-semibold text-lg">Your store is verified</p>
          <p className="text-sm text-gray-500 mt-2">Head to the Inventory tab to start adding your products.</p>
        </div>
      )}

      {status === "pending_review" && (
        <div className="text-center py-12 text-yellow-600">
          <p className="text-5xl mb-4">⏳</p>
          <p className="font-semibold text-lg">Documents under review</p>
          <p className="text-sm text-gray-500 mt-2">Check back here or wait for an email notification.</p>
        </div>
      )}

      {canEdit && (
        <div className="space-y-5">
          {/* Business info */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Business details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">CAC Number *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" placeholder="e.g. RC123456"
                  value={form.cacNumber} onChange={e => setForm(p => ({ ...p, cacNumber: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Business Email *</label>
                <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" placeholder="business@email.com"
                  value={form.businessEmail} onChange={e => setForm(p => ({ ...p, businessEmail: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Business Phone *</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" placeholder="+2348012345678"
                  value={form.businessPhone} onChange={e => setForm(p => ({ ...p, businessPhone: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Nearest Landmark</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" placeholder="e.g. Near Chicken Republic, Adeola Odeku"
                  value={form.landmark} onChange={e => setForm(p => ({ ...p, landmark: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium text-gray-500 block mb-1">Exact Store Address *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pry" placeholder="Building number, street, area, LGA, state"
                value={form.exactAddress} onChange={e => setForm(p => ({ ...p, exactAddress: e.target.value }))} />
            </div>
          </div>

          {/* Document uploads */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Documents</h2>
            <div className="space-y-4">
              {/* CAC Certificate */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">CAC Certificate *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-pry transition"
                  onClick={() => cacInputRef.current?.click()}>
                  {uploadingField === "CAC certificate" ? (
                    <p className="text-xs text-gray-400">Uploading...</p>
                  ) : form.cacCertificateUrl ? (
                    <p className="text-xs text-green-600">✓ Uploaded</p>
                  ) : (
                    <p className="text-xs text-gray-400">Click to upload CAC certificate (PDF or image)</p>
                  )}
                </div>
                <input ref={cacInputRef} type="file" className="hidden" accept="image/*,.pdf"
                  onChange={e => handleFileUpload(e, "cac")} />
              </div>

              {/* Owner ID */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Owner ID Document (NIN, Passport, or Driver's Licence)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-pry transition"
                  onClick={() => idInputRef.current?.click()}>
                  {uploadingField === "ID document" ? (
                    <p className="text-xs text-gray-400">Uploading...</p>
                  ) : form.ownerIdDocumentUrl ? (
                    <p className="text-xs text-green-600">✓ Uploaded</p>
                  ) : (
                    <p className="text-xs text-gray-400">Click to upload a valid government ID</p>
                  )}
                </div>
                <input ref={idInputRef} type="file" className="hidden" accept="image/*,.pdf"
                  onChange={e => handleFileUpload(e, "id")} />
              </div>

              {/* Store photos */}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Store Photos (up to 3, so admin can see the physical store)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-pry transition"
                  onClick={() => photosInputRef.current?.click()}>
                  {uploadingField === "store photo" ? (
                    <p className="text-xs text-gray-400">Uploading...</p>
                  ) : form.storePhotoUrls.length > 0 ? (
                    <p className="text-xs text-green-600">✓ {form.storePhotoUrls.length} photo(s) uploaded</p>
                  ) : (
                    <p className="text-xs text-gray-400">Click to upload photos of your store</p>
                  )}
                </div>
                <input ref={photosInputRef} type="file" className="hidden" accept="image/*" multiple
                  onChange={e => handleFileUpload(e, "photos")} />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 rounded-lg p-3">{success}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-pry text-white rounded-xl py-3 font-semibold disabled:opacity-60"
          >
            {submitting ? "Submitting..." : status === "rejected" ? "Resubmit for review" : "Submit for review"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Once submitted, admin will review your documents and notify you. You cannot edit your submission while it's under review.
          </p>
        </div>
      )}
    </div>
  );
};

export default Verification;
