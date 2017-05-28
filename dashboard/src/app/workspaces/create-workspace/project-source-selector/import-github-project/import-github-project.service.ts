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

export enum LoadingState {
  NO_REPO, IDLE, LOADING, LOADED, LOAD_ERROR
}

/**
 * This class is handling the controller for the GitHub part
 * @author Stéphane Daviet
 * @author Florent Benoit
 * @author Oleksii Kurinnyi
 */
export class ImportGithubProjectService {
  /**
   * API entry point.
   */
  private cheAPI: CheAPI;
  /**
   * HTTP service.
   */
  private $http: ng.IHttpService;
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
  // private currentTokenCheck: any;
  /**
   * todo
   */
  private resolveOrganizationName: any;
  /**
   * todo
   */
  private organizations: string[];
  /**
   * todo
   */
  private gitHubRepositories: string[];
  /**
   * todo
   */
  private state: LoadingState;
  /**
   * <code>true</code> if GitHub OAuth provider is available.
   */
  private isGitHubOAuthProviderAvailable: boolean;
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
  private currentTokenCheck: any;
  /**
   * todo
   */
  private repositorySelectNotify: Function;

  /**
   * Default constructor that is using resource
   * @ngInject for Dependency injection
   */
  constructor (cheAPI: CheAPI, $http: ng.IHttpService, $q: ng.IQService, $window: ng.IWindowService, $mdDialog: ng.material.IDialogService, $location: ng.ILocationService, $browser: ng.IBrowserService, $modal: any, $filter: ng.IFilterService, $timeout: ng.ITimeoutService, GitHub: any, githubPopup: any, gitHubTokenStore: any, cheBranding: CheBranding, githubOrganizationNameResolver: any) {
    this.cheAPI = cheAPI;
    this.$http = $http;
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

    this.productName = cheBranding.getName();

    this.profile = cheAPI.getProfile().getProfile();

    this.currentTokenCheck = null;
    this.resolveOrganizationName = this.githubOrganizationNameResolver.resolve;

    this.organizations = [];
    this.gitHubRepositories = [];

    this.state = LoadingState.IDLE;
    this.isGitHubOAuthProviderAvailable = false;
  }

  fetchAll(): ng.IPromise<any> {
    let oAuthProviderPromise = this.cheAPI.getOAuthProvider().fetchOAuthProviders().then(() => {
      this.isGitHubOAuthProviderAvailable = this.cheAPI.getOAuthProvider().isOAuthProviderRegistered('github');
    });

    // check token validity and load repositories
    return this.$q.all([
      oAuthProviderPromise,
      this.profile.$promise
    ]).then(() => {
      if (this.isGitHubOAuthProviderAvailable) {
        this.currentUserId = this.profile.userId;
        this.askLoad();
      } else {
        this.state = LoadingState.NO_REPO;
      }
    });
  }

  /**
   * todo
   */
  askLoad(): void {
    this.state = LoadingState.LOADING;
    this.checkTokenValidity().then(() => {
      this.loadRepositories();
    }).catch(() => {
      this.state = LoadingState.NO_REPO;
    });
  }

  /**
   * todo
   * let
   *
   * @return {IPromise<boolean>}
   */
  getAndStoreRemoteToken(): ng.IPromise<any> {
    return this.$http({method: 'GET', url: '/api/oauth/token?oauth_provider=github'}).then( (result: any) => {
      if (!result.data) {
        return false;
      }
      this.gitHubTokenStore.setToken(result.data.token);
      this.$http({method: 'POST', url: '/api/github/ssh/generate'});
      this.askLoad();
      return true;
    });
  }

  /**
   * todo
   * let
   *
   * @return {any}
   */
  checkTokenValidity(): ng.IPromise<any> {
    if (this.currentTokenCheck) {
      return this.currentTokenCheck;
    }
    this.currentTokenCheck = this.GitHub.user().get( () => {
      this.currentTokenCheck = null;
      return this.$q.defer().resolve(true);
    },  () => {
      this.currentTokenCheck = null;
      return this.$q.defer().reject(false);
    }).$promise;
    return this.currentTokenCheck;
  }

  /**
   * todo
   * let
   */
  checkGitHubAuthentication(): ng.IPromise<any> {
    return this.checkTokenValidity().then( () => {
      return this.$q.defer().resolve('true');
    });
  }

  /**
   * todo
   * let
   */
  loadRepositories(): void {
    this.checkGitHubAuthentication().then( () => {
      const user = this.GitHub.user().get();

      this.organizations.push(user);
      this.GitHub.organizations().query().$promise.then((organizations: any) => {

        this.organizations = this.organizations.concat(organizations);

        const organizationNames = []; // 'login'
        this.organizations.forEach((organization: any) => {
          if (organization.login) {
            organizationNames.push(organization.login);
          }
        });

        this.GitHub.userRepositories().query().$promise.then((repositories: any) => {
          this.gitHubRepositories = this.$filter('filter')(repositories, (repository: any) => {
            return organizationNames.indexOf(repository.owner.login) >= 0;
          });
          this.state = LoadingState.LOADED;
        });
      });
    }, function () {
      this.state = LoadingState.LOAD_ERROR;
    });
  }

  /**
   * todo
   *
   * @return {string[]}
   */
  getOrganizations(): any {
    return this.organizations;
  }

  /**
   * todo
   *
   * @return {string[]}
   */
  getGithubRepositories(): any {
    return this.gitHubRepositories;
  }

  /**
   * todo
   *
   * @return {LoadingState}
   */
  getState(): LoadingState {
    return this.state;
  }

  /**
   * todo
   *
   * @return {boolean|(()=>boolean)}
   */
  getIsGitHubOAuthProviderAvailable(): boolean {
    return this.isGitHubOAuthProviderAvailable;
  }

}
