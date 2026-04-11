import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { ReviewService } from './review.service.js';
import { IReviewCreatePayload } from './review.interface.js';

/**
 * 1. Create a new review
 */
const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ReviewService.createReviewIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully!',
    data: result,
  });
});

/**
 * 2. Get all reviews for a specific event
 */
const getEventReviews = catchAsync(async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const result = await ReviewService.getEventReviewsFromDB(eventId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully!',
    data: result,
  });
});

/**
 * 3. Update an existing review
 */
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params; // Review ID
  const result = await ReviewService.updateReviewInDB(user.id, id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully!',
    data: result,
  });
});

/**
 * 4. Delete a review
 */
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params; // Review ID
  const result = await ReviewService.deleteReviewFromDB(user.id, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review deleted successfully!',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getEventReviews,
  updateReview,
  deleteReview,
};