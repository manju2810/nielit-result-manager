const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const okExt = /\.(xlsx|xls)$/i.test(file.originalname);
  if (okExt) {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx or .xls files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadExcelFiles = upload.fields([
  { name: "o_student_reg", maxCount: 1 },
  { name: "o_yn", maxCount: 1 },
  { name: "o_result", maxCount: 1 },
  { name: "a_student_reg", maxCount: 1 },
  { name: "a_yn", maxCount: 1 },
  { name: "a_result", maxCount: 1 },
]);

module.exports = { uploadExcelFiles };