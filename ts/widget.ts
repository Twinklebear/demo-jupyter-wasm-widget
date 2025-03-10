import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
} from "@jupyter-widgets/base";
import WGPUApp from "./cpp/wgpu_app";
import { MODULE_NAME, MODULE_VERSION } from "./version";

export class WasmWidgetModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: WasmWidgetModel.model_name,
      _model_module: WasmWidgetModel.model_module,
      _model_module_version: WasmWidgetModel.model_module_version,
      _view_name: WasmWidgetModel.view_name,
      _view_module: WasmWidgetModel.view_module,
      _view_module_version: WasmWidgetModel.view_module_version,
      // Param for sending glb files from Python to the widget
      data: null as DataView,
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
  };

  // Note: must match Python, could use a JSON file or
  // something to include in both
  static model_name = "WasmWidgetModel";
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = "WasmWidgetView";
  static view_module = MODULE_NAME;
  static view_module_version = MODULE_VERSION;
}

type LoadGLTFFunction = (ptr: number, size: number) => void;

export class WasmWidgetView extends DOMWidgetView {
  static next_canvas_id = 0;
  canvas: HTMLCanvasElement;

  app: any = null;
  loadGLTFBuffer: LoadGLTFFunction | null = null;

  // Called when the widget is displayed
  async render() {
    const canvas = document.createElement("canvas");
    this.canvas = canvas;
    canvas.width = 640;
    canvas.height = 480;
    canvas.id = `canvas-${WasmWidgetModel.view_name}-${WasmWidgetView.next_canvas_id}`;

    canvas.oncontextmenu = (evt: MouseEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
    };

    WasmWidgetView.next_canvas_id += 1;

    this.el.appendChild(canvas);

    this.model.on("change:data", this.importGlb, this);

    // Get a GPU device to render with
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    // We set -sINVOKE_RUN=0 when building and call main ourselves because something
    // within the promise -> call directly chain was gobbling exceptions
    // making it hard to debug
    this.app = await WGPUApp({
      preinitializedWebGPUDevice: device,
    });

    // We need to wait for the canvas element to be added before
    // we can set up the canvas & context so wait for a frame now for it to mount
    requestAnimationFrame(async () => {
      try {
        this.app.callMain([`#${canvas.id}`]);
      } catch (e) {
        console.error(e.stack);
      }

      this.loadGLTFBuffer = this.app.cwrap("load_gltf_buffer", null, [
        "number",
        "number",
      ]);
    });
  }

  private importGlb() {
    if (!this.loadGLTFBuffer) {
      console.warn("Wasm isn't ready to load GLTF data yet");
      return;
    }
    const data = new Uint8Array((this.model.get("data") as DataView).buffer);
    if (data.byteLength === 0) {
      console.warn("No data to load");
      return;
    }

    // Allocate room in the Wasm memory to write the glb buffer
    const ptr = this.app._malloc(data.byteLength);

    this.app.HEAPU8.set(data, ptr);

    this.loadGLTFBuffer(ptr, data.byteLength);

    // Release the memory we allocated in the Wasm, it's no longer needed
    this.app._free(ptr);
  }
}
