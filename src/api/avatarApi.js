import { axiosInstance, handleRequest } from "./axiosInstance";

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return handleRequest(
    axiosInstance.post("/profile/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return "/images/default-avatar.webp";

  // Якщо avatarPath вже є повним URL (починається з http), повертаємо його напряму
  if (avatarPath.startsWith("http")) {
    return avatarPath;
  }

  // Інакше (якщо раптом залишились старі шляхи через uploads/) - fallback
  const cleanPath = avatarPath.replace(/^uploads\//, "");
  return `${axiosInstance.defaults.baseURL}/profile/avatar/${cleanPath}`;
};
