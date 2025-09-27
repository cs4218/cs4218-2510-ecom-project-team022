/** @jest-environment node */

// Mock modules FIRST — Jest hoists these automatically.
jest.mock('mongoose', () => {
  const connect = jest.fn();
  return { __esModule: true, default: { connect } };
});

jest.mock('colors', () => ({
  __esModule: true,
  default: {
    bgMagenta: { white: (s) => s },
    bgRed: { white: (s) => s },
  },
}));

import mongoose from 'mongoose';
import connectDB from './db.js';

describe('connectDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://test-url';
  });

  it('should log a success message with host when connection resolves', async () => {
    // Arrange
    const fakeConn = { connection: { host: 'localhost' } };
    mongoose.connect.mockResolvedValue(fakeConn);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Act
    const ret = await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Connected To Mongodb Database localhost')
    );
    expect(ret).toBe(fakeConn);
  });

  it('should log an error message when connection rejects', async () => {
    // Arrange
    const err = new Error('boom');
    mongoose.connect.mockRejectedValue(err);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Act
    await connectDB();

    // Assert
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Error in Mongodb'));
  });
});