#!/usr/bin/env python
# coding: utf-8

import importlib.metadata
import pathlib

import anywidget
import traitlets


class WasmTestWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _wasm = traitlets.Bytes(
        (pathlib.Path(__file__).parent / "static" / "wgpu_app.wasm").read_bytes()
    ).tag(sync=True)

    data = traitlets.Bytes().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
