//write the character route here and export it
import { Router } from 'express';
import { getCharacter } from '../../controllers/character/getCharacter';

const router = Router();

router.get('/:id', getCharacter);

export default router;