exports.paginationResObj = function (page, totalPages, totalDataCount, data) {
  // Check if page, totalPages, and totalDataCount are numbers
  if (
    typeof page !== "number" ||
    typeof totalPages !== "number" ||
    typeof totalDataCount !== "number"
  ) {
    throw new Error(
      "Invalid pagination parameters. Please provide valid numbers for page, totalPages, and totalDataCount."
    );
  }

  // Check if data is an array
  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid data parameter. Please provide an array for data."
    );
  }

  // Return the result object with default values if necessary
  return {
    currentPage: page,
    totalPageCount: totalPages,
    totalDataCount: totalDataCount,
    data: data ? data : [],
  };
};
