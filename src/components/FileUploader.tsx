// components/FileUploader.tsx (النسخة النهائية)

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
  maxVideoSize?: number;
  defaultImageUrl?: string | null;
  defaultImageId?: number | null;
  onRemoveImage?: () => void;
};

export default function FileUploader({
  label = "Upload File",
  onUploadSuccess,
  multiple = true,
  accept = "image/*,video/*",
  preview = true,
  uniqueId = "file-upload",
  maxVideoSize = 5,
  maxFiles = 10,
  defaultImageUrl,
  defaultImageId,
  onRemoveImage,
}: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<{ id: number; name: string; url?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewTypes, setPreviewTypes] = useState<string[]>([]); // 🔥 'image' or 'video'
  const [showDefaultImage, setShowDefaultImage] = useState(!!defaultImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 تنظيف الـ blob URLs للفيديو عند إلغاء التحميل
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  // 🔥 عند تغيير defaultImageUrl
  useEffect(() => {
    if (defaultImageUrl && !uploadedFiles.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // 🔥 التحقق من حجم الفيديو
  const validateVideoSize = (file: File): boolean => {
    if (file.type.startsWith('video/')) {
      const maxSizeInBytes = maxVideoSize * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        alert(`Video size cannot exceed ${maxVideoSize}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return false;
      }
    }
    return true;
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

    // 🔥 التحقق من حجم الفيديو لكل الملفات قبل الرفع
    for (const file of files) {
      if (!validateVideoSize(file)) {
        return;
      }
    }

    setLoading(true);

    // 🔥 معاينة الصور والفيديو قبل الرفع
    if (preview) {
      const newPreviewUrls: string[] = [];
      const newPreviewTypes: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviewUrls[i] = e.target?.result as string;
            newPreviewTypes[i] = 'image';
            setPreviewUrls([...newPreviewUrls]);
            setPreviewTypes([...newPreviewTypes]);
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          // 🔥 للفيديو: نستخدم blob URL
          const videoUrl = URL.createObjectURL(file);
          newPreviewUrls[i] = videoUrl;
          newPreviewTypes[i] = 'video';
          setPreviewUrls([...newPreviewUrls]);
          setPreviewTypes([...newPreviewTypes]);
        }
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
        setShowDefaultImage(false);
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
    // 🔥 تنظيف blob URL لو كان فيديو
    if (previewTypes[index] === 'video' && previewUrls[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setPreviewTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDefaultImage = () => {
    setShowDefaultImage(false);
    if (onRemoveImage) {
      onRemoveImage();
    }
  };

  // 🔥 معرفة إذا كان default هو فيديو
  const isDefaultVideo = defaultImageUrl?.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i);

  return (
    <div className="mb-4" onClick={(e) => e.stopPropagation()}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* 🔥 عرض الملف الحالي (صورة أو فيديو) */}
      {showDefaultImage && defaultImageUrl && !uploadedFiles.length && !previewUrls.length && (
        <div className="mb-3 relative group">
          <div className="relative">
            {isDefaultVideo ? (
              <video
                src={defaultImageUrl}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                controls
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={defaultImageUrl}
                alt="Current media"
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
            )}
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
                title="Remove media"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-1 text-center">
            Current {isDefaultVideo ? 'video' : 'image'} (ID: {defaultImageId})
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
              {accept.includes("video") && accept.includes("image")
                ? "📷 Images: PNG, JPG, GIF up to 10MB | 🎥 Videos: MP4, WebM, MOV up to 5MB"
                : accept === "image/*"
                  ? "PNG, JPG, GIF up to 10MB"
                  : "PDF, DOC, DOCX up to 10MB"}
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

      {/* 🔥 معاينة الملفات الجديدة (صورة أو فيديو) */}
      {preview && previewUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              {previewTypes[index] === 'video' ? (
                <video
                  src={url}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                  controls
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                />
              )}
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