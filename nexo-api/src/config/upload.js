import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads", "livros");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const livroDir = path.join(UPLOAD_DIR, String(req.params.idLivro || "temp"));
    if (!fs.existsSync(livroDir)) fs.mkdirSync(livroDir, { recursive: true });
    cb(null, livroDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de arquivo não suportado. Use JPG, PNG ou WEBP."), false);
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const UPLOAD_BASE_URL = "/uploads/livros";
export const uploadLivroDir = (idLivro) => path.join(UPLOAD_DIR, String(idLivro));
