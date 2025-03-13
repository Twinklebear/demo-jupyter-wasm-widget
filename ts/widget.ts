import type { RenderProps } from "@anywidget/types";
import WGPUApp from "./cpp/wgpu_app";

interface WasmWidgetModel {
  data: DataView;
}

let next_canvas_id = 0;

async function render({ model, el }: RenderProps<WasmWidgetModel>) {
  // Called when the widget is displayed
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  canvas.id = `canvas-WasmWidgetModel-${next_canvas_id++}`;

  canvas.oncontextmenu = (evt: MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  el.appendChild(canvas);

  let app: Awaited<ReturnType<typeof WGPUApp>> | null = null;
  let loadGLTFBuffer: (ptr: number, size: number) => void | null = null;

  /*
  const importGlb = () => {
    if (!loadGLTFBuffer) {
      console.warn("Wasm isn't ready to load GLTF data yet");
      return;
    }
    const data = new Uint8Array((model.get("data") as DataView).buffer);
    if (data.byteLength === 0) {
      console.warn("No data to load");
      return;
    }

    // Allocate room in the Wasm memory to write the glb buffer
    const ptr = app._malloc(data.byteLength);

    app.HEAPU8.set(data, ptr);

    loadGLTFBuffer(ptr, data.byteLength);

    // Release the memory we allocated in the Wasm, it's no longer needed
    app._free(ptr);
  };

  model.on("change:data", importGlb);

  // Get a GPU device to render with
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  // We set -sINVOKE_RUN=0 when building and call main ourselves because something
  // within the promise -> call directly chain was gobbling exceptions
  // making it hard to debug
  app = await WGPUApp({
    preinitializedWebGPUDevice: device,
    locateFile: (filename: string) => {
      return filename;
    },
  });

  // We need to wait for the canvas element to be added before
  // we can set up the canvas & context so wait for a frame now for it to mount
  requestAnimationFrame(async () => {
    try {
      app.callMain([`#${canvas.id}`]);
    } catch (e) {
      console.error(e.stack);
    }

    loadGLTFBuffer = app.cwrap("load_gltf_buffer", null, ["number", "number"]);
  });
  */
}

export default { render };
