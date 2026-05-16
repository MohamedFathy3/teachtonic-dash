// components/FileUploader.tsx (المعدل)

import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, Loader2, Eye } from "lucide-react";
import api from "@/lib/api";

type Props = {
  label?: string;
  onUploadSuccess: (id: number) => void; 
  multiple?: boolean;
  accept?: string;
  preview?: boolean;
  uniqueId?: string;
  maxFiles?: number;
  defaultImageUrl?: string | null; // 🔥 الصورة الحالية
  defaultImageId?: number | null;   // 🔥 ID الصورة الحالية
  onRemoveImage?: () => void;       // 🔥 عند إزالة الصورة الحالية
};

export default function FileUploader({
  label = "Upload File",
  onUploadSuccess,
  multiple = true,
  accept = "image/*",
  preview = true,
  uniqueId = "file-upload",
  maxFiles = 10,
  defaultImageUrl,
  defaultImageId,
  onRemoveImage,
}: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<{ id: number; name: string; url?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showDefaultImage, setShowDefaultImage] = useState(!!defaultImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 عند تغيير defaultImageUrl
  useEffect(() => {
    if (defaultImageUrl && !uploadedFiles.length) {
      setShowDefaultImage(true);
    } else {
      setShowDefaultImage(false);
    }
  }, [defaultImageUrl, uploadedFiles.length]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    
    if (files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once`);
      return;
    }

    setLoading(true);

    // معاينة الصور قبل الرفع
    if (preview && accept.includes("image")) {
      const newPreviewUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviewUrls[i] = e.target?.result as string;
          setPreviewUrls([...newPreviewUrls]);
        };
        reader.readAsDataURL(files[i]);
      }
    }

    try {
      const uploadedIds: number[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/media", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const data = res.data;
        if (data?.data?.id) {
          const fileId = data.data.id;
          uploadedIds.push(fileId);
          onUploadSuccess(fileId);
          
          setUploadedFiles(prev => [...prev, {
            id: fileId,
            name: file.name,
            url: data.data.url
          }]);
        } else {
          console.error("Upload failed for file:", file.name);
        }
      }
      
      if (uploadedIds.length > 0) {
        // 🔥 اختفاء الصورة الافتراضية بعد رفع صورة جديدة
        setShowDefaultImage(false);
        console.log(`✅ ${uploadedIds.length} file(s) uploaded successfully`);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Error uploading files");
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 🔥 إزالة الصورة الحالية
  const handleRemoveDefaultImage = () => {
    setShowDefaultImage(false);
    if (onRemoveImage) {
      onRemoveImage();
    }
    onUploadSuccess(0); // إرسال 0 يعني إزالة الصورة
  };

  return (
    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 🔥 عرض الصورة الحالية */}
      {showDefaultImage && defaultImageUrl && !uploadedFiles.length && !previewUrls.length && (
        <div className="mb-3 relative group">
          <div className="relative">
            <img
              src={defaultImageUrl}
              alt="Current image"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => window.open(defaultImageUrl, '_blank')}
                className="bg-white text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                title="View full size"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemoveDefaultImage}
                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-1 text-center">
            Current image (ID: {defaultImageId})
          </p>
        </div>
      )}

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={loading}
        className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#039fb3] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="text-[#039fb3] mb-2 animate-spin" size={28} />
            <p className="text-gray-600 text-sm">Uploading...</p>
          </>
        ) : (
          <>
            <UploadCloud className="text-gray-500 mb-2" size={28} />
            <p className="text-gray-600 text-sm">Click to upload or drag & drop</p>
            <p className="text-gray-400 text-xs mt-1">
              {accept === "image/*" ? "PNG, JPG, GIF up to 10MB" : "PDF, DOC, DOCX up to 10MB"}
            </p>
            {multiple && (
              <p className="text-gray-400 text-xs">Max {maxFiles} files</p>
            )}
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
        className="hidden"
        id={uniqueId}
        multiple={multiple}
      />

      {/* معاينة الصور الجديدة */}
      {preview && previewUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && !loading && (
        <ul className="mt-2 space-y-1">
          {uploadedFiles.map((file, index) => (
            <li key={index} className="flex items-center justify-between text-green-600 text-sm bg-green-50 p-2 rounded-lg">
              <span className="flex items-center gap-2">
                <span>✓</span>
                <span className="truncate max-w-[200px]">{file.name}</span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}