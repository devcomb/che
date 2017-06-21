/*******************************************************************************
 * Copyright (c) 2012-2017 Codenvy, S.A.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   Codenvy, S.A. - initial API and implementation
 *******************************************************************************/
package org.eclipse.che.workspace.infrastructure.docker;

import org.eclipse.che.inject.ConfigurationException;
import org.eclipse.che.workspace.infrastructure.docker.server.InstallerEndpoint;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Provides values of docker installer endpoint that can be used by machines.
 *
 * @author Sergii Leshchenko
 */
public class DockerInstallerWsEndpointProvider implements Provider<String> {
    private String installerWsEndpoint;

    @Inject
    public DockerInstallerWsEndpointProvider(@Named("che.workspace.che_server_endpoint") String cheServerEndpoint) {
        try {
            URL url = new URL(cheServerEndpoint);
            boolean isSecure = "https".equals(url.getProtocol());
            this.installerWsEndpoint = isSecure ? "wss" : "ws" + "://" + url.getHost() + ":" + url.getPort()
                                                          + "/wsmaster" //TODO Remote hardcoded value
                                                          + InstallerEndpoint.INSTALLER_WEBSOCKET_ENDPOINT_BASE;
        } catch (MalformedURLException e) {
            throw new ConfigurationException("Configured invalid value '" + cheServerEndpoint +
                                             "' for che.workspace.che_server_ws_endpoint property.");
        }
    }

    @Override
    public String get() {
        return installerWsEndpoint;
    }
}
