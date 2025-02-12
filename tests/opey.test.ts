import { OpeyController } from "../server/controllers/OpeyController";
import app from '../server/app';
import request from 'supertest';
import fetch from 'node-fetch';
import http from 'node:http';
import { UserInput } from '../server/schema/OpeySchema';
import {v4 as uuidv4} from 'uuid';
import { agent } from "superagent";


const BEFORE_ALL_TIMEOUT = 30000; // 30 sec
const SERVER_URL = process.env.VITE_OBP_API_EXPLORER_HOST

describe('GET /api/opey', () => {
    let response: Response;
    
    it('Should return 200', async () => {
        const response = await request(app)
            .get("/api/opey")
            .set('Content-Type', 'application/json')

        expect(response.status).toBe(200);
    });
});

describe('GET /api/opey/invoke', () => {
    let response: Response;

    let userInput: UserInput = {
        message: "Hello Opey",
        thread_id: uuidv4(),
        is_tool_call_approval: false
    }
    
    it('Should return 200', async () => {
        const response = await request(app)
            .post("/api/opey/invoke")
            .send(userInput)
            .set('Content-Type', 'application/json')
            .then(response => {
                console.log(`Response: ${response.body}`)
                expect(response.status).toBe(200);
            })
            
        
    });
})

describe('POST /api/opey/stream', () => {

    const httpAgent = new http.Agent({ keepAlive: true, port: 9999 });

    beforeAll(async () => {
        app.listen(5173)
        
    });

    afterAll(async () => {
        app.close()
        httpAgent.destroy()
    });

    
    it('Should stream response', async () => {
        let userInput: UserInput = {
            message: "Hello Opey",
            thread_id: uuidv4(),
            is_tool_call_approval: false
        }

        

        // const response = await request(app)
        //     .post("/api/opey/stream")
        //     .set('Content-Type', 'text/event-stream')
        //     .responseType('blob')
        //     .send(userInput)

        await fetch(`${SERVER_URL}/api/opey/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'connection': 'keep-alive'
            },
            body: JSON.stringify(userInput),
        })
        .catch(error => {
            console.error(`Error performing test fetch: ${error}`)
        })
        .then(streamingResponse => {
            console.log(streamingResponse)

            streamingResponse.body.on('data', (chunk) => {
                console.log(`${chunk}`)
            })
            // response.on
            // console.log(response.body)
            // const readable = response.body
            // readable.on('data', (chunk) => {
            //     const data = chunk.toString()
            //     console.log(`data: ${data}`)
            // })
        })
        .finally(() => {
            httpAgent.destroy()
        })
            
        

        // while (true) {
        //     const {value, done} = await reader.read();
        //     if (done) break;
        //     console.log('Received', value);
        //   }
            
        // expect(response.headers['content-type']).toBe('text/event-stream')
        // expect(response.status).toBe(200)
        // Optionally, parse chunks or check SSE headers
    })
});