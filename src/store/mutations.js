export const setProjectName = (state, payload) => {
  state.projectName = payload.projectName;
};
export const setTree = (state, payload) => {
  state.tree = JSON.parse(JSON.stringify(payload.tree));
};
export const setCurrentFile = (state, payload) => {
  state.currentFile = JSON.parse(JSON.stringify(payload.currentFile));
};
export const setOpenFileOrder = (state, payload) => {
  state.openFileOrder = payload.openFileOrder.concat();
};
export const setOpenFiles = (state, payload) => {
  state.openFiles = JSON.parse(JSON.stringify(payload.openFiles));
};
