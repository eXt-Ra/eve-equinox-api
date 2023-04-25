//write the character route here and export it
import { Router } from 'express';
import { getCharacter } from '../../controllers/character/getCharacter';
import { searchCharacter } from '../../controllers/character/searchCharacter';

const router = Router();

router.get('/:id', getCharacter);
router.get('/search/:search', searchCharacter);
router.get('/search', (req, res) => {
  return res.status(404).json({ message: 'Not found' });
});

// Wildcard route for unmatched paths
router.use((req, res) => {
  if (req.path.startsWith('/search')) {
    return res.status(404).json({ message: 'Not found' });
  }
  return res.status(404).json({ message: 'Not found' });
});


export default router;