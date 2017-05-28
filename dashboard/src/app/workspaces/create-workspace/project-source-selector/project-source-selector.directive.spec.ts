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
import {CheHttpBackend} from '../../../../components/api/test/che-http-backend';

/**
 * Test the project's source selector directive.
 */
describe('ProjectSourceSelector >', () => {

  let $rootScope, $compile, compiledDirective;

  /**
   * Backend for handling http operations
   */
  let httpBackend;

  /**
   *  setup module
   */
  beforeEach(angular.mock.module('userDashboard'));

  beforeEach(inject((_$compile_: ng.ICompileService,
                     _$rootScope_: ng.IRootScopeService,
                     cheHttpBackend: CheHttpBackend) => {
    $rootScope = _$rootScope_.$new();
    $compile = _$compile_;

    httpBackend = cheHttpBackend.getHttpBackend();
    // avoid tracking requests from branding controller
    httpBackend.whenGET(/.*/).respond(200, '');
    httpBackend.when('OPTIONS', '/api/').respond({});

    $rootScope.model = {};
  }));

  function getCompiledElement() {
    let element = $compile(angular.element('<project-source-selector></project-source-selector>'))($rootScope);
    $rootScope.$digest();
    return element;
  }

  // mocks are needed
  // describe()

});
