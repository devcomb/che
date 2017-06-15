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

import {CheWorkspace} from '../../components/api/che-workspace.factory';
import {NamespaceSelectorSvc} from './create-workspace/namespace-selector/namespace-selector.service';
import {CreateWorkspaceSvc} from './create-workspace/create-workspace.service';
import {StackSelectorSvc} from './create-workspace/stack-selector/stack-selector.service';
import {TemplateSelectorSvc} from './create-workspace/project-source-selector/template-selector/template-selector.service';

export interface ICreateWorkspaceInitData {
  namespaceId: string;
  workspaces: Array<che.IWorkspace>;
  stacks: Array<che.IStack>;
  templates: Array<che.IProjectTemplate>;
}

/**
 * This class is handling the service for routes resolving.
 *
 * @author Oleksii Kurinnyi
 */
export class WorkspaceConfigService {
  /**
   * Log service.
   */
  private $log: ng.ILogService;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Workspace API interaction.
   */
  private cheWorkspace: CheWorkspace;
  /**
   * Namespace selector service.
   */
  private namespaceSelectorSvc: NamespaceSelectorSvc;
  /**
   * Workspace creating service.
   */
  private createWorkspaceSvc: CreateWorkspaceSvc;
  /**
   * Stack selector service.
   */
  private stackSelectorSvc: StackSelectorSvc;
  /**
   * Template selector service.
   */
  private templateSelectorSvc: TemplateSelectorSvc;

  /** Default constructor that is using resource injection
   * @ngInject for Dependency injection
   */
  constructor($log: ng.ILogService, $q: ng.IQService, cheWorkspace: CheWorkspace, namespaceSelectorSvc: NamespaceSelectorSvc, createWorkspaceSvc: CreateWorkspaceSvc, stackSelectorSvc: StackSelectorSvc, templateSelectorSvc: TemplateSelectorSvc) {
    this.$log = $log;
    this.$q = $q;
    this.cheWorkspace = cheWorkspace;
    this.namespaceSelectorSvc = namespaceSelectorSvc;
    this.createWorkspaceSvc = createWorkspaceSvc;
    this.stackSelectorSvc = stackSelectorSvc;
    this.templateSelectorSvc = templateSelectorSvc;
  }

  /**
   * Returns promise to resolve route for workspace creation page.
   *
   * @return {ng.IPromise<ICreateWorkspaceInitData>}
   */
  resolveCreateWorkspaceRoute(): ng.IPromise<ICreateWorkspaceInitData> {
    const namespaceIdDefer = this.$q.defer(),
          workspacesDefer = this.$q.defer();

    // resolve namespace ID, workspaces in namespace
    this.namespaceSelectorSvc.fetchNamespaces().then((namespaceId: string) => {
      namespaceIdDefer.resolve(namespaceId);

      if (!namespaceId) {
        return this.$q.reject();
      }

      return this.createWorkspaceSvc.fetchWorkspacesByNamespace(namespaceId);
    }).then((workspaces: Array<che.IWorkspace>) => {
      workspacesDefer.resolve(workspaces);
    }, (error: any) => {
      this.logError(error);
      workspacesDefer.resolve([]);
    });

    return this.$q.all({
      namespaceId: namespaceIdDefer.promise,
      workspaces: workspacesDefer.promise,
      stacks: this.stackSelectorSvc.getOrFetchStacks(),
      templates: this.templateSelectorSvc.getOrFetchTemplates()
    }).then((results: ICreateWorkspaceInitData) => {
      return results;
    });
  }

  /**
   * Prints error message.
   *
   * @param {any} error error object or string
   */
  private logError(error: any): void {
    if (!error) {
      return;
    }
    const message = error.data && error.data.message ? error.data.message : error;
    this.$log.error(message);
  }
}
