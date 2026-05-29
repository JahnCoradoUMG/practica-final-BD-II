import { Router } from 'express';
import * as connectionsController from '../controllers/connectionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /api/connections:
 *   get:
 *     tags: [Connections]
 *     summary: Listar conexiones registradas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conexiones
 */
router.get('/', connectionsController.list);

/**
 * @openapi
 * /api/connections/test:
 *   post:
 *     tags: [Connections]
 *     summary: Probar conectividad en tiempo real
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectionInput'
 *     responses:
 *       200:
 *         description: Resultado de prueba de conectividad
 */
router.post('/test', connectionsController.test);

/**
 * @openapi
 * /api/connections:
 *   post:
 *     tags: [Connections]
 *     summary: Registrar nueva conexión de base de datos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectionInput'
 *     responses:
 *       201:
 *         description: Conexión creada
 */
router.post('/', connectionsController.create);

/**
 * @openapi
 * /api/connections/{id}:
 *   put:
 *     tags: [Connections]
 *     summary: Actualizar conexión existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectionInput'
 *     responses:
 *       200:
 *         description: Conexión actualizada
 */
router.put('/:id', connectionsController.update);

/**
 * @openapi
 * /api/connections/{id}:
 *   delete:
 *     tags: [Connections]
 *     summary: Eliminar conexión
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conexión eliminada
 */
router.delete('/:id', connectionsController.remove);

export default router;
