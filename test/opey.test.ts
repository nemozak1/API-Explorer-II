
import { beforeAll, describe, afterAll, it, expect, expectTypeOf, test } from 'vitest';
import { OpeyController } from "../server/controllers/OpeyController";
import app from '../server/app';
import { UserInput } from '../server/schema/OpeySchema';
import { v6 as uuid6 } from 'uuid';

const BEFORE_ALL_TIMEOUT = 30000; // 30 sec


let server;

beforeAll(() => {
  // Start the Express app on a test port
  server = app.listen(3000);
});

afterAll(() => {
  // Close the server after tests
  server.close();
});


describe('POST /api/opey/stream', () => {
    let response: Response;
    
    it('Should return 200', async () => {
        let userInput: UserInput = {
            message: "Hello Opey",
            is_tool_call_approval: false
        }
        const response = await fetch("http://localhost:3000/api/opey/stream", {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInput)
        });
        expect(response.status).toBe(200);
    });
});