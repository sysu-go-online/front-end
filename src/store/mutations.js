export const setProjectName = (state, payload) => {
  state.projectName = payload.projectName;
};
export const setCurrentFilepath = (state, payload) => {
  state.currentFilepath = payload.currentFilepath;
};
export const setOpenFilepathOrder = (state, payload) => {
  state.openFilepathOrder = payload.openFilepathOrder.concat();
};
export const setOpenFiles = (state, payload) => {
  state.openFiles = JSON.parse(JSON.stringify(payload.openFiles));
};
