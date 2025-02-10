import { OpeyController } from "../server/controllers/OpeyController";
import app from '../server/app';
import request from 'supertest';
import { UserInput } from '../server/schema/OpeySchema';
import {v4 as uuidv4} from 'uuid';


const BEFORE_ALL_TIMEOUT = 30000; // 30 sec

describe('GET /api/opey', () => {
    let response: Response;
    
    it('Should return 200', async () => {
        const response = await request(app)
            .get("/api/opey")
            .set('Content-Type', 'application/json')

        expect(response.status).toBe(200);
    });
});


describe('POST /api/opey/stream', () => {
    let response: Response;
    
    it('Should return 200', async () => {
        let userInput: UserInput = {
            message: "Hello Opey",
            thread_id: uuidv4(),
            is_tool_call_approval: false
        }
        const response = await request(app)
            .post("/api/opey/stream")
            .send(userInput)
            .set('Content-Type', 'application/json')
            .buffer(false)
            .parse((res, callback) => {
                res.on('data', (chunk) => { 
                    console.log(`Recieved chunk: ${chunk.toString()}`);
                    expect(chunk.toString()).toBeTruthy();
                });

                res.on('end', () => {
                    callback(null, null);
                });
            });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toContain('text/event-stream'); // Ensure it is an SSE stream
        expect(response.headers['transfer-encoding']).toBe('chunked'); // Ensure it is streamed
    });



});