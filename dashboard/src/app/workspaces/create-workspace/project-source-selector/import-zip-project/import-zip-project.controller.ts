/*
 * Copyright (c) 2015-2017 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 */
'use strict';

import {ImportZipProjectService} from './import-zip-project.service';
import {ProjectSourceSelectorService} from '../project-source-selector.service';
import {IProjectSourceSelectorServiceObserver} from '../project-source-selector-service.observer';
import {ProjectSource} from '../project-source.enum';

/**
 * This class is handling the controller for the Zip project import.
 *
 * @author Oleksii Kurinnyi
 */
export class ImportZipProjectController implements IProjectSourceSelectorServiceObserver {
  /**
   * Import Zip project service.
   */
  private importZipProjectService: ImportZipProjectService;
  /**
   * Project source selector service.
   */
  private projectSourceSelectorService: ProjectSourceSelectorService;
  /**
   * Zip repository location.
   */
  private location: string;
  /**
   * Skip the root folder of archive if <code>true</code>
   */
  private skipFirstLevel: boolean;

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor(importZipProjectService: ImportZipProjectService, projectSourceSelectorService: ProjectSourceSelectorService) {
    this.importZipProjectService = importZipProjectService;
    this.projectSourceSelectorService = projectSourceSelectorService;

    this.location = this.importZipProjectService.location;
    this.skipFirstLevel = this.importZipProjectService.skipFirstLevel;

    this.projectSourceSelectorService.subscribe(this.onProjectSourceSelectorServicePublish.bind(this));
  }

  /**
   * Callback which is called when project template is added to the list of ready-to-import projects.
   * Clears project's location.
   *
   * @param {ProjectSource} source the project's source
   */
  onProjectSourceSelectorServicePublish(source: ProjectSource): void {
    if (source !== ProjectSource.ZIP) {
      return;
    }

    this.location = '';
    this.skipFirstLevel = false;

    this.importZipProjectService.onChanged();
  }

  /**
   * Callback which is called when location or source parameter is changed.
   *
   * @param {string} location the zip project's location
   */
  onUrlChanged(location: string): void {
    this.importZipProjectService.onChanged(location, this.skipFirstLevel);
  }

  /**
   * Callback which is called when location or source parameter is changed.
   */
  onCheckboxChanged(): void {
    this.importZipProjectService.onChanged(this.location, this.skipFirstLevel);
  }
}
