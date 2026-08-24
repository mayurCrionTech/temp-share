/**
 * @swagger
 * /api/v1/assets/history:
 *   get:
 *     summary: Fetch Asset History
 *     tags:
 *       - Asset History
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: asset
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the asset
 *       - in: query
 *         name: fetchByField
 *         schema:
 *           type: string
 *         description: Field to fetch asset by (name, number, serialNumber)
 *       - in: query
 *         name: businessUnit
 *         schema:
 *           type: string
 *         description: Business unit of the asset
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Department of the asset
 *     responses:
 *       '200':
 *         description: AssetHistory fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *             example:
 *               message: "AssetHistory Fetched Successfully"
 *               data: [{ "id": "60b8d295f1d2c00015b8d73b", "history": "Asset assigned to new department" }]
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Asset id must be a non-empty string in req.params or req.body"
 *       '401':
 *         description: Unauthorized – invalid or missing token
 *         content:
 *           application/json:
 *             examples:
 *               NoToken:
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '404':
 *         description: Asset not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Failed! Asset does not exist"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Some internal server error"
 */

