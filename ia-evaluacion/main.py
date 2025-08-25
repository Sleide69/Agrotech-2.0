from fastapi import FastAPI

app = FastAPI(title="IA Evaluacion")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/readiness")
def readiness():
    return {"ready": True}
