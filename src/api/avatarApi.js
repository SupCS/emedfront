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

  console.log("🔍 Отримано шлях аватара:", avatarPath);

  const cleanPath = avatarPath.replace(/^uploads\//, "");

  console.log("📂 Очищений шлях:", cleanPath);

  return `${axiosInstance.defaults.baseURL}/profile/avatar/${cleanPath}`;
};
