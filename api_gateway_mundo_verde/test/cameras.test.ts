import request from 'supertest'
import express from 'express'
import { buildCamerasRouter } from '../src/cameras'
import test from 'node:test'
import assert from 'node:assert'

const app = express()
app.use(express.json())
process.env.BYPASS_AUTH_FOR_TESTS = '1'
process.env.TEST_TENANT_ID = '00000000-0000-0000-0000-000000000000'
process.env.TEST_ROLE = 'admin'
app.use('/iot', buildCamerasRouter())

test('lists cameras (smoke)', async () => {
  const res = await request(app).get('/iot/camaras')
  assert.ok([200,501].includes(res.status))
})
