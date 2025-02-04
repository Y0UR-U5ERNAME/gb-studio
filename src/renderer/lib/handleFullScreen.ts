import API from "renderer/lib/api";

export const initFullScreenDetector = async () => {
  API.app.onIsFullScreenChange((_, isFullScreen) =>
    handleFullScreen(isFullScreen)
  );
  handleFullScreen(await API.app.getIsFullScreen());
};

const handleFullScreen = (isFullScreen: boolean) => {
  document.body.className = `Platform__${API.platform} ${
    isFullScreen ? "full-screen" : ""
  }`;
};
