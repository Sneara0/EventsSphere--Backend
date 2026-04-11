import httpStatus from 'http-status';
import { prisma } from "../../lib/prisma";

import { IReviewCreatePayload, IReviewUpdatePayload } from "./review.interface";
import AppError from '../../errorHelpers/AppError';


/**
 * 1. Create a new review
 * Logic: User must have a PAID booking for the event and can only review once.
 */
const createReviewIntoDB = async (userId: string, payload: IReviewCreatePayload) => {
  const { eventId, rating, comment } = payload;

  // Check if the user has a confirmed/paid booking for this event
  const isBooked = await prisma.booking.findFirst({
    where: {
      userId,
      eventId,
      paymentStatus: 'PAID',
    },
  });

  if (!isBooked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You cannot review an event you haven't booked or paid for."
    );
  }

  // Check for duplicate reviews (Database @@unique constraint fallback)
  const isAlreadyReviewed = await prisma.review.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (isAlreadyReviewed) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have already reviewed this event.");
  }

  const result = await prisma.review.create({
    data: {
      userId,
      eventId,
      rating,
      comment,
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return result;
};

/**
 * 2. Get all reviews for a specific event
 */
const getEventReviewsFromDB = async (eventId: string) => {
  const result = await prisma.review.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
};

/**
 * 3. Update an existing review
 * Logic: User can only update their own review.
 */
const updateReviewInDB = async (
  userId: string,
  reviewId: string,
  payload: IReviewUpdatePayload
) => {
  const isReviewExists = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!isReviewExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found.");
  }

  if (isReviewExists.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this review.");
  }

  const result = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
  });

  return result;
};

/**
 * 4. Delete a review
 */
const deleteReviewFromDB = async (userId: string, reviewId: string) => {
  const isReviewExists = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!isReviewExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found.");
  }

  // Only the owner or an Admin can delete
  if (isReviewExists.userId !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this review.");
  }

  const result = await prisma.review.delete({
    where: { id: reviewId },
  });

  return result;
};

export const ReviewService = {
  createReviewIntoDB,
  getEventReviewsFromDB,
  updateReviewInDB,
  deleteReviewFromDB,
};