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
package org.eclipse.che.ide.command.node;

import org.eclipse.che.api.promises.client.Promise;
import org.eclipse.che.ide.api.command.CommandImpl;
import org.eclipse.che.ide.api.data.tree.Node;
import org.eclipse.che.ide.api.data.tree.settings.NodeSettings;
import org.eclipse.che.ide.command.CommandUtils;
import org.eclipse.che.ide.project.node.SyntheticNode;
import org.eclipse.che.ide.ui.smartTree.presentation.NodePresentation;
import org.vectomatic.dom.svg.ui.SVGResource;

import java.util.List;

/** Abstract tree node that represents {@link CommandImpl}. */
class AbstractCommandNode extends SyntheticNode<CommandImpl> {

    private final CommandUtils commandUtils;

    AbstractCommandNode(CommandImpl data, NodeSettings nodeSettings, CommandUtils commandUtils) {
        super(data, nodeSettings);

        this.commandUtils = commandUtils;
    }

    @Override
    public void updatePresentation(NodePresentation presentation) {
        presentation.setPresentableText(getName());

        final SVGResource commandTypeIcon = commandUtils.getCommandTypeIcon(getData().getType());

        if (commandTypeIcon != null) {
            presentation.setPresentableIcon(commandTypeIcon);
        }
    }

    @Override
    public String getName() {
        return getData().getName();
    }

    @Override
    public boolean isLeaf() {
        return true;
    }

    @Override
    protected Promise<List<Node>> getChildrenImpl() {
        return null;
    }
}
