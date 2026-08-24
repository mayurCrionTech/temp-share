/**
 * @swagger
 * /api/v1/personal-protective-equipment:
 *   post:
 *     summary: Create a new Personal Protective Equipment entry
 *     tags:
 *       - Personal Protective Equipment
 *     description: |
 *       This endpoint is to create a new designation.
 *       
 *       *Internally Populated Fields:*
 * 
 *       | Field         | Source             |
 *       |---------------|--------------------|
 *       | businessUnit  | Extracted from token (business context) |
 *       | createdBy     | Automatically set from logged-in user    |
 *       | updatedBy     | Automatically set from logged-in user    |
 *       
 *       You do not need to send these fields in the request body.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Safety Helmet"
 *                 description: The name of the PPE
 *               description:
 *                 type: string
 *                 maxLength: 300
 *                 example: "A durable safety helmet for construction workers."
 *                 description: Description of the PPE
 *               image:
 *                 type: string
 *                 format: binary
 *                 example: "helmet.jpg"
 *                 description: Image file of the PPE
 *             required:
 *               - name
 *               - description
 *               - image
 *     responses:
 *       '201':
 *         description: Successfully created the PPE entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal Protective Equipment created successfully"
 *                 id:
 *                   type: string
 *                   example: "605c72d8f1f7b75b5c2e12e4"
 *       '400':
 *         description: Bad request (Validation error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: Name is required."
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
 *         description: Not found (PPE not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal Protective Equipment not found."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error occurred."
 */

/**
 * @swagger
 * /api/v1/personal-protective-equipment:
 *   put:
 *     summary: Update an existing Personal Protective Equipment entry
 *     tags:
 *       - Personal Protective Equipment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the PPE to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Safety Helmet"
 *                 description: The updated name of the PPE
 *               description:
 *                 type: string
 *                 example: "Updated description for PPE."
 *                 description: The updated description of the PPE
 *               image:
 *                 type: string
 *                 format: binary
 *                 example: "updated_helmet.jpg"
 *                 description: The updated image file of the PPE
 *     responses:
 *       '200':
 *         description: Successfully updated the PPE entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal Protective Equipment updated successfully"
 *       '400':
 *         description: Bad request (Validation error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validation failed: Name is required."
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
 *         description: Not found (PPE not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal Protective Equipment not found."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error occurred."
 */

/**
 * @swagger
 * /api/v1/personal-protective-equipment:
 *   delete:
 *     summary: Delete multiple Personal Protective Equipment entries
 *     tags:
 *       - Personal Protective Equipment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalProtectiveEquipmentsToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["605c72d8f1f7b75b5c2e12e4", "605c72d8f1f7b75b5c2e12e5"]
 *                 description: Array of PPE IDs to delete
 *     responses:
 *       '200':
 *         description: Successfully deleted the PPE entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal Protective Equipments deleted successfully"
 *       '400':
 *         description: Bad request (Validation error or duplicate IDs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Duplicate id found"
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
 *         description: Not found (Invalid PPE IDs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Invalid PersonalProtectiveEquipment ids"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error occurred." */

/**
 * @swagger
 * /api/v1/personal-protective-equipment:
 *   delete:
 *     summary: Delete multiple Personal Protective Equipment entries
 *     tags:
 *       - Personal Protective Equipment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               personalProtectiveEquipmentsToDelete:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["605c72d8f1f7b75b5c2e12e4", "605c72d8f1f7b75b5c2e12e5"]
 *                 description: Array of PPE IDs to delete
 *     responses:
 *       '200':
 *         description: Successfully deleted the PPE entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Personal Protective Equipments deleted successfully"
 *       '400':
 *         description: Bad request (Validation error or duplicate IDs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Duplicate id found"
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
 *         description: Not found (Invalid PPE IDs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed! Invalid PersonalProtectiveEquipment ids"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Some internal server error occurred." */

/**
 * @swagger
 * api/v1/ppe/{personalProtectiveEquipment}:
 *   get:
 *     summary: Fetch a specific Personal Protective Equipment
 *     tags:
 *       - Personal Protective Equipment
 *     parameters:
 *       - in: path
 *         name: personalProtectiveEquipment
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the Personal Protective Equipment to retrieve
 *     responses:
 *       '200':
 *         description: Successfully fetched the Personal Protective Equipment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PersonalProtectiveEquipment Fetched Successfully
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                       format: uri
 *       '400':
 *         description: Bad request (Invalid or missing PPE ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: personalProtectiveEquipment id must be a non-empty string in req.params or req.body
 *                 errorInfo:
 *                   type: null
 *                   example: null
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
 *         description: Not Found (PPE does not exist)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed! PersonalProtectiveEquipment does not exist
 *                 errorInfo:
 *                   type: null
 *                   example: null
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 *                 errorInfo:
 *                   type: null
 *                   example: null
 */


