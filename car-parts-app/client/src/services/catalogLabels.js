const categoryLabels = {
  All: "ყველა",
  Engine: "ძრავი",
  Body: "კუზაო",
  Interior: "ინტერიერი",
};

const conditionLabels = {
  New: "ახალი",
  Used: "მეორადი",
  Refurbished: "აღდგენილი",
};

export const translateCategory = (category = "") =>
  categoryLabels[category] || category;

export const translateCondition = (condition = "") =>
  conditionLabels[condition] || condition;
