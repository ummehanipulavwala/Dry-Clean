import express from "express";
import { 
    createDeliveryPerson, 
    getAllDeliveryPersons, 
    getDeliveryPersonById, 
    updateDeliveryPerson, 
    deleteDeliveryPerson 
} from "../controllers/deliveryController.js";
import { uploadAny } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/create", uploadAny, createDeliveryPerson);
router.get("/all", getAllDeliveryPersons);
router.get("/:id", getDeliveryPersonById);
router.put("/update/:id", uploadAny, updateDeliveryPerson);
router.delete("/delete/:id", deleteDeliveryPerson);

export default router;
