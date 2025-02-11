import { Service } from 'typedi'
import { UserInput, StreamInput, OpeyConfig, AuthConfig } from '../schema/OpeySchema'
import fetch from 'node-fetch';

@Service()
export default class OpeyClientService {
    private authConfig: AuthConfig
    private opeyConfig: OpeyConfig
    constructor() {
        this.authConfig = {
            consentId: '',
            opeyJWT: ''
        }
        this.opeyConfig = {
            baseUri: process.env.VITE_CHATBOT_URL? process.env.VITE_CHATBOT_URL : 'http://localhost:5000',
            authConfig: this.authConfig,
            paths: {
                stream: '/stream',
                invoke: '/invoke',
                approve_tool: '/approve_tool/{thead_id}',
                feedback: '/feedback',
            }
        }
        
    }
    async stream(user_input: UserInput): Promise<NodeJS.ReadableStream> {
        try {

            const url = `${this.opeyConfig.baseUri}${this.opeyConfig.paths.stream}`
            // We need to set whether we want to stream tokens or not
            const stream_input = user_input as StreamInput
            stream_input.stream_tokens = true

            console.log(`Posting to Opey: ${JSON.stringify(stream_input)}\n URL: ${url}`) //DEBUG
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${this.opeyConfig.authConfig.opeyJWT}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(stream_input)
            })
            if (!response.body) {
                throw new Error("No response body")
            }
            return response.body as NodeJS.ReadableStream
        }
        catch (error) {
            throw new Error(`Error streaming to Opey: ${error}`)
        }
        

        
    }
}