import { Router } from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import { getOwnRooms, createRoom, browseRooms } from "../controllers/roomsController.js";

const router = Router();

router.use(checkAuth);

router.route('/')
  .get(getOwnRooms)
  .post(createRoom)
  

router.get('/browse', browseRooms)


export default router;
