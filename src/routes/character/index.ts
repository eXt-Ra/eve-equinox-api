/**
 * @swagger
 * tags:
 *   name: Character
 *   description: Endpoints for character data
 */


import { Router } from 'express';
import { getCharacter } from '../../controllers/character/getCharacter';
import { searchCharacter } from '../../controllers/character/searchCharacter';
import { getCharacterSkillQueue } from '../../controllers/character/getCharacterSkillQueue';

const router = Router();

/**
 * @swagger
 * /character/{id}:
 *   get:
 *     summary: Retrieve a character by ID
 *     description: Retrieve a specific character by providing the character's ID
 *     tags:
 *       - Character
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The character's ID
 *     responses:
 *       200:
 *         description: A character object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharacterProfile'
 *       404:
 *         description: Character not found
 */
router.get('/:id', getCharacter);



router.get('/:characterId(\\d+)/skillqueue', getCharacterSkillQueue);

router.get('/:characterName/skillqueue', getCharacterSkillQueue);

/**
 * @swagger
 * /character/search/{search}:
 *   get:
 *     summary: Search characters by name
 *     description: Retrieve a list of characters by providing a search string
 *     tags:
 *       - Character
 *     parameters:
 *       - in: path
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: The search string to filter characters by name
 *     responses:
 *       200:
 *         description: A list of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CharacterProfile'
 *       404:
 *         description: No characters found
 */
router.get('/search/:search', searchCharacter);

export default router;
