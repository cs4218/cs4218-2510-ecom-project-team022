import { jest } from "@jest/globals";

// helper for mock res (if needed for other controllers)
const mockResponseColors = {
    bgMagenta: { white: (s) => s },
    bgRed: { white: (s) => s },
  };
  
  describe("connectDB", () => {
    let connectDB;
    let mongoose;
  
    beforeEach(async () => {
      jest.resetModules();
      jest.clearAllMocks();
  
      // Arrange: mock modules before importing the SUT
      await jest.unstable_mockModule("mongoose", () => ({
        default: { connect: jest.fn() },
      }));
  
      await jest.unstable_mockModule("colors", () => ({
        default: mockResponseColors,
      }));
  
      ({ default: connectDB } = await import("./db.js")); // adjust path if needed
      mongoose = (await import("mongoose")).default;
    });
  
    it("should log a success message with host when connection resolves", async () => {
      const fakeConn = { connection: { host: "localhost" } };
      mongoose.connect.mockResolvedValue(fakeConn);
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  
      const ret = await connectDB();
  
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("Connected To Mongodb Database localhost")
      );
      expect(ret).toBe(fakeConn);
    });
  
    it("should log an error message when connection rejects", async () => {
      const err = new Error("boom");
      mongoose.connect.mockRejectedValue(err);
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  
      await connectDB();
  
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error in Mongodb")
      );
    });
  });