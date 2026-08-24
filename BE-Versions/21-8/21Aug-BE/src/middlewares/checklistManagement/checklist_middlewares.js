const validateRequestBodyData = async (req) => {
  const {
    departments=[],
    assignees=[],
    startDateAndTime,
    endDateAndTime,
    name,
    assetId,
  } = req;
  let errorMessage = "";
  switch (true) {
    case (departments || []).length === 0:
      errorMessage = "Please choose one or more departments.";
      break;
    case assignees.length === 0:
      errorMessage = "Please assign a user to complete the checklist";
      break;
    case !startDateAndTime || !endDateAndTime:
      errorMessage = "Please enter both start and end dates and times";
      break;
    case !name:
      errorMessage = "Please enter name.";
      break;
    case !assetId:
      errorMessage = "Please enter assetId";
      break;
    default:
      return {
        success: true,
        message: "successfully",
      };
  }
  return {
    success: false,
    message: errorMessage,
  };
};

module.exports = { validateRequestBodyData };
