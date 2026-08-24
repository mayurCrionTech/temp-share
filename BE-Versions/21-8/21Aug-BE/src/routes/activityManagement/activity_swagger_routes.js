/**
 * @swagger
 * /api/v1/activities:
 *   get:
 *     summary: Fetch activities
 *     description: Retrieves a list of activities 
 *     tags:
 *       - Activities
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of activities per page
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Sort order
 *     responses:
 *       '200':
 *         description: Activities fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Activities fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       example: 4
 *                     totalDataCount:
 *                       type: integer
 *                       example: 19
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           message:
 *                             type: string
 *                             example: user has been created
 *                           moduleObjectId:
 *                             type: string
 *                             example: 669a1a27e7f7b369e3b5e258
 *                           moduleObjectName:
 *                             type: string
 *                             example: User
 *                           updateDoneBy:
 *                             type: string
 *                             example: 6682640ace2038006d1892c2
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-07-19T07:10:56.064Z
 *                           id:
 *                             type: string
 *                             example: 669a1a28e7f7b369e3b5e260
 *       '401':
 *         description: Unauthorized 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized! No token provided!"
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *             examples:
 *               NoTokenProvided:
 *                 summary: Token not provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *                   errorInfo: null
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *                   errorInfo: null
 *       '500':
 *         description: Internal Server Error (Fetching activities failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An unexpected error occurred while fetching activities
 *                 errorInfo:
 *                   type: null
 *                   example: null
*/
