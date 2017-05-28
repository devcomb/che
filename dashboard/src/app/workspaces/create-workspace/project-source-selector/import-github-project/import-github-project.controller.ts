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

import {CheAPI} from '../../../../../components/api/che-api.factory';
import {CheBranding} from '../../../../../components/branding/che-branding.factory';
import {ImportGithubProjectService, LoadingState} from './import-github-project.service';

/**
 * This class is handling the controller for the GitHub part
 * @author Stéphane Daviet
 * @author Florent Benoit
 * @author Oleksii Kurinnyi
 */
export class ImportGithubProjectController {
  /**
   * API entry point.
   */
  private cheAPI: CheAPI;
  /**
   * HTTP service.
   */
  private $http: ng.IHttpService;
  /**
   * Root scope service.
   */
  private $rootScope: ng.IRootScopeService;
  /**
   * Promises service.
   */
  private $q: ng.IQService;
  /**
   * Windows service.
   */
  private $window: ng.IWindowService;
  /**
   * Material's dialog service.
   */
  private $mdDialog: ng.material.IDialogService;
  /**
   * Location service.
   */
  private $location: ng.ILocationService;
  /**
   * Browser service.
   */
  private $browser: ng.IBrowserService;
  /**
   * Modals service.
   */
  private $modal: any;
  /**
   * Filter service.
   */
  private $filter: ng.IFilterService;
  /**
   * Timeout service.
   */
  private $timeout: ng.ITimeoutService;
  /**
   * todo
   */
  private GitHub: any;
  /**
   * todo
   */
  private gitHubTokenStore: any;
  /**
   * todo
   */
  private githubPopup: any;
  /**
   * Branding data.
   */
  private cheBranding: CheBranding;
  /**
   * todo
   */
  private githubOrganizationNameResolver: any;
  /**
   * todo
   */
  private productName: string;
  /**
   * User's profile.
   */
  private profile: che.IProfile;
  /**
   * todo
   */
  private resolveOrganizationName: any;
  /**
   * todo
   */
  private loadingState: Object;
  /**
   * Current user ID.
   */
  private currentUserId: string;
  /**
   * todo
   */
  private selectedRepository: any;
  /**
   * todo
   */
  private repositorySelectNotify: Function;

  private importGithubProjectService: ImportGithubProjectService;
  /**
   * Number of selected GitHub projects.
   */
  private selectedRepositoriesNumber: number;
  /**
   * Lists helper.
   */
  private cheListHelper: che.widget.ICheListHelper;
  /**
   * todo
   */
  private repositoryFilter: {
    name: string;
  };
  /**
   * todo
   */
  private organizationFilter: {
    name: string;
  };

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor (cheAPI: CheAPI, $rootScope: ng.IRootScopeService, $http: ng.IHttpService, $q: ng.IQService, $window: ng.IWindowService, $mdDialog: ng.material.IDialogService, $location: ng.ILocationService, $browser: ng.IBrowserService, $modal: any, $filter: ng.IFilterService, $timeout: ng.ITimeoutService, $scope: ng.IScope, GitHub: any, githubPopup: any, gitHubTokenStore: any, cheBranding: CheBranding, githubOrganizationNameResolver: any,
               importGithubProjectService: ImportGithubProjectService, cheListHelperFactory: che.widget.ICheListHelperFactory) {
    this.cheAPI = cheAPI;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$window = $window;
    this.$mdDialog = $mdDialog;
    this.$location = $location;
    this.$browser = $browser;
    this.$modal = $modal;
    this.$filter = $filter;
    this.GitHub = GitHub;
    this.gitHubTokenStore = gitHubTokenStore;
    this.githubPopup = githubPopup;
    this.cheBranding = cheBranding;
    this.githubOrganizationNameResolver = githubOrganizationNameResolver;
    this.$timeout = $timeout;

    this.importGithubProjectService = importGithubProjectService;
    this.loadingState = LoadingState;

    this.productName = cheBranding.getName();

    this.profile = cheAPI.getProfile().getProfile();

    this.resolveOrganizationName = this.githubOrganizationNameResolver.resolve;

    this.currentUserId = this.profile.userId;
    this.importGithubProjectService.fetchAll();

    const helperId = 'import-github-project';
    this.cheListHelper = cheListHelperFactory.getHelper(helperId);
    $scope.$on('$destroy', () => {
      cheListHelperFactory.removeHelper(helperId);
    });

    this.repositoryFilter = {name: ''};
    this.organizationFilter = {name: ''};
  }

  /**
   * todo
   *
   * @return {LoadingState}
   */
  get state(): LoadingState {
    return this.importGithubProjectService.getState();
  }

  /**
   * todo
   *
   * @return {any}
   */
  get organizations(): any {
    return this.importGithubProjectService.getOrganizations();
  }

  get gitHubRepositories(): any {
    const repositories = this.importGithubProjectService.getGithubRepositories();
    // console.log('>>> repositories: ', repositories);
    this.cheListHelper.setList(repositories, 'clone_url');
    return this.importGithubProjectService.getGithubRepositories();
  }

  /**
   * todo
   */
  authenticateWithGitHub(): ng.IPromise<any> {
    if (!this.importGithubProjectService.getIsGitHubOAuthProviderAvailable()) {
      this.$mdDialog.show({
        controller: 'NoGithubOauthDialogController',
        controllerAs: 'noGithubOauthDialogController',
        bindToController: true,
        clickOutsideToClose: true,
        templateUrl: 'app/projects/create-project/github/oauth-dialog/no-github-oauth-dialog.html'
      });

      return;
    }

    const redirectUrl = this.$location.protocol() + '://'
      + this.$location.host() + ':'
      + this.$location.port()
      + (this.$browser as any).baseHref()
      + 'gitHubCallback.html';
    return this.githubPopup.open('/api/oauth/authenticate'
      + '?oauth_provider=github'
      + '&scope=' + ['user', 'repo', 'write:public_key'].join(',')
      + '&userId=' + this.currentUserId
      + '&redirect_after_login='
      + redirectUrl,
      {
        width: 1020,
        height: 618
      })
      .then( () => {
        return this.importGithubProjectService.getAndStoreRemoteToken();
      }, (rejectionReason: any) => {
        return this.$q.reject(rejectionReason);
      });
  }

  /**
   * todo remove
   *
   * @param gitHubRepository
   */
  selectRepository(gitHubRepository: any): void {
    this.selectedRepository = gitHubRepository;
    this.$timeout(() => {
      this.repositorySelectNotify();
      // broadcast event
      this.$rootScope.$broadcast('create-project-github:selected');
    });
  }

  /**
   * todo
   *
   * @param organization
   * @return {string|string}
   */
  resolveOrganizationType(organization: any): string {
    return organization.name ? 'Your account' : 'Your organization\'s account';
  }

  /**
   * Returns <code>true</code> if at least one project is selected in the list.
   * todo remove
   *
   * @return {boolean}
   */
  isRepositorySelected(): boolean {
    return this.selectedRepositoriesNumber > 0;
  }

  /**
   * Callback which is called when repository is clicked.
   */
  onRepositorySelected(): void {
    console.log('>>> ImportGithubProjectController.onRepositorySelected, arguments: ', arguments);
    console.log('>>> this.cheListHelper.getSelectedItems(): ', this.cheListHelper.getSelectedItems());

    this.selectedRepositoriesNumber = this.cheListHelper.getSelectedItems().length;
  }

  // callback when search value is changed
  // todo
  onSearchChanged(str: string): void {
    console.log('>>> ImportGithubProjectController.onSearchChanged, str: ', str);
    this.repositoryFilter.name = str;
    this.cheListHelper.applyFilter('name', this.repositoryFilter);

    this.selectedRepositoriesNumber = this.cheListHelper.getSelectedItems().length;
  };

  // callback when namespace is changed
  // todo
  onFilterChanged(label :  string): void {
    console.log('>>> ImportGithubProjectController.onFilterChanged, label: ', label);
    // if (label === this.ALL_NAMESPACES) {
    //   this.namespaceFilter.namespace = '';
    // } else {
    //   let namespace = this.cheNamespaceRegistry.getNamespaces().find((namespace: che.INamespace) => {
    //     return namespace.label === label;
    //   });
    //   this.namespaceFilter.namespace = namespace.id;
    // }
    // this.isExactMatch = (label === this.ALL_NAMESPACES) ? false : true;
    //
    // this.cheListHelper.applyFilter('namespace', this.namespaceFilter, this.isExactMatch);
    this.selectedRepositoriesNumber = this.cheListHelper.getSelectedItems().length;
  };

}

