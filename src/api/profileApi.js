import { axiosInstance, handleRequest } from "./axiosInstance";

export const getUserProfile = async (role, userId) => {
  return handleRequest(axiosInstance.get(`/profile/${role}/${userId}`));
};

export const updateUserProfile = async (data) => {
  return handleRequest(axiosInstance.patch("/profile/update", data));
};

export const uploadProfileDocument = async (formData) => {
  return handleRequest(
    axiosInstance.post("/profile/upload-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const getProfileDocuments = async (userId) => {
  return handleRequest(axiosInstance.get(`/profile/documents/${userId}`));
};

export const deleteProfileDocument = async (documentId) => {
  return handleRequest(
    axiosInstance.delete(`/profile/remove-document/${documentId}`)
  );
};
