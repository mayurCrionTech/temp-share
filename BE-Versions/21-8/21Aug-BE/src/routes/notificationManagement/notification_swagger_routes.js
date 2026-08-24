/**
 * @swagger
 * /api/v1/notifications/:
 *   get:
 *     summary: Retrieve a list of notifications
 *     description: Number of items per page.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           default: "createdAt"
 *         description: Field to sort by
 *         example: "createdAt"
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Sort order
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notifications fetched successfully
 *                 result:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPageCount:
 *                       type: integer
 *                       example: 1
 *                     totalDataCount:
 *                       type: integer
 *                       example: 5
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 6698bdf727eb5b4499251284
 *                           activity:
 *                             type: string
 *                             description: Activity associated with the notification
 *                             example: "edit"
 *                           message:
 *                             type: string
 *                             example: Test notification 323 TN 323 has been added to your department
 *                           moduleObjectId:
 *                             type: string
 *                             example: 6698bdf627eb5b4499251261
 *                           moduleObjectName:
 *                             type: string
 *                             example: User
 *                           sender:
 *                             type: object
 *                             description: Sender of the notification (populated)
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: Sender ID (MongoDB ObjectId)
 *                                 example: "605c72ef1e153a2b6c8e4d30"
 *                               name:
 *                                 type: string
 *                                 description: Sender name
 *                                 example: "John Doe"
 *                           receiver:
 *                             type: object
 *                             description: Receiver of the notification (populated)
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 description: Receiver ID (MongoDB ObjectId)
 *                                 example: "605c72ef1e153a2b6c8e4d31"
 *                               name:
 *                                 type: string
 *                                 description: Receiver name
 *                                 example: "Jane Smith"
 *                           isRead:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-07-18T07:00:41.125Z
 *       401:
 *         description: Unauthorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               message: "Some internal server error"
 *               data: null
*/


/**
 * @swagger
 * /api/v1/notifications/changeStatus:
 *   patch:
 *     summary: Toggle notification read status
 *     description: Updates the read status for a list of notifications.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: array
 *                 description: Array of notification IDs to update
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   description: Notification ID (MongoDB ObjectId)
 *                   example: "605c72ef1e153a2b6c8e4d2f"
 *             required:
 *               - notifications
 *     responses:
 *       200:
 *         description: Notifications updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notifications updated successfully"
 *                 result:
 *                   type: null
 *               required:
 *                 - message
 *                 - result
 *       400:
 *         description: Bad request 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             examples:
 *               InvalidNotificationsArray:
 *                 summary: Notifications not a non-empty array of strings
 *                 value:
 *                   message: "Notifications must be a non-empty array of strings"
 *                   data: null
 *               NonExistentNotifications:
 *                 summary: Some notifications do not exist
 *                 value:
 *                   message: "Failed! Some notifications do not exist"
 *                   data:
 *                     invalidNotifications: ["605c72ef1e153a2b6c8e9999"]
 *       401:
 *         description: Unauthorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               message: "Some internal server error"
 *               data: null
*/


/**
 * @swagger
 * /api/v1/notifications/unreadNotificationsCount:
 *   get:
 *     summary: Fetch unread notifications count
 *     description: Retrieves the count of unread notifications.
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "UnReadNotification count fetched successfully"
 *                 result:
 *                   type: object
 *                   properties:
 *                     unReadNotificationsCount:
 *                       type: integer
 *                       description: Number of unread notifications
 *                       example: 5
 *                   required:
 *                     - unReadNotificationsCount
 *               required:
 *                 - message
 *                 - result
 *       401:
 *         description: Unauthorized token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               NoTokenProvided:
 *                 summary: No token provided
 *                 value:
 *                   message: "Unauthorized! No token provided!"
 *               InvalidToken:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Unauthorized! Invalid token provided!"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *             example:
 *               message: "some internal server error"
 *               data: null
*/
