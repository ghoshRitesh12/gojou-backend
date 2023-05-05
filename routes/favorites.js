import { Router } from 'express';
import { checkAuth } from '../middlewares/checkAuth.js';
import { 
  addFavoriteAnime, getAllFavoriteAnime, 
  isFavoriteAnime, removeFavoriteAnime 
} from '../controllers/favoritesController.js';

const router = Router();

router.use(checkAuth)

router.route('/')
  .post(addFavoriteAnime)
  .get(getAllFavoriteAnime)

router.route('/:animeId')
  .get(isFavoriteAnime)
  .delete(removeFavoriteAnime)


export default router;
