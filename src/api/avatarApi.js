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
  const cleanPath = avatarPath.replace(/^uploads\//, "");
  return `${axiosInstance.defaults.baseURL}/profile/avatar/${cleanPath}`;
};
