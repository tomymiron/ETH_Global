import { queryDatabase } from "../database/connect.js";
import { verifyUser } from "../tools/verifier.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const eventsFormatter = (data) => {
  return data[0].map(event => {
    let tags = [];
    if (event.tags_id && event.tags) {
      const tagIds = event.tags_id.split('#');
      const tagTitles = event.tags.split('#');
      tags = tagIds.map((id, idx) => ({
        id: Number(id),
        title: tagTitles[idx] || ""
      }));
    }

    let genres = [];
    if (event.genres_id && event.genres) {
      const genreIds = event.genres_id.split('#');
      const genreTitles = event.genres.split('#');
      genres = genreIds.map((id, idx) => ({
        id: Number(id),
        title: genreTitles[idx] || ""
      }));
    }

    const { tags_id, genres_id, ...rest } = event;

    let free = false;
    if (event.free) {
      if (event.free === "11:11:11") {
        free = true;
      } else {
        const [hours, minutes] = event.free.split(":");
        let h = parseInt(hours, 10);
        let suffix = "AM";
        if (h === 0) h = 12;
        else if (h === 12) suffix = "PM";
        else if (h > 12) { h = h - 12; suffix = "PM"; }
        free = `${h}${suffix}`;
      }
    }

    return {
      ...rest,
      tags: tags.length > 0 ? tags : null,
      genres: genres.length > 0 ? genres : null,
      free
    };
  });
}

//# --- GET:EVENTS | Get Events --- ?//
//+ AUTH: ON-OFF
export const getEvents = async (req, res) => {
  try {
    const { date_cursor, priority_cursor, id_cursor } = JSON.parse(req.query.cursor || '{"date_cursor": null, "priority_cursor": null, "id_cursor": null}');
    let filters = (() => { try { return req.query.filters ? (typeof req.query.filters === "string" ? JSON.parse(req.query.filters) : req.query.filters) : {}; } catch { return {}; } })();

    const token = req.headers["authorization"];
    let data;

    const location = typeof filters.location === "string" ? JSON.parse(filters.location) : filters.location;
    const date = typeof filters.date === "string" ? JSON.parse(filters.date) : filters.date;
    const min_age = filters.ages?.min;
    const max_age = filters.ages?.max;
    const latest = filters.latest;
    const music = filters.music;
    const tags = filters.tags;
    const free = filters.free;

    const startDate = date?.value?.startDate || null;
    const endDate = date?.value?.endDate || null;
    const minAge = min_age || null;
    const maxAge = max_age || null;
    const isFree = free === true ? 1 : null;
    const isLatest = latest === true ? 1 : 0;
    const centerLat = location?.value?.center?.latitude || null;
    const centerLng = location?.value?.center?.longitude || null;
    const radius = location?.value?.radius || null;
    const genreIds = music || null;
    const tagIds = tags || null;

    const procedureParams = [date_cursor, priority_cursor, id_cursor, startDate, endDate, isFree, isLatest, centerLat, centerLng, radius, genreIds, tagIds, minAge, maxAge];

    console.log(procedureParams);
    if (!token) {
      data = await queryDatabase("call a_events_filtered_get(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", procedureParams);
    } else {
      const userInfo = await verifyUser(token);
      data = await queryDatabase("call b_events_filtered_get(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userInfo.id, ...procedureParams]);
    }

    console.log(data);

    return res.status(200).json(eventsFormatter(data));
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};

//# --- GET:EVENTS_SHOWS | Get Shows Events --- ?//
//+ AUTH: ON-OFF
export const getShows = async (req, res) => {
  try {
    const { date_cursor, priority_cursor, id_cursor } = JSON.parse(req.query.cursor || '{"date_cursor": null, "priority_cursor": null, "id_cursor": null}');
    let filters = (() => { try { return req.query.filters ? (typeof req.query.filters === "string" ? JSON.parse(req.query.filters) : req.query.filters) : {}; } catch { return {}; } })();

    const token = req.headers["authorization"];
    let data;

    const location = typeof filters.location === "string" ? JSON.parse(filters.location) : filters.location;
    const date = typeof filters.date === "string" ? JSON.parse(filters.date) : filters.date;
    const min_age = filters.ages?.min;
    const max_age = filters.ages?.max;
    const latest = filters.latest;
    const music = filters.music;
    const tags = filters.tags;
    const free = filters.free;

    const startDate = date?.value?.startDate || null;
    const endDate = date?.value?.endDate || null;
    const minAge = min_age || null;
    const maxAge = max_age || null;
    const isFree = free === true ? 1 : null;
    const isLatest = latest === true ? 1 : 0;
    const centerLat = location?.value?.center?.latitude || null;
    const centerLng = location?.value?.center?.longitude || null;
    const radius = location?.value?.radius || null;
    const genreIds = music || null;
    const tagIds = tags || null;

    const procedureParams = [date_cursor, priority_cursor, id_cursor, startDate, endDate, isFree, isLatest, centerLat, centerLng, radius, genreIds, tagIds, minAge, maxAge];

    if (!token) {
      data = await queryDatabase("call a_events_shows_filtered_get(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", procedureParams);
    } else {
      const userInfo = await verifyUser(token);
      data = await queryDatabase("call b_events_shows_filtered_get(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [userInfo.id, ...procedureParams]);
    }

    return res.status(200).json(eventsFormatter(data));
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};

//# --- GET:EVENTS_USER | User Events --- ?//
//+ AUTH: ON-OFF
export const getUserEvents = async (req, res) => {
  try {
    const { date_cursor, priority_cursor, id_cursor } = JSON.parse(req.query.cursor || '{"date_cursor": null, "priority_cursor": null, "id_cursor": null}');
    const { startDate, endDate, latestFilter: latests } = JSON.parse(req.query.filters || '{"startDate": null, "endDate": null, "latestFilter": false}');
    const { id } = JSON.parse(req.query.user || '{"id": 0}');
    if(id == 0) return res.status(400).json("Not user getted");

    const token = req.headers["authorization"];
    let data;

    const procedureParams = [date_cursor, priority_cursor, id_cursor, id];

    if (!token) {
      if(startDate || endDate || latests) data = await queryDatabase("call a_events_user_get_filtered(?, ?, ?, ?, ?, ?, ?)", [...procedureParams, startDate, endDate, latests ? 1 : 0]);
      else data = await queryDatabase("call a_events_user_get(?, ?, ?, ?)", procedureParams);
    } else {
      const userInfo = await verifyUser(token);
      data = await queryDatabase("call b_events_user_get(?, ?, ?, ?, ?)", [userInfo.id, ...procedureParams]);
    }

    return res.status(200).json(eventsFormatter(data));
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};

//# --- GET:EVENTS_USER_FINISHED | User Finished Events --- ?//
//+ AUTH: ON-OFF
export const getUserFinishedEvents = async (req, res) => {
  try {
    const { id } = JSON.parse(req.query.user || '{"id": 0}');
    if(id == 0) return res.status(400).json("Not user getted");

    const token = req.headers["authorization"];
    let data;

    if (!token) {
      data = await queryDatabase("call a_events_user_finished_get(?)", [id]);
    } else {
      const userInfo = await verifyUser(token);
      data = await queryDatabase("call b_events_user_finished_get(?, ?)", [id, userInfo.id]);
    }

    return res.status(200).json(eventsFormatter(data));
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};

//* ---###--- Event Handlers ---###--------------------------------------------------------------------------------------------------------------------------------------------- *//

//# --- POST:EVENTS_LIKE | Like Event ?//
//+ AUTH: ON
export const likeEvent = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const { eventId } = req.body;

    if (!token) return res.status(401).json("No ingresaste");
    if (!eventId) return res.status(400).json("No se obtuvo el evento");

    const userInfo = await verifyUser(token);
    await queryDatabase("CALL b_events_like(?, ?);", [eventId, userInfo.id]);
    return res.status(200).json("success");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};

//# --- DELETE:EVENTS_LIKE | UnLike Event ?//
//+ AUTH: ON
export const unlikeEvent = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const { eventId } = req.body;

    if (!token) return res.status(401).json("No ingresaste");
    if (!eventId) return res.status(400).json("No se obtuvo el evento");

    const userInfo = await verifyUser(token);
    await queryDatabase("CALL b_events_unlike(?, ?);", [eventId, userInfo.id]);
    return res.status(200).json("success");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};

//# --- DELETE:EVENTS_CLICK | Click Event ?//
//+ AUTH: ON-OFF
export const clickEvent = async (req, res) => {
  try {
    const token = req.headers["authorization"];
    const { eventId } = req.body;

    if (!eventId) return res.status(400).json("No se obtuvo el evento");

    if (!token) await queryDatabase("CALL a_events_click(?);", [eventId]);
    else {
      const userInfo = await verifyUser(token);
      await queryDatabase("CALL b_events_click(?, ?);", [eventId, userInfo.id]);
    }

    return res.status(200).json("success");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Ocurrio un error");
  }
};


//* ---###--- Event Filters ---###--------------------------------------------------------------------------------------------------------------------------------------------- *//

//# --- get:EVENTS_GENRES | Get Events Genres --- ?//
//+ AUTH: OFF
export const getGenres = async (req, res) => {
  try {
    const data = await queryDatabase("CALL a_events_genres_get()");
    return res.status(200).json(data[0]);
  } catch (err) {
    console.error(err);
    return res.status(400).json("Ocurrio un error al obtener los Generos Musicales");
  }
}

//# --- get:EVENTS_Tags | Get Events Tags --- ?//
//+ AUTH: OFF
export const getTags = async (req, res) => {
  try {
    const { id } = JSON.parse(req.query.type || '{"id": 1}');

    const data = await queryDatabase("CALL a_events_tags_get(?)", [id]);
    return res.status(200).json(data[0]);
  } catch (err) {
    console.error(err);
    return res.status(400).json("Ocurrio un error al obtener los Tags");
  }
}