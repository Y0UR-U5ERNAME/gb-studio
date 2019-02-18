import * as types from "./actionTypes";
import loadProjectData from "../lib/loadProjectData";
import saveProjectData from "../lib/saveProjectData";
import runCmd from "../lib/runCmd";
import compileProject from "../lib/compile/compile";
import fs from "fs-extra";
import uuid from "../lib/uuid";

const asyncAction = async (
  dispatch,
  requestType,
  successType,
  failureType,
  fn
) => {
  dispatch({ type: requestType });
  try {
    const res = await fn();
    dispatch({ ...res, type: successType });
  } catch (e) {
    console.log(e);
    dispatch({ type: failureType });
  }
};

export const loadProject = path => async dispatch => {
  return asyncAction(
    dispatch,
    types.PROJECT_LOAD_REQUEST,
    types.PROJECT_LOAD_SUCCESS,
    types.PROJECT_LOAD_FAILURE,
    async () => {
      const data = await loadProjectData(path);
      return {
        data,
        path
      };
    }
  );
};

export const saveProject = () => async (dispatch, getState) => {
  return asyncAction(
    dispatch,
    types.PROJECT_SAVE_REQUEST,
    types.PROJECT_SAVE_SUCCESS,
    types.PROJECT_SAVE_FAILURE,
    async () => {
      const state = getState();
      await saveProjectData(state.document.path, state.project);
    }
  );
};

export const setTool = tool => {
  return { type: types.SET_TOOL, tool };
};

export const setSection = section => {
  return { type: types.SET_SECTION, section };
};

export const setNavigationId = id => {
  return { type: types.SET_NAVIGATION_ID, id };
};

export const addMap = (x, y) => {
  return { type: types.ADD_SCENE, id: uuid(), x, y };
};

export const selectMap = mapId => {
  return { type: types.SELECT_SCENE, mapId };
};

export const moveMap = (mapId, moveX, moveY) => {
  return { type: types.MOVE_SCENE, mapId, moveX, moveY };
};

export const editMap = (mapId, values) => {
  return { type: types.EDIT_SCENE, mapId, values };
};

export const removeMap = mapId => {
  return { type: types.REMOVE_SCENE, mapId };
};

export const addActor = (mapId, x, y) => {
  return { type: types.ADD_ACTOR, id: uuid(), mapId, x, y };
};

export const moveActor = (mapId, index, moveX, moveY) => {
  return { type: types.MOVE_ACTOR, mapId, index, moveX, moveY };
};

export const selectActor = (mapId, index) => {
  return { type: types.SELECT_ACTOR, mapId, index };
};

export const removeActor = (mapId, index) => {
  return { type: types.REMOVE_ACTOR, mapId, index };
};

export const removeActorAt = (mapId, x, y) => {
  return { type: types.REMOVE_ACTOR_AT, mapId, x, y };
};

export const editActor = (mapId, index, values) => {
  return { type: types.EDIT_ACTOR, mapId, index, values };
};

export const addCollisionTile = (mapId, x, y) => {
  return { type: types.ADD_COLLISION_TILE, mapId, x, y };
};

export const removeCollisionTile = (mapId, x, y) => {
  return { type: types.REMOVE_COLLISION_TILE, mapId, x, y };
};

export const addTrigger = (mapId, x, y) => {
  return { type: types.ADD_TRIGGER, mapId, x, y };
};

export const removeTrigger = (mapId, index) => {
  return { type: types.REMOVE_TRIGGER, mapId, index };
};

export const removeTriggerAt = (mapId, x, y) => {
  return { type: types.REMOVE_TRIGGER_AT, mapId, x, y };
};

export const resizeTrigger = (mapId, index, startX, startY, x, y) => {
  return { type: types.RESIZE_TRIGGER, mapId, index, startX, startY, x, y };
};

export const moveTrigger = (mapId, index, moveX, moveY) => {
  return { type: types.MOVE_TRIGGER, mapId, index, moveX, moveY };
};

export const editTrigger = (mapId, index, values) => {
  return { type: types.EDIT_TRIGGER, mapId, index, values };
};

export const selectTrigger = (mapId, index) => {
  return { type: types.SELECT_TRIGGER, mapId, index };
};

export const renameFlag = (flagId, name) => {
  return { type: types.RENAME_FLAG, flagId, name };
};

export const setStatus = status => {
  return { type: types.SET_STATUS, status };
};

export const selectWorld = () => {
  return { type: types.SELECT_WORLD };
};

export const editWorld = values => {
  return { type: types.EDIT_WORLD, values };
};

export const editProject = values => {
  return { type: types.EDIT_PROJECT, values };
};

export const editProjectSettings = values => {
  return { type: types.EDIT_PROJECT_SETTINGS, values };
};

export const zoomIn = () => {
  return { type: types.ZOOM_IN };
};

export const zoomOut = () => {
  return { type: types.ZOOM_OUT };
};

export const zoomReset = () => {
  return { type: types.ZOOM_RESET };
};

export const consoleClear = () => {
  return { type: types.CMD_CLEAR };
};

export const runBuild = buildType => async (dispatch, getState) => {
  dispatch({ type: types.CMD_START });
  dispatch({ type: types.SET_SECTION, section: "build" });

  const state = getState();
  const projectRoot = state.document && state.document.root;
  const buildPath = "/private/tmp/build";
  const gbSrcPath = `${__dirname}/../data/src/gb/`;

  await compileProject(projectRoot, "/private/tmp/build");

  try {
    await fs.unlink(gbSrcPath + "/include/banks.h");
  } catch (err) {
    dispatch({ type: types.CMD_STD_ERR, text: err.text });
  }
  try {
    await fs.unlink(gbSrcPath + "/src/data");
  } catch (err) {
    dispatch({ type: types.CMD_STD_ERR, text: err.text });
  }

  await fs.ensureSymlink(
    buildPath + "/banks.h",
    gbSrcPath + "/include/banks.h"
  );
  await fs.ensureSymlink(buildPath, gbSrcPath + "/src/data");

  let env = Object.create(process.env);
  env.PATH = "/opt/emsdk/emscripten/1.38.6/:" + env.PATH;

  if (projectRoot) {
    return new Promise((resolve, reject) =>
      runCmd(
        "/usr/bin/make",
        [buildType],
        {
          cwd: gbSrcPath,
          env
        },
        out => {
          if (out.type === "out") {
            dispatch({ type: types.CMD_STD_OUT, text: out.text });
          } else if (out.type === "err") {
            dispatch({ type: types.CMD_STD_ERR, text: out.text });
          } else if (out.type === "complete") {
            if (out.text) {
              dispatch({ type: types.CMD_STD_ERR, text: out.text });
              dispatch({ type: types.CMD_COMPLETE });
              reject(out.text);
            } else {
              dispatch({ type: types.CMD_COMPLETE });
              resolve();
            }
          } else {
            dispatch({ type: types.CMD_STD_OUT, text: out.text });
          }
        }
      )
    );
  }
};
