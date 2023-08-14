import joi from "joi";

export const CreateSessionsValidator = joi.object({
  sessionName: joi.string().required(),
  sessionDate: joi.date().required(),
  sessionInfo: joi.array().items(
    joi.object({
      limit: joi.number().required(),
      startTime: joi.string().required(),
      endTime: joi.string().required(),
    })
  ),
});

export const GetSessionsValidator = joi.object({
  id: joi.string().required(),
});

export const RequestSessionValidator = joi.object({
  sessionId: joi.string().required(),
  organizerId: joi.string().required(),
  sessionInfoId: joi.array().items(joi.string().required()),
});
export const IndividualSessionValidator = joi.object({
  sessionName: joi.string().required(),
  sessionDate: joi.date().required(),
  startTime: joi.string().required(),
  endTime: joi.string().required(),
  organizerId: joi.string().required(),
});
export const RescheduleSessionValidator = joi.object({
  sessionId: joi.string().required(),
  sessionInfoId: joi.string().required(),
  sessionDate: joi.date().required(),
  startTime: joi.string().required(),
  endTime: joi.string().required(),
  requestId: joi.string().required(),
});
