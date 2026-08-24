async function generateVersionNumber(number) {
  if (typeof number !== 'number' || isNaN(number)) {
    throw new Error("Input must be a valid number");
  }

  // Increment the number
  const version = number + 1;

  // Convert to string and pad with leading zeros to maintain length
  const versionString = version.toString().padStart(5, '0'); // Change '5' to the desired length if needed
  console.log("version", versionString);
  return versionString;
}

  module.exports = {
    generateVersionNumber
  }