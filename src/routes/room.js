import { Router } from "express";
import { checkAuth } from "../middlewares/checkAuth.js";
import * as roomController from "../controllers/roomController.js";

const router = Router();


router.use(checkAuth);

router.get('/invite/:roomToken', roomController.handleRoomInvitation)

router.route('/:roomId')
  .get(roomController.getRoomInfo)
  .put(roomController.leaveRoom)
  .delete(roomController.deleteRoom);

router.route('/:roomId/chat')
  .get(roomController.getRoomChat)
  .post(roomController.setRoomChat)
  
router.get('/:roomId/init', roomController.roomInit)
router.get('/:roomId/join', roomController.joinRoom)

router.put('/:roomId/config', roomController.updateRoomConfig)
router.put('/:roomId/anime', roomController.updateRoomAnime)

router.get('/:roomId/invite-token', roomController.genRoomInviteToken)



export default router;
