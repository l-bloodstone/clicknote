import controllers from "../controllers/index.js"
import { Router } from "express"
const router = Router()

router.get("/:endpoint", controllers.getNote)

export default router
