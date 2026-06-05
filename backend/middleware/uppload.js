const multer = require("multer");

// Store files in memory — no disk write needed
const storage = multer.memoryStorage();

// Accept only .xlsx files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Expect 4 files with these field names
const uploadExcelFiles = upload.fields([
  { name: "o_yn", maxCount: 1 },
  { name: "o_result", maxCount: 1 },
  { name: "a_yn", maxCount: 1 },
  { name: "a_result", maxCount: 1 },
]);

module.exports = { uploadExcelFiles };