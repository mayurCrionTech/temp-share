/**
 * @swagger
 * /api/v1/assetDashboards:
 *   get:
 *     summary: Get asset dashboard metrics
 *     tags:
 *       - Asset Dashboard
 *     description: |
 *       Fetches overall asset performance metrics including availability, utilization,
 *       MTBF, MTTR, active/breakdown asset counts, and downtime hours.
 *
 *       Metrics are calculated based on:
 *       - All assets (excluding deleted)
 *       - Related work orders
 *       - Breakdown hours, standby hours, availability hours
 *       - Installation date & operational duration
 *
 *     security:
 *       - BearerAuth: []
 *
 *     responses:
 *       '200':
 *         description: Asset dashboard metrics calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAssets:
 *                   type: number
 *                   example: 54
 *                 breakdownAssets:
 *                   type: number
 *                   example: 6
 *                 activeAssets:
 *                   type: number
 *                   example: 48
 *                 assetAvailability:
 *                   type: number
 *                   example: 92.15
 *                   description: Percentage of available operational time
 *                 assetUtilization:
 *                   type: number
 *                   example: 78.42
 *                 meanTimeBetweenFailures:
 *                   type: number
 *                   example: 120.50
 *                   description: Hours between breakdown events
 *                 meanTimeToRepair:
 *                   type: number
 *                   example: 3.75
 *                   description: Average hours taken to repair breakdowns
 *                 downTime:
 *                   type: number
 *                   example: 15.25
 *                   description: Total unplanned breakdown hours
 *
 *       '401':
 *         description: Unauthorized – token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errorInfo:
 *                   type: null
 *
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error."
 *                 errorInfo:
 *                   type: null
 */

/**
 * @swagger
 * /api/v1/assetdashboards/activehours:
 *   get:
 *     tags:
 *       - Asset Dashboard
 *     summary: Fetch asset active hours or on-time workorder completion for last 12 months
 *     description: |
 *       Returns 12-month statistics for each asset.
 *       
 *       - If `activeAssetHours=true` → Monthly Active Hours of assets  
 *       - If `onTimeWorkorders=true` → Monthly Planned vs Executed Hours of Work Orders
 *     parameters:
 *       - in: query
 *         name: activeAssetHours
 *         required: false
 *         schema:
 *           type: boolean
 *         description: "If true, returns last 12 months of active hours per asset."
 * 
 *       - in: query
 *         name: onTimeWorkorders
 *         required: false
 *         schema:
 *           type: boolean
 *         description: "If true, returns last 12 months of planned vs executed workorder hours."
 * 
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Page number for pagination (default: 1)"
 * 
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Number of assets per page (default: 15)"
 * 
 *     responses:
 *       200:
 *         description: Asset dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Asset data fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     months:
 *                       type: array
 *                       example: ["Nov 2025", "Oct 2025", "Sep 2025"]
 *                     assets:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalResults:
 *                           type: integer
 *                           example: 72
 *                         results:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               assetId:
 *                                 type: string
 *                                 example: "675a32dd908eaa4720c8f1b1"
 *                               assetName:
 *                                 type: string
 *                                 example: "Compressor Unit"
 *                               monthlyActiveHours:
 *                                 type: array
 *                                 example: [120.5, 98.2, 110.0]
 *                               monthlyPlannedHours:
 *                                 type: array
 *                                 example: [40, 60, 80]
 *                               monthlyExecutedHours:
 *                                 type: array
 *                                 example: [36, 55, 78]
 * 
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Some internal server error
 */

