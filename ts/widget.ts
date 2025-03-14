/// <reference types="@webgpu/types" />
import type { AnyModel, RenderProps } from "@anywidget/types";
import WGPUApp from "./cpp/wgpu_app";

interface WasmWidgetModel {
  data: DataView;
}

let wasmBinary: ArrayBuffer;
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
  let loadGLTFBuffer: ((ptr: number, size: number) => void) | null = null;

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
  const adapter = (await navigator.gpu.requestAdapter())!;
  const device = await adapter.requestDevice();

  if (wasmBinary === undefined) {
    wasmBinary = await loadWasm(model);
  }

  // We set -sINVOKE_RUN=0 when building and call main ourselves because something
  // within the promise -> call directly chain was gobbling exceptions
  // making it hard to debug
  app = await (<EmscriptenModuleFactory>WGPUApp)({
    // @ts-expect-error - Unknown typ
    preinitializedWebGPUDevice: device,
    // esmcripten tries to resolve a location for the wasm, regardless of
    // whether `wasmBinary` is provided. It tries to create a URL with
    // `new URL("foo.wasm", import.meta.url)` when no explicit `locateFile`,
    // but `import.meta.url` doesn't exist for anywidget modules, so it throws.
    //
    // This is just to provide something explicit (to avoid the code path where
    // emscripten tries to make a URL, but ultimately is ignored since we provide `wasmBinary`.
    locateFile: (filename: string) => {
      return filename;
    },
    wasmBinary,
  });

  // We need to wait for the canvas element to be added before
  // we can set up the canvas & context so wait for a frame now for it to mount
  requestAnimationFrame(async () => {
    try {
      app.callMain([`#${canvas.id}`]);
    } catch (e) {
      // @ts-expect-error - Assume we have a wasm error
      console.error(e.stack);
    }

    loadGLTFBuffer = app.cwrap("load_gltf_buffer", null, ["number", "number"]);
  });
}

export default { render };

/**
 * Loads wasm binary using a custom message (rather than traits).
 *
 * Traitlets are more simple but the data is always saved within the notebook.
 * For large assets, this can make notebooks explode in size when widget state
 * is saved.
 *
 * Ideally this function would grab the wasm from a URL as a fallback when/if
 * a kernel is inactive.
 *
 */
function loadWasm(model: AnyModel<WasmWidgetModel>): Promise<ArrayBuffer> {
  let { promise, resolve, reject } = Promise.withResolvers<ArrayBuffer>();
  let handler = (msg: unknown, buffers: Array<DataView<ArrayBuffer>>) => {
    if (msg === "load_wasm") {
      resolve(buffers[0].buffer)
      model.off("msg:custom", handler);
    }
  }
  AbortSignal.timeout(2000).addEventListener("abort", () => {
    reject(new Error("Loading widget WASM timed out."));
  })
  model.on("msg:custom", handler);
  model.send("load_wasm");
  return promise;
}
