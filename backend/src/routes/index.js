import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getHealth, getStatus } from "../controllers/healthController.js";
import { analyze } from "../controllers/aiController.js";
import { getDocument, prepareDocument, uploadDocument, verifyDocument } from "../controllers/documentController.js";
import { updateUserRegistration } from "../controllers/adminController.js";
import { getRecords, storeRecord } from "../controllers/recordController.js";
import { adminMiddleware } from "../middleware/admin.js";
import { rejectDocument } from "../controllers/documentController.js";
import { documents } from "../data/documents.js";

export const apiRouter = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

apiRouter.get("/health", asyncHandler(getHealth));
apiRouter.get("/status", asyncHandler(getStatus));
apiRouter.post("/store", asyncHandler(storeRecord));
apiRouter.get("/records", asyncHandler(getRecords));
apiRouter.post("/ai/analyze", asyncHandler(analyze));
apiRouter.post("/documents/prepare", asyncHandler(prepareDocument));
apiRouter.get("/documents/:documentHash", adminMiddleware, asyncHandler(getDocument));
apiRouter.post("/documents/verify", adminMiddleware, asyncHandler(verifyDocument));
apiRouter.post("/admin/users/registration", adminMiddleware, asyncHandler(updateUserRegistration));
apiRouter.post("/documents/upload", upload.single("file"), asyncHandler(uploadDocument));
apiRouter.post("/documents/reject", adminMiddleware, asyncHandler(rejectDocument));
apiRouter.get("/documents", adminMiddleware, asyncHandler(async (req, res) => {
  res.json(documents);
}));