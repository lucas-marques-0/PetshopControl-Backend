import express from "express";
import {
  getAll,
  createItem,
  updateItem,
  deleteItem
} from "../controllers/crud.controller.js";

const router = express.Router();

// CRUD genérico para pets, tutors, services, products, appointments
router.get("/:table", getAll);
router.post("/:table", createItem);
router.put("/:table/:id", updateItem);
router.delete("/:table/:id", deleteItem);

export default router;
