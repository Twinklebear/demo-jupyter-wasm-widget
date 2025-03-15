#!/usr/bin/env python
# coding: utf-8

import pathlib

import anywidget
import traitlets


def handle_custom_message(widget, msg, buffers):
    if msg == "load_wasm":
        wasm = (pathlib.Path(__file__).parent / "static" / "wgpu_app.wasm").read_bytes()
        widget.send("load_wasm", [wasm])


class WasmTestWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    data = traitlets.Bytes().tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.on_msg(handle_custom_message)
