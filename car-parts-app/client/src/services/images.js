import { SERVER_BASE_URL } from "./api";

const FILE_SIZE_LIMIT_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i;

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("არჩეული სურათის წაკითხვა ვერ მოხერხდა."));
    };

    image.src = objectUrl;
  });

export const resolveImageUrl = (imageValue) => {
  const trimmedImage =
    typeof imageValue === "string" ? imageValue.trim() : "";

  if (!trimmedImage) {
    return "";
  }

  if (
    trimmedImage.startsWith("data:") ||
    trimmedImage.startsWith("blob:") ||
    ABSOLUTE_URL_PATTERN.test(trimmedImage)
  ) {
    return trimmedImage;
  }

  if (!SERVER_BASE_URL) {
    return trimmedImage;
  }

  return new URL(trimmedImage, SERVER_BASE_URL).toString();
};

export const prepareImageUpload = async (file) => {
  if (!file) {
    return "";
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("გთხოვთ, აირჩიოთ PNG, JPG ან WEBP სურათი.");
  }

  if (file.size > FILE_SIZE_LIMIT_BYTES) {
    throw new Error("გთხოვთ, აირჩიოთ 5 მბ-ზე მცირე ზომის სურათი.");
  }

  const sourceImage = await loadImageElement(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION /
      Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight)
  );
  const canvas = document.createElement("canvas");
  const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
  const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("ამ ბრაუზერში სურათის ატვირთვა არ არის მხარდაჭერილი.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(sourceImage, 0, 0, width, height);

  return canvas.toDataURL("image/webp", 0.86);
};
