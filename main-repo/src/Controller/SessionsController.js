import SessionsModel from "../DB/Model/sessionsModel.js";
import BookingModel from "../DB/Model/sessionBookingModel.js";
import SessionInfoModel from "../DB/Model/sessionInfoModel.js";
import moment from "moment";
import UserModel from "../DB/Model/userModel.js";
import {
  CreateSessionsValidator,
  GetSessionsValidator,
  RequestSessionValidator,
  IndividualSessionValidator,
  RescheduleSessionValidator,
} from "../Utils/Validator/SessionsValidator.js";
import { isSessionCoinciding } from "../Utils/isSessionCoinciding.js";
import CustomError from "../Utils/ResponseHandler/CustomError.js";
import CustomSuccess from "../Utils/ResponseHandler/CustomSuccess.js";
import { Types, startSession } from "mongoose";

export const CreateSession = async (req, res, next) => {
  try {
    await CreateSessionsValidator.validateAsync(req.body);
    const userId = req.userId;
    const { sessionName, sessionDate } = req.body;
    let { sessionInfo } = req.body;

    sessionInfo = sessionInfo.map((e) => {
      e.startTime = moment(e.startTime, ["h:mm A"]).format("HH:mm");
      e.endTime = moment(e.endTime, ["h:mm A"]).format("HH:mm");
      return e;
    });

    const isCoinciding = isSessionCoinciding(sessionInfo);
    if (isCoinciding) {
      return next(
        CustomError.createError("Your Sessions Time Are Coinciding", 400)
      );
    }
    let createSession;
    const sessions = await SessionsModel.create({
      userId: userId,
      sessionName: sessionName,
      sessionDate: sessionDate,
    });
    sessionInfo.map(async (session) => {
      createSession = await SessionInfoModel.create({
        sessionId: sessions._id,
        limit: session.limit,
        startTime: session.startTime,
        endTime: session.endTime,
      });
      const updateSession = await SessionsModel.findByIdAndUpdate(
        sessions._id,
        {
          $push: {
            sessionInfo: createSession._id,
          },
        },
        {
          new: true,
        }
      );
    });

    return next(
      CustomSuccess.createSuccess([], "Session Created Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

export const GetUserActiveSession = async (req, res, next) => {
  try {
    await GetSessionsValidator.validateAsync(req.query);
    const { id } = req.query;
    const sessions = await SessionsModel.find({
      userId: id,
    });
    sessions.map(async (session) => {
      if (session.sessionDate < new Date()) {
        await SessionInfoModel.updateMany(
          {
            sessionId: session._id,
          },
          {
            isActive: false,
          },
          {
            new: true,
          }
        );
      }
    });
    let ActiveSessions = await SessionsModel.aggregate([
      {
        $match: {
          userId: Types.ObjectId(id),

          sessionDate: { $gte: new Date() },
        },
      },
      {
        $lookup: {
          from: "sessioninfos",
          localField: "sessionInfo",
          foreignField: "_id",
          as: "sessions",
        },
      },
      {
        $lookup: {
          from: "sessionbookings",
          localField: "sessions._id",
          foreignField: "sessionInfoId",
          as: "bookings",
        },
      },
      {
        $addFields: {
          ActiveSessions: {
            $filter: {
              input: "$sessions",
              as: "session",
              cond: {
                $and: [
                  { $eq: ["$$session.isActive", true] },
                  {
                    $eq: ["$$session.sessionType", "Public"],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $addFields: {
          ActiveSessions: {
            $map: {
              input: "$ActiveSessions",
              as: "activeSession",
              in: {
                $mergeObjects: [
                  "$$activeSession",
                  {
                    Booked: {
                      $cond: {
                        if: {
                          $in: [
                            "$$activeSession._id",
                            "$bookings.sessionInfoId",
                          ],
                        },
                        then: {
                          $size: {
                            $filter: {
                              input: "$bookings",
                              as: "booking",
                              cond: {
                                $eq: [
                                  "$$booking.sessionInfoId",
                                  "$$activeSession._id",
                                ],
                              },
                            },
                          },
                        },
                        else: 0,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          sessions: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          sessionInfo: 0,
          bookings: 0,
        },
      },
    ]);

    ActiveSessions = await SessionsModel.populate(ActiveSessions, [
      {
        path: "userId",
        model: "User",
        select: "fullName",
        populate: [
          {
            path: "image",
            select: "mediaUrl",
          },
        ],
      },
    ]);
    ActiveSessions.map((e) => {
      let remainingSeats = 0;
      e.ActiveSessions = e.ActiveSessions.map((i) => {
        remainingSeats = i.limit - i.Booked;
        return {
          ...i,
          remainingSeats: remainingSeats,
        };
      });
    });

    return next(
      CustomSuccess.createSuccess(
        ActiveSessions,
        "Session Fetched Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
export const GetUserInActiveSession = async (req, res, next) => {
  try {
    await GetSessionsValidator.validateAsync(req.query);
    const { id } = req.query;
    let sessions = await SessionsModel.aggregate([
      {
        $match: {
          userId: Types.ObjectId(id),
          sessionDate: { $lt: new Date() },
        },
      },
      {
        $lookup: {
          from: "sessioninfos",
          localField: "sessionInfo",
          foreignField: "_id",
          as: "sessions",
        },
      },
      {
        $addFields: {
          InActiveSessions: {
            $filter: {
              input: "$sessions",
              as: "session",
              cond: {
                $eq: ["$$session.isActive", false],
              },
            },
          },
        },
      },

      {
        $project: {
          sessions: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          sessionInfo: 0,
        },
      },
    ]);

    sessions = await SessionsModel.populate(sessions, [
      {
        path: "userId",
        model: "User",
        select: "fullName",
        populate: [
          {
            path: "image",
            select: "mediaUrl",
          },
        ],
      },
    ]);

    return next(
      CustomSuccess.createSuccess(sessions, "Session Fetched Successfully", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
//TODO
export const EditSession = async (req, res, next) => {
  try {
    const { id } = req.query;
    const { sessionName, sessionDate, limit, startTime, endTime } = req.body;
    const findSession = await SessionsModel.findById(id);
    if (findSession.userId != req.userId) {
      return next(
        CustomError.createError("Only owner of the session can edit", 400)
      );
    }
    const editSession = await SessionsModel.findByIdAndUpdate(
      id,
      {
        sessionName: sessionName,
        sessionDate: sessionDate,
        startTime: startTime,
        endTime: endTime,
        limit: limit,
      },
      {
        new: true,
      }
    );
    return next(
      CustomSuccess.createSuccess(
        editSession,
        "Session Edited Successfully",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

export const RequestSession = async (req, res, next) => {
  try {
    await RequestSessionValidator.validateAsync(req.body);
    const { sessionId, organizerId, sessionInfoId } = req.body;
    let booking = [];
    let totalPrice = 0;
    booking = await Promise.all(
      sessionInfoId.map(async (e) => {
        const findSession = await SessionInfoModel.findOne({
          _id: e,
          sessionId: sessionId,
          isActive: true,
        });

        if (!findSession) {
          return next(
            CustomError.createError("Session Does Not Exist Or is Expired", 400)
          );
        }
        totalPrice = totalPrice + findSession.price;
        await BookingModel.create({
          attendeeId: req.userId,
          sessionId: sessionId,
          organizerId: organizerId,
          sessionInfoId: e,
        });
        return findSession;
      })
    );
    const session = await SessionsModel.findById(sessionId);
    return next(
      CustomSuccess.createSuccess(
        { session, booking, totalPrice },
        "Request To Join Session Sent",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
//todo
export const GetAllRequests = async (req, res, next) => {
  try {
    let pendingRequests = await BookingModel.aggregate([
      {
        $match: {
          organizerId: Types.ObjectId(req.userId),
        },
      },
      {
        $group: {
          _id: "$organizerId",
          Requests: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $project: {
          "Requests.organizerId": 0,
          "Requests.updatedAt": 0,
        },
      },
    ]);
    pendingRequests = await BookingModel.populate(pendingRequests, [
      {
        path: "_id",
        model: "User",
        select: "fullName email image",
        populate: {
          path: "image",
          select: "mediaUrl",
        },
      },
      {
        path: "Requests.attendeeId",
        model: "User",
        select: "fullName email image",
        populate: {
          path: "image",
          select: "mediaUrl",
        },
      },
      {
        path: "Requests.sessionId",
        model: "Sessions",
        select: "sessionName sessionDate limit startTime endTime isActive",
      },
      {
        path: "Requests.sessionInfoId",
        model: "SessionInfo",
        select: "limit startTime endTime isActive sessionType",
      },
    ]);
    if (pendingRequests.length == 0) {
      return next(
        CustomSuccess.createSuccess(
          { Requests: pendingRequests },
          "All Requests To Join Your Event",
          200
        )
      );
    }
    return next(
      CustomSuccess.createSuccess(
        pendingRequests[0],
        "All Requests To Join Your Event",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

export const AcceptRequest = async (req, res, next) => {
  try {
    const { id } = req.query;
    const { sessionId, sessionInfoId } = req.body;
    const countRequest = await BookingModel.countDocuments({
      sessionId: sessionId,
      sessionInfoId: sessionInfoId,
      isAccepted: true,
    });
    console.log(countRequest);
    const limit = await SessionInfoModel.findById(sessionInfoId).select(
      "limit"
    );
    console.log(limit);
    if (limit.limit <= countRequest) {
      return next(
        CustomError.createError("Limit To Join Session Exceeded", 400)
      );
    }
    const acceptRequest = await BookingModel.findByIdAndUpdate(
      id,
      {
        isAccepted: true,
        pending: false,
      },
      {
        new: true,
      }
    );

    return next(
      CustomSuccess.createSuccess(acceptRequest, "Request Accepted", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
export const RejectRequest = async (req, res, next) => {
  try {
    const { id } = req.query;
    const rejectRequest = await BookingModel.findByIdAndUpdate(
      id,
      {
        isRejected: true,
        pending: false,
      },
      { new: true }
    );
    if (rejectRequest) {
      return next(
        CustomSuccess.createSuccess(rejectRequest, "Request Rejected", 200)
      );
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

export const GetSentRequests = async (req, res, next) => {
  try {
    const userId = req.userId;
    const sentRequests = await BookingModel.find({
      attendeeId: userId,
    }).populate([
      {
        path: "organizerId",
        select: "fullName image",
        populate: {
          path: "image",
          select: "mediaUrl",
        },
      },
      {
        path: "sessionId",
        select: "userId sessionName sessionDate createdAt",
      },
      {
        path: "sessionInfoId",
      },
    ]);
    if (sentRequests) {
      return next(
        CustomSuccess.createSuccess(sentRequests, "All your sent Requests", 200)
      );
    }
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

export const IndividualSession = async (req, res, next) => {
  try {
    await IndividualSessionValidator.validateAsync(req.body);
    const { sessionName, sessionDate, startTime, endTime, organizerId } =
      req.body;
    const createSession = await SessionsModel.create({
      userId: organizerId,
      sessionName: sessionName,
      sessionDate: sessionDate,
    });
    const createSessionInfo = await SessionInfoModel.create({
      sessionId: createSession._id,
      limit: 1,
      startTime: startTime,
      endTime: endTime,
      sessionType: "Private",
    });
    await SessionsModel.findByIdAndUpdate(
      createSession._id,
      {
        $push: {
          sessionInfo: createSessionInfo._id,
        },
      },
      {
        new: true,
      }
    );
    const createRequest = await BookingModel.create({
      attendeeId: req.userId,
      sessionId: createSession._id,
      organizerId: organizerId,
      sessionInfoId: createSessionInfo._id,
    });
    return next(
      CustomSuccess.createSuccess(
        createRequest,
        "Successfully Created Request For Individual Session",
        200
      )
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};

export const RescheduleSession = async (req, res, next) => {
  try {
    await RescheduleSessionValidator.validateAsync(req.body);
    const {
      sessionId,
      sessionInfoId,
      startTime,
      endTime,
      sessionDate,
      requestId,
    } = req.body;
    await SessionsModel.findByIdAndUpdate(
      sessionId,
      {
        sessionDate: sessionDate,
      },

      { new: true }
    );

    await SessionInfoModel.findByIdAndUpdate(
      sessionInfoId,
      {
        startTime: startTime,
        endTime: endTime,
      },
      { new: true }
    );
    const acceptRequest = await BookingModel.findByIdAndUpdate(
      requestId,
      {
        isAccepted: true,
        pending: false,
      },
      { new: true }
    );

    return next(
      CustomSuccess.createSuccess(acceptRequest, "Request Accepted", 200)
    );
  } catch (error) {
    return next(CustomError.createError(error.message, 500));
  }
};
