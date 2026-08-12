const fs = require("fs");

// ===============================
// YOUR INPUT ARRAY
// ===============================
const inputArray = [
  "apple",
  "banana",
  "apple",
  "orange",
  "banana",
  "apple",
  "mango",
  "orange",
  "grapes"
];

// ===============================
// FIND UNIQUE STRINGS
// ===============================
const uniqueStrings = [...new Set(inputArray)];

// ===============================
// COUNTS
// ===============================
const totalCount = inputArray.length;
const uniqueCount = uniqueStrings.length;
const duplicateCount = totalCount - uniqueCount;

// ===============================
// OUTPUT
// ===============================
console.log("=================================");
console.log("Total strings   :", totalCount);
console.log("Unique strings  :", uniqueCount);
console.log("Duplicates      :", duplicateCount);
console.log("=================================");

console.log("\nUnique Strings:");
console.log(uniqueStrings);

// ===============================
// CREATE TXT FILE
// ===============================
const output = JSON.stringify(uniqueStrings, null, 2);

fs.writeFileSync("uniqueStrings.txt", output, "utf8");

console.log("\nuniqueStrings.txt created successfully!");