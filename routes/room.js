import { Router } from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import * as roomController from "../controllers/roomController.js";

const router = Router();


router.use(checkAuth);


router.get('/invite/:roomToken', roomController.handleRoomInvitation)



router.get('/:roomId', roomController.getRoomInfo)


router.get('/:roomId/invite-token', roomController.genRoomInviteToken)

router.put('/:roomId/config', roomController.updateRoomConfig)

router.put('/:roomId/anime', roomController.updateRoomAnime)



export default router;

