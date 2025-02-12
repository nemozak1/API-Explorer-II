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

import { isServerUp, serverStatus } from '.';
import axios from 'axios';

export function updateLoadingInfoMessage(logMessage: string) {
  // 1. Select the div element using the id property
  const spinner = document.getElementById('loading-api-spinner')
  // 2. Select the div element using the id property
  let p = document.getElementById('loading-api-info')
  // 3. Add the text content
  if (p !== null) {
    p.textContent = logMessage
  } else {
    p = document.createElement('p')
  }
  // 4. Append the p element to the div element
  spinner?.appendChild(p)
}

export function updateServerStatus() {
  const oElem = document.getElementById('backend-status');
  serverStatus()
    .then((body) => {
      if (oElem) {
        body.status === true
          ? (oElem.className = 'server-is-online')
          : (oElem.className = 'server-is-offline');
      }
    })
    .catch((error) => {
      console.error(error);
      if (oElem) {
        oElem.className = 'server-is-offline';
      }
    });
}


export async function getCacheStorageInfo() {
  const message = await navigator.storage.estimate().then((estimate) => {
    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2)
    const quota = (estimate.quota / 1024 / 1024).toFixed(2) + 'MB'
    const message = `You're currently using about ${percent}% of your estimated storage quota ${quota}`
    return message
  }).catch((error) => {return `Cannot estimate Cache Storage quota. ${error}`})
  return message
}

export async function getOpeyJWT() {
  const response = await axios.post('/api/opey/token').catch((error) => {
    if (error.response) {
      throw new Error(`getOpeyJWT returned an error: ${error.toJSON()}`);
      
    } else {
      throw new Error(`getOpeyJWT returned an error: ${error.message}`);
    }
  });
  const token = String(response?.data?.token)
  return token
}

export async function getOpeyConsent() {
  await axios.post('/api/opey/consent').catch((error) => {
    if (error.response) {
      throw new Error(`getOpeyConsent returned an error: ${error.toJSON()}`);
    } else {
      throw new Error(`getOpeyConsent returned an error: ${error.message}`);
    }
  }).then((response) => {
    console.log(response)
    return response
  });
}

export async function answerOpeyConsentChallenge(answerBody: any) {
  const response = await axios.post('/api/opey/consent/answer-challenge', answerBody).catch((error) => {
    if (error.response) {
      throw new Error(`answerOpeyConsentChallenge returned an error: ${error.toJSON()}`);
    } else {
      throw new Error(`answerOpeyConsentChallenge returned an error: ${error.message}`);
    }
  });
  return response
}

export function clearCacheByName(cacheName: string) {
  if ('caches' in window) {
    caches.delete(cacheName).then(function(success) {
      if (success) {
        console.log(`Cache ${cacheName} deleted successfully`);
      } else {
        console.log(`Failed to delete cache ${cacheName}`);
      }
    });
    caches.keys().then(function(keys) {
      if (keys.length === 0) {
        console.log('Cache exists but is empty');
        const oElem = document.getElementById('cache-storage-status')
        if (oElem) {
          oElem.className = 'host text-is-red'
        }
      }
    });
  }
  
}