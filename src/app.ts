import { getGPUTier, TierResult } from "detect-gpu";
import LoadingController from "./DOM/LoadingController";
import initGL from "./webgl/initGL";
import "./scss/global.scss";

const init = () => {
  new LoadingController();

  (async () => {
    const gpuTier: TierResult = await getGPUTier();

    const [controller, cancelRAF] = initGL(document.querySelector(".canvas-gl"), gpuTier)

    // To dispose :
    // controller.unmount()
    // cancelRAF()
  })();
};

init()