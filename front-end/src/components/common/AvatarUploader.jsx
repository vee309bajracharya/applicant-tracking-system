import { useRef, useState } from "react";
import { Pencil, User } from "lucide-react";
import { buildStorageUrl } from "../../utils/buildStorageUrl";

const MAX_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const AvatarUploader = ({ photoPath, onSelect, isUploading }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const src = preview || buildStorageUrl(photoPath);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      alert("Image must be under 2MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    onSelect(file);
  };

  return (
    <div className="relative w-32 h-32 shrink-0">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-hover flex items-center justify-center border border-gray-200 dark:border-dark-box-outline">
        {src ? (
          <img src={src} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User size={40} className="text-gray-400" aria-hidden="true" />
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Change profile photo"
        className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary-blue text-white flex items-center justify-center shadow-md hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Pencil size={14} />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        aria-label="Upload profile photo"
      />
    </div>
  );
};

export default AvatarUploader;
