import uvicorn


if __name__ == "__main__":
    # Keep reload off on Windows to avoid subprocess/interpreter mismatches.
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
    )
