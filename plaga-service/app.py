from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
import os
import psycopg2
from psycopg2.extras import Json

app = FastAPI()

DATABASE_URL = os.getenv('DATABASE_URL')

@app.get('/health')
def health():
    return { 'status': 'healthy' }

@app.post('/predict')
async def predict(image: Optional[UploadFile] = File(None), image_url: Optional[str] = Form(None), cultivo_id: Optional[int] = Form(None), zona_id: Optional[int] = Form(None)):
    if not image and not image_url:
        raise HTTPException(status_code=400, detail='Provide image file or image_url')
    # Fake detection for demo
    plaga = 'minador'
    score = 0.87
    recomendacion = 'Aplicar control biológico'
    # Store in core.detecciones_plaga
    if DATABASE_URL:
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            cur.execute(
                'insert into core.detecciones_plaga(cultivo_id, zona_id, imagen_url, plaga, score, recomendacion, metadata) values (%s,%s,%s,%s,%s,%s,%s)',
                (cultivo_id, zona_id, image_url or f'upload://{image.filename if image else ""}', plaga, score, recomendacion, Json({}))
            )
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print('DB insert error:', e)
    return { 'plaga': plaga, 'score': score, 'recomendacion': recomendacion }
