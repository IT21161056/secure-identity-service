import {
  addContent,
  getAllContent,
} from "../../controllers/content.controller.js";
import Course from "../../models/course.model.js";
import Content from "../../models/content.model.js";

// Mock dependencies
jest.mock("../../models/course.model.js");
jest.mock("../../models/content.model.js");

// Mock CustomError class
global.CustomError = jest.fn().mockImplementation((message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
});

describe("Content Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("addContent", () => {
    test("should return 400 if contentName is missing", async () => {
      // Arrange
      req.body = {
        contentDescription: "Test Description",
        type: "video",
        body: "Test body content",
        source: "https://example.com/video.mp4",
        courseId: "course123",
      };

      // Act & Assert
      await expect(addContent(req, res)).rejects.toThrow(
        "There should be a contentName to the content"
      );
      expect(global.CustomError).toHaveBeenCalledWith(
        "There should be a contentName to the content",
        400
      );
    });

    test("should return 400 if video content is missing source", async () => {
      // Arrange
      req.body = {
        contentName: "Test Video",
        contentDescription: "Video Description",
        type: "video",
        body: "Video transcript",
        courseId: "course123",
      };

      // Act & Assert
      await expect(addContent(req, res)).rejects.toThrow(
        "Source field is required."
      );
      expect(global.CustomError).toHaveBeenCalledWith(
        "Source field is required.",
        400
      );
    });

    test("should return 400 if video content is missing body", async () => {
      // Arrange
      req.body = {
        contentName: "Test Video",
        contentDescription: "Video Description",
        type: "video",
        source: "https://example.com/video.mp4",
        courseId: "course123",
      };

      // Act & Assert
      await expect(addContent(req, res)).rejects.toThrow(
        "There should be content to read."
      );
      expect(global.CustomError).toHaveBeenCalledWith(
        "There should be content to read.",
        400
      );
    });

    test("should return 404 if course is not found", async () => {
      // Arrange
      req.body = {
        contentName: "Test Content",
        contentDescription: "Test Description",
        type: "reading",
        body: "Test body content",
        courseId: "nonexistent-course",
      };

      Course.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(addContent(req, res)).rejects.toThrow("Course not found.");
      expect(global.CustomError).toHaveBeenCalledWith("Course not found.", 404);
    });

    test("should create reading content successfully and update course", async () => {
      // Arrange
      const contentData = {
        contentName: "Test Reading Content",
        contentDescription: "Test Description",
        type: "reading",
        body: "Test body content",
        courseId: "course123",
      };

      req.body = contentData;

      const mockCourse = {
        _id: "course123",
        courseName: "Test Course",
        courseCode: "TC101",
        contents: [],
        save: jest.fn().mockResolvedValue({
          _id: "course123",
          courseName: "Test Course",
          courseCode: "TC101",
          contents: ["content123"],
        }),
      };

      const mockContent = {
        _id: "content123",
        ...contentData,
      };

      Course.findById.mockResolvedValue(mockCourse);
      Content.create.mockResolvedValue(mockContent);

      // Act
      await addContent(req, res);

      // Assert
      expect(Course.findById).toHaveBeenCalledWith("course123");
      expect(Content.create).toHaveBeenCalledWith(contentData);
      expect(mockCourse.contents).toEqual(["content123"]);
      expect(mockCourse.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: "course123",
        courseName: "Test Course",
        courseCode: "TC101",
        contents: ["content123"],
      });
    });

    test("should create video content successfully", async () => {
      // Arrange
      const contentData = {
        contentName: "Test Video Content",
        contentDescription: "Test Video Description",
        type: "video",
        body: "Video transcript",
        source: "https://example.com/video.mp4",
        courseId: "course123",
      };

      req.body = contentData;

      const mockCourse = {
        _id: "course123",
        courseName: "Advanced JavaScript",
        courseCode: "JS201",
        contents: [],
        save: jest.fn().mockResolvedValue({
          _id: "course123",
          courseName: "Advanced JavaScript",
          courseCode: "JS201",
          contents: ["content456"],
        }),
      };

      const mockContent = {
        _id: "content456",
        ...contentData,
      };

      Course.findById.mockResolvedValue(mockCourse);
      Content.create.mockResolvedValue(mockContent);

      // Act
      await addContent(req, res);

      // Assert
      expect(Course.findById).toHaveBeenCalledWith("course123");
      expect(Content.create).toHaveBeenCalledWith(contentData);
      expect(mockCourse.contents).toEqual(["content456"]);
      expect(mockCourse.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: "course123",
        courseName: "Advanced JavaScript",
        courseCode: "JS201",
        contents: ["content456"],
      });
    });
  });

  describe("getAllContent", () => {
    test("should return 404 if content is not found", async () => {
      // Arrange
      Content.find.mockResolvedValue(null);

      // Act & Assert
      await expect(getAllContent(req, res)).rejects.toThrow(
        "Content not found."
      );
      expect(global.CustomError).toHaveBeenCalledWith(
        "Content not found.",
        404
      );
    });

    test("should return all content successfully", async () => {
      // Arrange
      const mockContent = [
        {
          _id: "content123",
          contentName: "Introduction to Arrays",
          contentDescription: "Learn about arrays in JavaScript",
          type: "reading",
          body: "Arrays are ordered collections...",
          courseId: "course123",
          createdAt: new Date("2023-01-01"),
        },
        {
          _id: "content456",
          contentName: "Functions Tutorial",
          contentDescription: "Video tutorial on JS functions",
          type: "video",
          body: "This video covers function declarations and expressions",
          source: "https://example.com/video.mp4",
          courseId: "course123",
          createdAt: new Date("2023-01-02"),
        },
      ];

      Content.find.mockResolvedValue(mockContent);

      // Act
      await getAllContent(req, res);

      // Assert
      expect(Content.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockContent);
    });
  });
});
