import { clickEvent, getEvents, getGenres, getShows, getTags, getUserEvents, getUserFinishedEvents, likeEvent, unlikeEvent } from "../controllers/events.js";
import express from "express";

const router = express.Router();

//* ---###--- General Handlers ---###---

//# --- GET:EVENTS | Get Events --- ?//
router.get("/", getEvents);

//# --- GET:EVENTS_SHOWS | Get Shows Events --- ?//
router.get("/shows", getShows);


//* ---###--- Users Handlers ---###---

//# --- GET:EVENTS_USER | User Events --- ?//
router.get("/user", getUserEvents);

//# --- GET:EVENTS_USER_FINISHED | User Finished Events --- ?//
router.get("/user/finished", getUserFinishedEvents);


//* ---###--- Event Handlers ---###---

//# --- POST:EVENTS_LIKE | Like Event ?//
router.post("/like", likeEvent);

//# --- DELETE:EVENTS_LIKE | UnLike Event ?//
router.delete("/like", unlikeEvent);

//# --- POST:EVENTS_CLICK | Click Event ?//
router.post("/click", clickEvent);


//* ---###--- Event Filters ---###---

//# --- get:EVENTS_GENRES | Get Events Genres --- ?//
router.get("/genres", getGenres);

//# --- get:EVENTS_Tags | Get Events Tags --- ?//
router.get("/tags", getTags);


export default router;