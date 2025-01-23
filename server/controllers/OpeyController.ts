/*
 * Open Bank Project -  API Explorer II
 * Copyright (C) 2023-2024, TESOBE GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Email: contact@tesobe.com
 * TESOBE GmbH
 * Osloerstrasse 16/17
 * Berlin 13359, Germany
 *
 *   This product includes software developed at
 *   TESOBE (http://www.tesobe.com/)
 *
 */

import { Controller, Session, Req, Res, Post } from 'routing-controllers'
import { Request, Response } from 'express'
import OBPClientService from '../services/OBPClientService'
import { Service } from 'typedi'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'

@Service()
@Controller('/opey')
/**
 * Controller class for handling Opey related operations.
 * This used to hold the /chat endpoint, but that endpoint has become obsolete since using websockets. 
 * Now it serves to get tokens to authenticate the user at websocket handshake.
 * This is called from the frontend when ChatWidget.vue is mounted. (It is done at the backend to keep the private key secret) 
 */
export class OpeyController {
  constructor(
    private obpClientService: OBPClientService,
  ) {}

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
        console.log("Consent found in session, returning cached consent")
        // NOTE: Arguably we should not return the consent to the frontend as it could be hijacked,
        // we can keep everything in the backend and only return the JWT token
        return response.status(200).json(true);
      }

      const oauthConfig = session['clientConfig']
      const version = this.obpClientService.getOBPVersion()
      // Obbiously this should not be hard-coded, especially the consumer_id, but for now it is
      const consentBody = {
        "everything": false,
        "views": [],
        "entitlements": [],
        "consumer_id": "33e0a1bd-9f1d-4128-911b-8936110f802f"
      }
      // 33e0a1bd-9f1d-4128-911b-8936110f802f

      // Get current user, only proceed if user is logged in
      const currentUser = await this.obpClientService.get(`/obp/${version}/users/current`, oauthConfig)
      const currentResponseKeys = Object.keys(currentUser)
      if (!currentResponseKeys.includes('user_id')) {
        return response.status(400).json({ message: 'User not logged in, Authentication required' });
      }

      // url needs to be changed once we get the 'bankless' consent endpoint
      // this creates a consent for the current logged in user, and starts SCA flow i.e. sends SMS or email OTP to user
      const consent = await this.obpClientService.create(`/obp/${version}/banks/gh.29.uk/my/consents/IMPLICIT`, consentBody, oauthConfig)
      console.log("Consent: ", consent)

      // store consent in session, return consent 200 OK
      session['obpConsent'] = consent
      return response.status(200).json(true);
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
  

  @Post('/token')
  /**
   * Retrieves a JWT token for the current user.
   * This only works if the user is logged in. (i.e. the user has a valid session)
   * Request for the token is made to POST /api/opey/token
   * 
   * @param session - The session object.
   * @param request - The request object.
   * @param response - The response object.
   * @returns The response containing the JWT token or an error message.
   * 
   */
  async getToken(
    @Session() session: any,
    @Req() request: Request,
    @Res() response: Response
  ): Response {
    try {
      // Get current user
      const oauthConfig = session['clientConfig']
      const version = this.obpClientService.getOBPVersion()
      const currentUser = await this.obpClientService.get(`/obp/${version}/users/current`, oauthConfig)
      const currentResponseKeys = Object.keys(currentUser)
      // If current user is logged in, issue JWT signed with private key
      if (currentResponseKeys.includes('user_id')) {
        // sign
        const jwtToken = this.generateJWT(currentUser.user_id, currentUser.username, session)
        return response.status(200).json({ token: jwtToken });
      } else {
        return response.status(400).json({ message: 'User not logged in, Authentication required' });
      }
    } catch (error) {
      console.error("Error in token endpoint: ", error);
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Generates a JSON Web Token (JWT) for the given Open Bank Project (OBP) user.
   * @param obpUserId - The ID of the OBP user.
   * @param obpUsername - The username of the OBP user.
   * @param session - The session object.
   * @returns The generated JWT.
   */
  generateJWT(obpUserId: string, obpUsername: string, session: typeof Session): string {

      // Retrieve secret key
      let privateKey: string;
      if (session['opeyToken']) {
        console.log("Returning cached token");
        return session['opeyToken'];
      }

      // Read private key from file
      // Private key must be in the server/cert directory, this is pretty janky at the moment and should be improved
      // Opey must also have a copy of the public key to verify the JWT
      try {
        privateKey = fs.readFileSync('./server/cert/private_key.pem', {encoding: 'utf-8'});
      } catch (error) {
        console.error("Error reading private key: ", error);
        return '';
      }
      
      // Allows some user data to be passed in the JWT (this could be the obp consent in the future)
      const payload = {
        user_id: obpUserId,
        username: obpUsername,
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
      };
      
      console.log("Generating new token for Opey");
      const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
      session['opeyToken'] = token;

      return token
    }
}
