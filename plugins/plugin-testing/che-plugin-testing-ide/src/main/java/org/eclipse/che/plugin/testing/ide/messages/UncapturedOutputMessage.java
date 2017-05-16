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
package org.eclipse.che.plugin.testing.ide.messages;

import org.eclipse.che.api.testing.shared.messages.TestingMessageNames;
import org.eclipse.che.plugin.testing.ide.model.Printer.OutputType;

/**
 *
 */
public class UncapturedOutputMessage extends ClientTestingMessage {

    static {
        messageConstructors.put(TestingMessageNames.UNCAPTURED_OUTPUT, UncapturedOutputMessage::new);
    }

    UncapturedOutputMessage() {
    }

    @Override
    public void visit(TestingMessageVisitor visitor) {
        visitor.visitUncapturedOutput(this);
    }

    public String getOutput() {
        return getAttributeValue("output");
    }

    public OutputType getOutputType() {
        String outputType = getAttributeValue("outputType");
        return OutputType.valueOf(outputType);
    }
}