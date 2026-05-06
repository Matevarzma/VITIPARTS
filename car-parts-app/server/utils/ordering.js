const mongoose = require("mongoose");

const ensureSortOrder = async (Model, filter = {}, fallbackSort = {}) => {
  const existingDocuments = await Model.find(filter).select("_id sortOrder").lean();

  if (
    existingDocuments.every(
      (document) =>
        Number.isInteger(document.sortOrder) && document.sortOrder >= 0
    )
  ) {
    return;
  }

  const documents = await Model.find(filter)
    .sort(fallbackSort)
    .select("_id sortOrder")
    .lean();

  await Model.bulkWrite(
    documents.map((document, index) => ({
      updateOne: {
        filter: { _id: document._id },
        update: {
          $set: { sortOrder: index },
        },
      },
    }))
  );
};

const getNextSortOrder = async (Model, filter = {}) => {
  const lastDocument = await Model.findOne(filter)
    .sort({ sortOrder: -1, _id: -1 })
    .select("sortOrder")
    .lean();

  return Number.isInteger(lastDocument?.sortOrder)
    ? lastDocument.sortOrder + 1
    : 0;
};

const reorderDocuments = async (Model, orderedIds, filter = {}) => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    const error = new Error("Ordered IDs array is required.");
    error.statusCode = 400;
    throw error;
  }

  const normalizedIds = orderedIds.map(String);
  const uniqueIds = new Set(normalizedIds);

  if (
    uniqueIds.size !== normalizedIds.length ||
    normalizedIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
  ) {
    const error = new Error("Invalid ordered IDs.");
    error.statusCode = 400;
    throw error;
  }

  const matchingDocuments = await Model.find({
    ...filter,
    _id: { $in: normalizedIds },
  })
    .select("_id")
    .lean();

  if (matchingDocuments.length !== normalizedIds.length) {
    const error = new Error("Some items could not be found.");
    error.statusCode = 404;
    throw error;
  }

  await Model.bulkWrite(
    normalizedIds.map((id, index) => ({
      updateOne: {
        filter: { ...filter, _id: id },
        update: {
          $set: { sortOrder: index },
        },
      },
    }))
  );
};

module.exports = {
  ensureSortOrder,
  getNextSortOrder,
  reorderDocuments,
};
