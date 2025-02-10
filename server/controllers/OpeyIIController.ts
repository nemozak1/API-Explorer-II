import { streamText } from 'ai'
import axios from 'axios'
import { Controller, Session, Req, Res, Post, Get } from 'routing-controllers'
import { Request, Response } from 'express'
import { Service } from 'typedi'
import OBPClientService from '../services/OBPClientService'
import OpeyClientService from '../services/OpeyClientService'
import { v6 as uuid6 } from 'uuid';
import { UserInput } from '../schema/OpeySchema'

@Service()
@Controller('/opey')

export class OpeyController {
    constructor(
        private obpClientService: OBPClientService,
        private opeyClientService: OpeyClientService,
    ) {}

    @Get('/')
    async getStatus(
        @Res() response: Response
    ): Response {
        return response.status(200).json({status: 'Opey is running'});
    }

    @Post('/consent')
    /**
    * Retrieves a consent from OBP for the current user
    */
    async getConsent(
        @Session() session: any,
        @Req() request: Request,
        @Res() response: Response
    ): Response {
        try {
        console.log("Getting consent from OBP")
        // Check if consent is already in session
        if (session['obpConsent']) {
            console.log("Consent found in session, returning cached consent ID")
            const obpConsent = session['obpConsent']
            // NOTE: Arguably we should not return the consent to the frontend as it could be hijacked,
            // we can keep everything in the backend and only return the JWT token
            return response.status(200).json({consent_id: obpConsent.consent_id});
        }

        const oauthConfig = session['clientConfig']
        const version = this.obpClientService.getOBPVersion()
        // Obbiously this should not be hard-coded, especially the consumer_id, but for now it is
        const consentRequestBody = {
            "everything": false,
            "views": [],
            "entitlements": [],
            "consumer_id": "33e0a1bd-9f1d-4128-911b-8936110f802f"
        }

        // Get current user, only proceed if user is logged in
        const currentUser = await this.obpClientService.get(`/obp/${version}/users/current`, oauthConfig)
        const currentResponseKeys = Object.keys(currentUser)
        if (!currentResponseKeys.includes('user_id')) {
            return response.status(400).json({ message: 'User not logged in, Authentication required' });
        }

        // url needs to be changed once we get the 'bankless' consent endpoint
        // this creates a consent for the current logged in user, and starts SCA flow i.e. sends SMS or email OTP to user
        const consent = await this.obpClientService.create(`/obp/${version}/banks/gh.29.uk/my/consents/IMPLICIT`, consentRequestBody, oauthConfig)
        console.log("Consent: ", consent)

        // store consent in session, return consent 200 OK
        session['obpConsent'] = consent
        return response.status(200).json({consent_id: consent.consent_id});
        } catch (error) {
        console.error("Error in consent endpoint: ", error);
        return response.status(500).json({ error: 'Internal Server Error '});
        }
    }


    @Post('/consent/answer-challenge')
    /**
     * Endpoint to answer the consent challenge with code i.e. SMS or email OTP for SCA
     * If successful, returns a Consent-JWT for use by Opey to access endpoints/ roles that the consenting user has
     * This completes (i.e. is the final step in) the consent flow
     */
    async answerConsentChallenge(
      @Session() session: any,
      @Req() request: Request,
      @Res() response: Response
    ): Response {
      try {
        const oauthConfig = session['clientConfig']
        const version = this.obpClientService.getOBPVersion()
  
        const obpConsent = session['obpConsent']
        if (!obpConsent) {
          return response.status(400).json({ message: 'Consent not found in session' });
        } else if (obpConsent.status === 'ACCEPTED') {
          return response.status(400).json({ message: 'Consent already accepted' });
        }
        const answerBody = request.body
  
        const consentJWT = await this.obpClientService.create(`/obp/${version}/banks/gh.29.uk/consents/${obpConsent.consent_id}/challenge`, answerBody, oauthConfig)
        console.log("Consent JWT: ", consentJWT)
        // store consent JWT in session, return consent JWT 200 OK
        session['obpConsentJWT'] = consentJWT
        return response.status(200).json(true);
  
      } catch (error) { 
        console.error("Error in consent/answer-challenge endpoint: ", error);
        return response.status(500).json({ error: 'Internal Server Error' });
      }
      
    }

    @Post('/stream')

    async streamOpey(
        @Session() session: any,
        @Req() request: Request,
        @Res() response: Response
    ) {

        let user_input: UserInput
        try {
           user_input = {
            "message": request.body.message,
            "thread_id": request.body.thread_id,
            "is_tool_call_approval": request.body.is_tool_call_approval
          }
        } catch (error) {
          console.error("Error in stream endpoint, could not parse into UserInput: ", error)
          return response.status(500).json({ error: 'Internal Server Error' })
        }
        
        
        
        try {
          console.log("Calling OpeyClientService.stream")
          const stream = await this.opeyClientService.stream(user_input)
          try{
            response.setHeader('Content-Type', 'text/event-stream')
            return stream
          } catch (error) {
            console.error("Error in stream endpoint: ", error)
            return response.status(500).json({ error: 'Internal Server Error' })
          }
          
          
          

        } catch (error) {
          console.error("Error in stream endpoint: ", error)
          return response.status(500).json({ error: 'Internal Server Error' })
        }
        

        


    }
}