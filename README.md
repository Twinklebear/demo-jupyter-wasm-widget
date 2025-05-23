# Demo of a Jupyter Widget Using WebAssembly

This is built using [anywidet](https://github.com/manzt/anywidget)
to simplify packaging and distribution. You can try out
a live demo running in [Google Colab](https://colab.research.google.com/drive/1hdWj73Oc6v6EtcrE8Re6M-Btn9KQCwVa?usp=sharing)
or download the repo, `pip install demo-jupyter-wasm-widget` and
run the example in ./example/demo.ipynb.

<img width="2558" alt="Screenshot 2025-03-15 at 3 45 36 PM" src="https://github.com/user-attachments/assets/d11af87b-df94-4d87-aab8-d79cdb66a03f" />

# Dependencies

The widget depends on `anywidget` and `traitlets`.

# Development

To install the widget for development/editing you can run simply run
```bash
pip install -e .
```
which will also run `pnpm install` and `pnpm run build` to build the
frontend code.


Then when you modify the frontend widget code, recompile it
by running:
```bash
pnpm run build
```

# Building

The widget frontend code is built when running the python build 
command via hatchling which will also install pnpm dependencies
and build the frontend code. Build via
```bash
python -m build
```

Build artifacts are placed in `dist/`
