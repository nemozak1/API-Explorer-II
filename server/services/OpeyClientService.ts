import { Service } from 'typedi'
import { got } from 'got';
import { UserInput, OpeyConfig, AuthConfig } from '../schema/OpeySchema'

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
    async stream(user_input: UserInput): Promise<any> {

        try {
            console.log(`Streaming to Opey: ${JSON.stringify(user_input)}`) //DEBUG
            const stream = got.stream.post(`${this.opeyConfig.baseUri}${this.opeyConfig.paths.stream}`, {

                headers: {
                    "Authorization": `Bearer ${this.opeyConfig.authConfig.opeyJWT}`
                },
                body: JSON.stringify(user_input),
    
            });
            console.log(`Response from Opey: ${stream}`) //DEBUG

            //response.data.on('data', (chunk) => {console.log(`Recieved chunk: ${chunk.toString()}`)});
            return stream;
        }
        catch (error) {
            throw new Error(`Error streaming to Opey: ${error}`)
        }
        

        
    }
}