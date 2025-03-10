#!/usr/bin/env python
# coding: utf-8

from ipywidgets import DOMWidget
from traitlets import Bytes, Unicode


class WasmTestWidget(DOMWidget):
    # Must match frontend
    _model_name = Unicode("WasmWidgetModel").tag(sync=True)
    _model_module = Unicode("demo_jupyter_wasm_widget").tag(sync=True)
    _model_module_version = Unicode("0.1.0").tag(sync=True)
    _view_name = Unicode("WasmWidgetView").tag(sync=True)
    _view_module = Unicode("demo_jupyter_wasm_widget").tag(sync=True)
    _view_module_version = Unicode("0.1.0").tag(sync=True)

    data = Bytes().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
