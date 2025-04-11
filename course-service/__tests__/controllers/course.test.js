import {
  addCourse,
  getCourses,
  getCourseById,
  removeCourse,
} from "../../controllers/course.controller.js";
import Course from "../../models/course.model.js";

// Mock dependencies
jest.mock("../../models/course.model.js");

// Mock CustomError class
global.CustomError = jest.fn().mockImplementation((message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
});

describe("Course Controller", () => {
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

  describe("addCourse", () => {
    test("should return 500 if required fields are missing", async () => {
      // Arrange
      req.body = { courseName: "Test Course" }; // Missing courseCode

      // Act & Assert
      await expect(addCourse(req, res)).rejects.toThrow("Fields are required.");
      expect(global.CustomError).toHaveBeenCalledWith(
        "Fields are required.",
        500
      );
    });

    test("should return 500 if course creation fails", async () => {
      // Arrange
      req.body = {
        courseName: "Test Course",
        courseDescription: "Test Description",
        courseCode: "TC101",
      };

      Course.create.mockResolvedValue(null);

      // Act & Assert
      await expect(addCourse(req, res)).rejects.toThrow(
        "Course creation failed."
      );
      expect(global.CustomError).toHaveBeenCalledWith(
        "Course creation failed.",
        500
      );
    });

    test("should create course successfully", async () => {
      // Arrange
      const courseData = {
        courseName: "JavaScript Basics",
        courseDescription: "Introduction to JavaScript",
        courseCode: "JS101",
      };

      req.body = courseData;

      const mockCourse = {
        _id: "course123",
        ...courseData,
        contents: [],
        createdAt: new Date(),
      };

      Course.create.mockResolvedValue(mockCourse);

      // Act
      await addCourse(req, res);

      // Assert
      expect(Course.create).toHaveBeenCalledWith(courseData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourse);
    });
  });

  describe("getCourses", () => {
    test("should return 404 if courses are not found", async () => {
      // Arrange
      Course.find.mockResolvedValue(null);

      // Act & Assert
      await expect(getCourses(req, res)).rejects.toThrow("Courses not found.");
      expect(global.CustomError).toHaveBeenCalledWith(
        "Courses not found.",
        404
      );
    });

    test("should return all courses successfully", async () => {
      // Arrange
      const mockCourses = [
        {
          _id: "course123",
          courseName: "JavaScript Basics",
          courseDescription: "Introduction to JavaScript",
          courseCode: "JS101",
          contents: [],
        },
        {
          _id: "course456",
          courseName: "Advanced React",
          courseDescription: "Deep dive into React",
          courseCode: "RC201",
          contents: ["content123", "content456"],
        },
      ];

      Course.find.mockResolvedValue(mockCourses);

      // Act
      await getCourses(req, res);

      // Assert
      expect(Course.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCourses);
    });
  });

  describe("getCourseById", () => {
    test("should return course with populated contents", async () => {
      // Arrange
      req.params.id = "course123";

      const mockPopulateMethod = jest.fn().mockResolvedValue({
        _id: "course123",
        courseName: "JavaScript Basics",
        courseDescription: "Introduction to JavaScript",
        courseCode: "JS101",
        contents: [
          {
            _id: "content123",
            contentName: "Variables",
            contentDescription: "Learn about variables",
            type: "reading",
            body: "Variables are containers...",
          },
          {
            _id: "content456",
            contentName: "Functions",
            contentDescription: "Learn about functions",
            type: "video",
            body: "Functions are reusable blocks...",
            source: "https://example.com/video.mp4",
          },
        ],
      });

      const mockFindOneResult = {
        populate: mockPopulateMethod,
      };

      Course.findOne.mockReturnValue(mockFindOneResult);

      // Act
      await getCourseById(req, res);

      // Assert
      expect(Course.findOne).toHaveBeenCalledWith({ _id: "course123" });
      expect(mockFindOneResult.populate).toHaveBeenCalledWith("contents");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(await mockPopulateMethod());
    });

    test("should handle course not found gracefully", async () => {
      // Arrange
      req.params.id = "nonexistent-course";

      const mockPopulateMethod = jest.fn().mockResolvedValue(null);
      const mockFindOneResult = {
        populate: mockPopulateMethod,
      };

      Course.findOne.mockReturnValue(mockFindOneResult);

      // Act
      await getCourseById(req, res);

      // Assert
      expect(Course.findOne).toHaveBeenCalledWith({
        _id: "nonexistent-course",
      });
      expect(mockFindOneResult.populate).toHaveBeenCalledWith("contents");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  describe("removeCourse", () => {
    test("should delete course successfully", async () => {
      // Arrange
      req.params.id = "course123";

      const mockDeletedCourse = {
        _id: "course123",
        courseName: "JavaScript Basics",
        courseCode: "JS101",
      };

      Course.findByIdAndDelete.mockResolvedValue(mockDeletedCourse);

      // Act
      await removeCourse(req, res);

      // Assert
      expect(Course.findByIdAndDelete).toHaveBeenCalledWith("course123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDeletedCourse);
    });

    test("should handle non-existent course deletion gracefully", async () => {
      // Arrange
      req.params.id = "nonexistent-course";

      Course.findByIdAndDelete.mockResolvedValue(null);

      // Act
      await removeCourse(req, res);

      // Assert
      expect(Course.findByIdAndDelete).toHaveBeenCalledWith(
        "nonexistent-course"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(null);
    });
  });
});
