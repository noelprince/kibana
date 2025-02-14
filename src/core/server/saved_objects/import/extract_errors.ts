/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { SavedObject } from '../service';
import { SavedObjectsImportError } from './types';

export function extractErrors(
  savedObjectResults: SavedObject[],
  savedObjectsToImport: SavedObject[]
) {
  const errors: SavedObjectsImportError[] = [];
  const originalSavedObjectsMap = new Map<string, SavedObject>();
  for (const savedObject of savedObjectsToImport) {
    originalSavedObjectsMap.set(`${savedObject.type}:${savedObject.id}`, savedObject);
  }
  for (const savedObject of savedObjectResults) {
    if (savedObject.error) {
      const originalSavedObject = originalSavedObjectsMap.get(
        `${savedObject.type}:${savedObject.id}`
      );
      const title =
        originalSavedObject &&
        originalSavedObject.attributes &&
        originalSavedObject.attributes.title;
      if (savedObject.error.statusCode === 409) {
        errors.push({
          id: savedObject.id,
          type: savedObject.type,
          title,
          error: {
            type: 'conflict',
          },
        });
        continue;
      }
      errors.push({
        id: savedObject.id,
        type: savedObject.type,
        title,
        error: {
          ...savedObject.error,
          type: 'unknown',
        },
      });
    }
  }
  return errors;
}
