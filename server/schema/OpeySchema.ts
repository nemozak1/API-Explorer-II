
export class UserInput {
    message: string;
    thread_id?: string | null;
    is_tool_call_approval: boolean;
}

export type OpeyConfig = {
    baseUri: string,
    authConfig: any,
    paths: {
        stream: string,
        invoke: string,
        approve_tool: string,
        feedback: string,
    }
}

export type AuthConfig = {
    consentId: string,
    opeyJWT: string,
}