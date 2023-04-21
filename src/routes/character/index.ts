//write the character route here and export it
import { Router } from 'express';
import { getCharacter } from '../../controllers/character/getCharacter';
import { searchCharacter } from '../../controllers/character/searchCharacter';

const router = Router();

router.get('/:id', getCharacter);
router.get('/search/:search', searchCharacter);

export default router;