import { Service } from 'typedi'
import axios from 'axios'
import { UserInput } from '../schema/OpeySchema'

@Service()
export default class OpeyClientService {
    private AuthConfig: {
        consentId: string,
        opeyJWT: string,
    }
    private opeyConfig: {
        baseUri: string,
        authConfig: any,
        paths: {
            stream: string,
            invoke: string,
            approve_tool: string,
            feedback: string,
        }
    }
    constuctor() {
        this.AuthConfig = {
            consentId: '',
            opeyJWT: ''
        }
        this.opeyConfig = {
            baseUri: process.env.VITE_CHATBOT_URL,
            authConfig: this.AuthConfig,
            paths: {
                stream: '/stream',
                invoke: '/invoke',
                approve_tool: '/approve_tool/{thead_id}',
                feedback: '/feedback',
            }
        }
        
    }
    async stream(user_input: UserInput) {
        await axios.post(this.opeyConfig.paths.stream, user_input, {

            headers: {
                "Authorization": `Bearer ${this.opeyConfig.authConfig.opeyJWT}`
            },
            responseType: 'stream'

        }).catch((error) => {
            console.error(error)

        }).then((response) => {
            const stream = response.data
            return stream
        })
    }
}