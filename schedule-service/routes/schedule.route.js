import express from "express";
const router = express.Router();
import {
  createSchedule,
  getAllSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller.js";

/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       required:
 *         - title
 *         - startTime
 *         - endTime
 *         - module
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Title of the schedule
 *         description:
 *           type: string
 *           description: Detailed description of the schedule
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the schedule
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: End time of the schedule
 *         module:
 *           type: string
 *           description: Associated module for the schedule
 *         location:
 *           type: string
 *           description: Physical location of the schedule
 *         recurring:
 *           type: boolean
 *           default: false
 *           description: Whether the schedule repeats
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           default: pending
 *           description: Current status of the schedule
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date schedule was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date schedule was last updated
 *     ScheduleInput:
 *       type: object
 *       required:
 *         - title
 *         - startTime
 *         - endTime
 *         - module
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         module:
 *           type: string
 *         location:
 *           type: string
 *         recurring:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid input (missing required fields or endTime before startTime)
 *       401:
 *         description: Unauthorized - No valid token provided
 *       500:
 *         description: Server error
 */
router.route("/").post(createSchedule);

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules with filtering options
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter schedules starting after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter schedules ending before this date
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter by schedule status
 *     responses:
 *       200:
 *         description: List of filtered schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                   description: Number of schedules returned
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Unauthorized - No valid token provided
 *       500:
 *         description: Server error
 */
router.route("/").get(getAllSchedules);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the schedule to get
 *     responses:
 *       200:
 *         description: Schedule data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Unauthorized - No valid token provided
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.route("/:id").get(getSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the schedule to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInput'
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Invalid input (missing required fields or endTime before startTime)
 *       401:
 *         description: Unauthorized - No valid token provided
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.route("/:id").put(updateSchedule);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ID of the schedule to delete
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       401:
 *         description: Unauthorized - No valid token provided
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
router.route("/:id").delete(deleteSchedule);

export default router;