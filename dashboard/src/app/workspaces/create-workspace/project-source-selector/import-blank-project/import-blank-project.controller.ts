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

import {ProjectSourceSelectorService} from '../project-source-selector.service';
import {ImportBlankProjectService} from './import-blank-project.service';
import {IProjectSourceSelectorServiceObserver} from '../project-source-selector-service.observer';
import {ProjectSource} from '../project-source.enum';

/**
 * This class is handling the controller for the blank project import.
 *
 * @author Oleksii Kurinnyi
 */
export class ImportBlankProjectController implements IProjectSourceSelectorServiceObserver {
  /**
   * Project selector service.
   */
  private projectSourceSelectorService: ProjectSourceSelectorService;
  /**
   * Importing blank project service.
   */
  private importBlankProjectService: ImportBlankProjectService;
  /**
   * Project's name.
   */
  private name: string;
  /**
   * Project's description.
   */
  private description: string;

  /**
   * Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor(projectSourceSelectorService: ProjectSourceSelectorService, importBlankProjectService: ImportBlankProjectService) {
    this.projectSourceSelectorService = projectSourceSelectorService;
    this.importBlankProjectService = importBlankProjectService;

    this.name = this.importBlankProjectService.name;
    this.description = this.importBlankProjectService.description;

    this.projectSourceSelectorService.subscribe(this.onProjectSourceSelectorServicePublish.bind(this));
  }

  /**
   * Callback which is called when project template is added to the list of ready-to-import projects.
   * Clears name and description.
   *
   * @param {ProjectSource} source the project's source
   */
  onProjectSourceSelectorServicePublish(source: ProjectSource): void {
    if (source !== ProjectSource.BLANK) {
      return;
    }

    this.name = '';
    this.description = '';

    this.onChanged();
  }

  /**
   * Callback which is called when project's name or description is changed.
   */
  onChanged(): void {
    this.importBlankProjectService.onChanged(this.name, this.description);
  }

  /**
   * Returns <code>true</code> name is unique in current workspace.
   *
   * @return {boolean}
   */
  isNameUnique(name: string): boolean {
    return this.projectSourceSelectorService.isProjectTemplateNameUnique(name);
  }

}
